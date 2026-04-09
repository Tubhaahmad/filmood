"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useParticipantId } from "@/lib/useParticipantId";
import { useGroupRealtime } from "@/lib/useGroupRealtime";
import { getAuthHeaders } from "@/lib/getAuthToken";
import { allMoods } from "@/lib/moodMap";
import Breadcrumb from "@/components/Breadcrumb";
import MoodCard from "@/components/dashboard/MoodCard";

type Phase = "selecting" | "submitting" | "waiting" | "building";

interface SessionInfo {
  id: string;
  status: string;
}

interface ParticipantProgress {
  id: string;
  nickname: string;
  hasSubmitted: boolean;
}

export default function GroupMoodPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>("selecting");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
  const [participants, setParticipants] = useState<ParticipantProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const { participantId } = useParticipantId();
  const redirectingRef = useRef(false);
  const buildingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (buildingTimerRef.current) clearTimeout(buildingTimerRef.current);
    };
  }, []);

  const fetchState = useCallback(async () => {
    if (redirectingRef.current) return;

    try {
      const res = await fetch(`/api/group/${code}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load session");
        return;
      }

      setSessionInfo({ id: data.session.id, status: data.session.status });

      // Handle status transitions
      if (data.session.status === "swiping") {
        setPhase("building");
        redirectingRef.current = true;
        buildingTimerRef.current = setTimeout(() => {
          router.replace(`/group/${code}/swipe`);
        }, 1500);
        return;
      }
      if (data.session.status === "done") {
        redirectingRef.current = true;
        router.replace(`/group/${code}/results`);
        return;
      }
      if (data.session.status === "lobby") {
        redirectingRef.current = true;
        router.replace(`/group/${code}`);
        return;
      }

      // Map participants to progress
      const progress: ParticipantProgress[] = data.participants.map(
        (p: { id: string; nickname: string; mood_selections: string[] | null }) => ({
          id: p.id,
          nickname: p.nickname,
          hasSubmitted: p.mood_selections !== null && p.mood_selections.length > 0,
        }),
      );
      setParticipants(progress);

      // Check if current user already submitted
      const self = data.participants.find(
        (p: { user_id: string | null; id: string; mood_selections: string[] | null }) => {
          if (user) return p.user_id === user.id;
          return p.id === participantId;
        },
      );

      if (self?.mood_selections && self.mood_selections.length > 0) {
        setPhase((prev) => prev === "building" ? prev : "waiting");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [code, router, user, participantId]);

  // Initial fetch
  useEffect(() => {
    if (!authLoading) {
      fetchState();
    }
  }, [authLoading, fetchState]);

  // Store sessionId
  useEffect(() => {
    if (sessionInfo && !sessionId) {
      setSessionId(sessionInfo.id);
    }
  }, [sessionInfo, sessionId]);

  // Realtime + polling
  useGroupRealtime({
    sessionId,
    channelPrefix: "mood",
    onUpdate: fetchState,
    paused: loading || phase === "building",
  });

  const toggleMood = (key: string) => {
    if (phase !== "selecting") return;
    setSelectedMoods((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedMoods.size === 0) return;
    setPhase("submitting");
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const isGuest = !headers.Authorization;

      const body: { moods: string[]; participantId?: string } = {
        moods: Array.from(selectedMoods),
      };
      if (isGuest && participantId) {
        body.participantId = participantId;
      }

      const res = await fetch(`/api/group/${code}/mood`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit moods");
        setPhase("selecting");
        return;
      }

      if (data.allDone) {
        setPhase("building");
        redirectingRef.current = true;
        buildingTimerRef.current = setTimeout(() => {
          router.replace(`/group/${code}/swipe`);
        }, 1500);
      } else {
        setPhase("waiting");
      }
    } catch {
      setError("Something went wrong");
      setPhase("selecting");
    }
  };

  const submittedCount = participants.filter((p) => p.hasSubmitted).length;
  const totalCount = participants.length;

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
              background: "var(--violet)",
              animation: "breathe 2s ease-in-out infinite",
            }}
          />
          <p
            className="font-sans"
            style={{ fontSize: "13px", color: "var(--t3)", fontWeight: 500 }}
          >
            Entering mood room...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error && !sessionInfo) {
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
          <p style={{ fontSize: "14px", color: "var(--rose)" }}>{error}</p>
          <button
            onClick={() => router.push(`/group/${code}`)}
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
            Back to lobby
          </button>
        </div>
      </main>
    );
  }

  // "Building deck" transition
  if (phase === "building") {
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
          <div style={{ position: "relative", width: "48px", height: "48px" }}>
            <div
              style={{
                position: "absolute",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--violet)",
                top: "0",
                left: "20px",
                animation: "breathe 1.2s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--teal)",
                bottom: "4px",
                left: "4px",
                animation: "breathe 1.2s ease-in-out infinite 0.3s",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--gold)",
                bottom: "4px",
                right: "4px",
                animation: "breathe 1.2s ease-in-out infinite 0.6s",
              }}
            />
          </div>
          <p
            className="font-serif"
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--t1)",
              letterSpacing: "-0.2px",
            }}
          >
            Building your deck
          </p>
          <p
            className="font-sans"
            style={{ fontSize: "13px", color: "var(--t3)" }}
          >
            Merging moods into films...
          </p>
        </div>
      </main>
    );
  }

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

      <div
        className="mx-auto"
        style={{
          maxWidth: "700px",
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
              { label: "Mood Selection" },
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
            {phase === "waiting" ? "Moods submitted" : "How do you feel?"}
          </h1>
          <p
            className="font-sans"
            style={{ fontSize: "14px", color: "var(--t2)", lineHeight: 1.5 }}
          >
            {phase === "waiting"
              ? "Waiting for everyone to choose"
              : "Your picks are private \u2014 no one else can see them"}
          </p>
        </div>

        {/* Hero — private label */}
        <div
          className="lobby-section-2 flex items-center justify-center gap-2"
          style={{ marginBottom: "24px", marginTop: "16px" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--violet)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span
            className="font-sans"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.8px",
              color: "var(--violet)",
            }}
          >
            Private selection
          </span>
        </div>

        {/* Single card — mood grid + actions */}
        <div
          className="lobby-section-3"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "22px",
          }}
        >
          {/* Mood grid */}
          <div
            style={{
              transition: "opacity 0.4s ease",
              opacity: phase === "waiting" ? 0.4 : 1,
              pointerEvents: phase === "waiting" ? "none" : "auto",
              marginBottom: "20px",
            }}
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 min-[700px]:grid-cols-4 min-[900px]:grid-cols-5">
              {allMoods.map((mood) => (
                <MoodCard
                  key={mood.key}
                  moodKey={mood.key}
                  tagLabel={mood.tagLabel}
                  label={mood.label}
                  description={mood.description}
                  accentColor={mood.accentColor}
                  isSelected={selectedMoods.has(mood.key)}
                  onSelect={toggleMood}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              marginBottom: "20px",
            }}
          />

          {/* Action section */}
          {phase === "selecting" || phase === "submitting" ? (
            <div className="flex flex-col items-center gap-3">
              {error && (
                <p style={{ fontSize: "13px", color: "var(--rose)" }}>{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={selectedMoods.size === 0 || phase === "submitting"}
                className="cursor-pointer font-sans"
                style={{
                  padding: "14px 36px",
                  borderRadius: "var(--r)",
                  background:
                    selectedMoods.size > 0 && phase !== "submitting"
                      ? "var(--violet)"
                      : "var(--surface2)",
                  color:
                    selectedMoods.size > 0 && phase !== "submitting"
                      ? "#fff"
                      : "var(--t3)",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  transition: "all 0.25s ease",
                  opacity: phase === "submitting" ? 0.7 : 1,
                  width: "100%",
                  maxWidth: "260px",
                }}
              >
                {phase === "submitting"
                  ? "Submitting..."
                  : selectedMoods.size > 0
                    ? `Lock in ${selectedMoods.size} mood${selectedMoods.size > 1 ? "s" : ""}`
                    : "Select at least one mood"}
              </button>

              <span
                className="font-sans"
                style={{ fontSize: "12px", color: "var(--t3)" }}
              >
                {selectedMoods.size > 0
                  ? "Once submitted, you cannot change your picks"
                  : "Tap the moods that match how you want to feel"}
              </span>
            </div>
          ) : (
            // Waiting state — progress view
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div style={{ position: "relative", width: "44px", height: "44px" }}>
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="var(--surface2)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="var(--violet)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${totalCount > 0 ? (submittedCount / totalCount) * 113 : 0} 113`}
                      style={{ transition: "stroke-dasharray 0.5s ease" }}
                    />
                  </svg>
                  <span
                    className="font-sans"
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--violet)",
                    }}
                  >
                    {submittedCount}/{totalCount}
                  </span>
                </div>

                <div>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--t1)",
                      marginBottom: "2px",
                    }}
                  >
                    {submittedCount === totalCount ? "Everyone is in" : "Waiting for moods"}
                  </p>
                  <p
                    className="font-sans"
                    style={{ fontSize: "12px", color: "var(--t3)" }}
                  >
                    {totalCount - submittedCount} still choosing
                  </p>
                </div>
              </div>

              <div
                className="w-full flex flex-col gap-2"
                style={{ maxWidth: "280px" }}
              >
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between font-sans"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: p.hasSubmitted ? "var(--violet-soft)" : "var(--surface2)",
                      border: `1px solid ${p.hasSubmitted ? "rgba(139,108,196,0.15)" : "var(--border)"}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: p.hasSubmitted ? "var(--t1)" : "var(--t3)",
                      }}
                    >
                      {p.nickname}
                    </span>
                    {p.hasSubmitted ? (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--violet)",
                        }}
                      >
                        Locked in
                      </span>
                    ) : (
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--t3)",
                          animation: "breathe 2s ease-in-out infinite",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
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
          Session {code}
        </p>
      </div>
    </main>
  );
}
