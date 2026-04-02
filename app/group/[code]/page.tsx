"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import ParticipantList from "@/components/group/ParticipantList";
import LobbyActions from "@/components/group/LobbyActions";
import InviteStrip from "@/components/group/InviteStrip";
import ActivityFeed from "@/components/group/ActivityFeed";
import type { ActivityEvent } from "@/components/group/ActivityFeed";

interface SessionData {
  id: string;
  code: string;
  host_id: string;
  status: string;
  created_at: string;
}

interface Participant {
  id: string;
  nickname: string;
  user_id: string | null;
  is_ready: boolean;
  joined_at: string;
}

const MAX_PARTICIPANTS = 10;

export default function LobbyPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const { user, session: authSession, loading: authLoading } = useAuth();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [elapsed, setElapsed] = useState("");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const prevParticipantsRef = useRef<Participant[]>([]);

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem("participantId")
      : null;

  const isHost = user ? user.id === sessionData?.host_id : false;

  const isInSession = participants.some((p) => {
    if (user) return p.user_id === user.id;
    return p.id === participantId;
  });

  const allReady = participants.length >= 2 && participants.every((p) => p.is_ready);

  const selfReady = participants.find((p) => {
    if (user) return p.user_id === user.id;
    return p.id === participantId;
  })?.is_ready ?? false;

  const addEvent = useCallback(
    (type: ActivityEvent["type"], nickname: string) => {
      setEvents((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          type,
          nickname,
          timestamp: Date.now(),
        },
      ]);
    },
    [],
  );

  const diffParticipants = useCallback(
    (prev: Participant[], next: Participant[]) => {
      if (prev.length === 0 && next.length > 0) {
        const host = next.find((p) => p.user_id !== null);
        if (host) {
          addEvent("created", host.nickname);
        }
        return;
      }

      const prevIds = new Set(prev.map((p) => p.id));
      const nextIds = new Set(next.map((p) => p.id));

      for (const p of next) {
        if (!prevIds.has(p.id)) {
          addEvent("join", p.nickname);
        }
      }

      for (const p of prev) {
        if (!nextIds.has(p.id)) {
          addEvent("leave", p.nickname);
        }
      }

      for (const p of next) {
        const old = prev.find((o) => o.id === p.id);
        if (old && old.is_ready !== p.is_ready) {
          addEvent(p.is_ready ? "ready" : "unready", p.nickname);
        }
      }
    },
    [addEvent],
  );

  const fetchLobby = useCallback(async () => {
    try {
      const res = await fetch(`/api/group/${code}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load session");
        return;
      }

      setSessionData(data.session);

      diffParticipants(prevParticipantsRef.current, data.participants);
      prevParticipantsRef.current = data.participants;
      setParticipants(data.participants);

      if (data.session.status === "mood") {
        router.replace(`/group/${code}/mood`);
        return;
      }
      if (data.session.status === "swiping") {
        router.replace(`/group/${code}/swipe`);
        return;
      }
      if (data.session.status === "done") {
        router.replace(`/group/${code}/results`);
        return;
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [code, router, diffParticipants]);

  const fetchLobbyRef = useRef(fetchLobby);
  fetchLobbyRef.current = fetchLobby;

  useEffect(() => {
    if (!authLoading) {
      fetchLobby();
    }
  }, [authLoading, fetchLobby]);

  useEffect(() => {
    if (sessionData && !sessionId) {
      setSessionId(sessionData.id);
    }
  }, [sessionData, sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const participantsChannel = supabase
      .channel(`lobby-participants-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchLobbyRef.current();
        },
      )
      .subscribe();

    const sessionChannel = supabase
      .channel(`lobby-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            router.replace("/group");
            return;
          }

          if (payload.eventType === "UPDATE" && payload.new) {
            const newStatus = (payload.new as { status: string }).status;
            if (newStatus === "mood") {
              router.replace(`/group/${code}/mood`);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId, code, router]);

  useEffect(() => {
    if (!sessionData) return;

    const update = () => {
      const diff = Date.now() - new Date(sessionData.created_at).getTime();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(`${mins}:${secs.toString().padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sessionData]);

  // Loading state
  if (loading || authLoading) {
    return (
      <main
        className="lobby-grain min-h-screen font-sans"
        style={{ background: "var(--bg)", color: "var(--t1)" }}
      >
        <div className="lobby-ambient" />
        <div
          className="flex flex-col items-center justify-center gap-3"
          style={{ minHeight: "60vh", position: "relative", zIndex: 2 }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--teal)",
              animation: "breathe 2s ease-in-out infinite",
            }}
          />
          <p
            className="font-sans"
            style={{ fontSize: "13px", color: "var(--t3)", fontWeight: 500 }}
          >
            Entering lobby...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !sessionData) {
    return (
      <main
        className="lobby-grain min-h-screen font-sans"
        style={{ background: "var(--bg)", color: "var(--t1)" }}
      >
        <div className="lobby-ambient" />
        <div
          className="flex flex-col items-center justify-center gap-4"
          style={{ minHeight: "60vh", position: "relative", zIndex: 2 }}
        >
          <p style={{ fontSize: "14px", color: "var(--rose)" }}>
            {error || "Session not found"}
          </p>
          <button
            onClick={() => router.push("/group")}
            className="cursor-pointer font-sans"
            style={{
              padding: "10px 24px",
              borderRadius: "var(--r)",
              background: "none",
              color: "var(--t2)",
              fontSize: "13px",
              fontWeight: 500,
              border: "1px solid var(--border)",
            }}
          >
            Back to group
          </button>
        </div>
      </main>
    );
  }

  const fillPercent = (participants.length / MAX_PARTICIPANTS) * 100;
  const readyCount = participants.filter((p) => p.is_ready).length;

  return (
    <main
      className="lobby-grain min-h-screen font-sans"
      style={{
        background: "var(--bg)",
        color: "var(--t1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient projector glow */}
      <div className="lobby-ambient" />

      {/* Content */}
      <div
        className="mx-auto"
        style={{
          maxWidth: "560px",
          padding: "48px 20px 60px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <div className="lobby-section-1 text-center" style={{ marginBottom: "8px" }}>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(26px, 3.5vw, 34px)",
              fontWeight: 600,
              color: "var(--t1)",
              marginBottom: "8px",
              letterSpacing: "-0.3px",
            }}
          >
            Group lobby
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: "14px",
              color: "var(--t2)",
              lineHeight: 1.5,
            }}
          >
            {isHost
              ? "Share the code and start when everyone is ready"
              : "Mark yourself ready and wait for the host"}
          </p>
        </div>

        {/* Session timer */}
        <div
          className="lobby-section-1 text-center"
          style={{ marginBottom: "32px" }}
        >
          <span
            className="font-sans"
            style={{
              fontSize: "11px",
              color: "var(--t3)",
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Session open for {elapsed}
          </span>
        </div>

        {/* Invite strip */}
        <div className="lobby-section-2" style={{ marginBottom: "16px" }}>
          <InviteStrip code={code} />
        </div>

        {/* Participants section */}
        <div
          className="lobby-section-3"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "24px 20px",
            marginBottom: "16px",
          }}
        >
          {/* Header with count */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "12px" }}
          >
            <span
              className="font-sans"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--t3)",
              }}
            >
              In the lobby
            </span>
            <div className="flex items-center gap-3">
              <span
                className="font-sans"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--teal)",
                }}
              >
                {readyCount}/{participants.length} ready
              </span>
              <span
                className="font-sans"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--t3)",
                }}
              >
                {participants.length}/{MAX_PARTICIPANTS}
              </span>
            </div>
          </div>

          {/* Progress bar with glow */}
          <div
            style={{
              width: "100%",
              height: "3px",
              background: "var(--surface2)",
              borderRadius: "2px",
              overflow: "hidden",
              marginBottom: "24px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${fillPercent}%`,
                height: "100%",
                background: allReady
                  ? "var(--teal)"
                  : "linear-gradient(90deg, var(--teal), var(--gold))",
                borderRadius: "2px",
                transition: "width 0.5s ease",
                boxShadow: `0 0 8px ${allReady ? "var(--teal-glow)" : "var(--gold-glow)"}`,
              }}
            />
          </div>

          {/* Participant grid */}
          <ParticipantList
            participants={participants}
            hostId={sessionData.host_id}
            isHost={isHost}
            sessionCode={code}
            accessToken={authSession?.access_token}
          />
        </div>

        {/* Actions */}
        <div
          className="lobby-section-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "24px 20px",
            marginBottom: "16px",
          }}
        >
          {isInSession ? (
            <LobbyActions
              isHost={isHost}
              participantCount={participants.length}
              allReady={allReady}
              selfReady={selfReady}
              sessionCode={code}
              accessToken={authSession?.access_token}
              participantId={participantId}
              onSessionStarted={() => router.replace(`/group/${code}/mood`)}
              onLeft={() => router.replace("/group")}
              onDisbanded={() => router.replace("/group")}
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p
                className="font-sans"
                style={{ fontSize: "13px", color: "var(--t2)" }}
              >
                You are not part of this session
              </p>
              <button
                onClick={() => router.push(`/group?tab=join&code=${code}`)}
                className="cursor-pointer font-sans"
                style={{
                  padding: "10px 24px",
                  borderRadius: "var(--r)",
                  background: "var(--teal)",
                  color: "#0a0a0c",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                }}
              >
                Join this session
              </button>
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="lobby-section-5">
          <ActivityFeed events={events} />
        </div>
      </div>
    </main>
  );
}
