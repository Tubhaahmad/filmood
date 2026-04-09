"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useParticipantId } from "@/lib/useParticipantId";
import { useGroupRealtime } from "@/lib/useGroupRealtime";
import Breadcrumb from "@/components/Breadcrumb";
import ParticipantList from "@/components/group/ParticipantList";
import LobbyActions from "@/components/group/LobbyActions";
import InviteStrip from "@/components/group/InviteStrip";
import ToastContainer from "@/components/group/Toast";
import { useToasts } from "@/components/group/useToasts";

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
  const { user, loading: authLoading } = useAuth();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState("");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const { participantId } = useParticipantId();
  const prevParticipantsRef = useRef<Participant[]>([]);
  const redirectingRef = useRef(false);
  const { toasts, addToast } = useToasts();

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

  // Diff participants to show toasts
  const diffParticipants = useCallback(
    (prev: Participant[], next: Participant[]) => {
      if (prev.length === 0) return;

      const prevIds = new Set(prev.map((p) => p.id));
      const nextIds = new Set(next.map((p) => p.id));

      for (const p of next) {
        if (!prevIds.has(p.id)) {
          addToast(`${p.nickname} joined`, "var(--teal)");
        }
      }

      for (const p of prev) {
        if (!nextIds.has(p.id)) {
          addToast(`${p.nickname} left`, "var(--rose)");
        }
      }

      for (const p of next) {
        const old = prev.find((o) => o.id === p.id);
        if (old && old.is_ready !== p.is_ready) {
          addToast(
            p.is_ready ? `${p.nickname} is ready` : `${p.nickname} unreadied`,
            "var(--teal)",
          );
        }
      }
    },
    [addToast],
  );

  const fetchLobby = useCallback(async () => {
    if (redirectingRef.current) return;

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

      // Handle status transitions
      const status = data.session.status;
      if (status === "mood" || status === "swiping" || status === "done") {
        redirectingRef.current = true;
        const target = status === "mood"
          ? `/group/${code}/mood`
          : status === "swiping"
            ? `/group/${code}/swipe`
            : `/group/${code}/results`;
        router.replace(target);
        return;
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [code, router, diffParticipants]);

  // Initial fetch
  useEffect(() => {
    if (!authLoading) {
      fetchLobby();
    }
  }, [authLoading, fetchLobby]);

  // Store sessionId for Realtime subscriptions
  useEffect(() => {
    if (sessionData && !sessionId) {
      setSessionId(sessionData.id);
    }
  }, [sessionData, sessionId]);

  // Realtime + polling
  useGroupRealtime({
    sessionId,
    channelPrefix: "lobby",
    onUpdate: fetchLobby,
    onDelete: () => router.replace("/group"),
    paused: loading,
  });

  // Session timer
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

  // Contextual subtitle based on state
  const getSubtitle = () => {
    if (!isInSession) return "Enter the code to join this session";
    if (participants.length < 2) return "Share the code and invite your friends";
    if (allReady && isHost) return "Everyone is ready \u2014 start when you want";
    if (allReady) return "Everyone is ready \u2014 waiting for host to start";
    const readyCount = participants.filter((p) => p.is_ready).length;
    return `${participants.length} joined \u2014 ${readyCount} of ${participants.length} ready`;
  };

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

  const readyCount = participants.filter((p) => p.is_ready).length;
  const fillPercent = (participants.length / MAX_PARTICIPANTS) * 100;

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
      <div className="lobby-ambient" />
      <ToastContainer toasts={toasts} />

      <div
        className="mx-auto"
        style={{
          maxWidth: "520px",
          padding: "48px 20px 60px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: "20px" }}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Group", href: "/group" },
              { label: `Lobby (${code})` },
            ]}
          />
        </div>

        {/* Hero — heading + subtitle */}
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
            style={{ fontSize: "14px", color: "var(--t2)", lineHeight: 1.5 }}
          >
            {getSubtitle()}
          </p>
        </div>

        {/* Hero — session code */}
        <div
          className="lobby-section-2"
          style={{ marginBottom: "28px", marginTop: "20px" }}
        >
          <InviteStrip code={code} />
        </div>

        {/* Single card — participants + actions */}
        <div
          className="lobby-section-3"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "24px 20px",
          }}
        >
          {/* Participants header */}
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
                style={{ fontSize: "11px", fontWeight: 500, color: "var(--teal)" }}
              >
                {readyCount}/{participants.length} ready
              </span>
              <span
                className="font-sans"
                style={{ fontSize: "11px", fontWeight: 600, color: "var(--t3)" }}
              >
                {participants.length}/{MAX_PARTICIPANTS}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: "3px",
              background: "var(--surface2)",
              borderRadius: "2px",
              overflow: "hidden",
              marginBottom: "20px",
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
              }}
            />
          </div>

          {/* Participant grid */}
          <div style={{ marginBottom: "24px" }}>
            <ParticipantList
              participants={participants}
              hostId={sessionData.host_id}
              isHost={isHost}
              sessionCode={code}
            />
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              marginBottom: "20px",
            }}
          />

          {/* Actions */}
          {isInSession ? (
            <LobbyActions
              isHost={isHost}
              participantCount={participants.length}
              allReady={allReady}
              selfReady={selfReady}
              sessionCode={code}
              participantId={participantId}
              onSessionStarted={() => {
                redirectingRef.current = true;
                router.replace(`/group/${code}/mood`);
              }}
              onReadyToggled={fetchLobby}
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

        {/* Footer meta */}
        <p
          className="lobby-section-4 font-sans text-center"
          style={{
            fontSize: "11px",
            color: "var(--t3)",
            marginTop: "16px",
          }}
        >
          Session {code} &middot; open for {elapsed}
        </p>
      </div>
    </main>
  );
}
