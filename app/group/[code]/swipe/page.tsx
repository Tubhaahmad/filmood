"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useParticipantId } from "@/lib/useParticipantId";
import { useGroupRealtime } from "@/lib/useGroupRealtime";
import { getAuthHeaders } from "@/lib/getAuthToken";
import Breadcrumb from "@/components/Breadcrumb";
import SwipeDeck from "@/components/group/SwipeDeck";
import type { DeckFilm, SwipeVote } from "@/lib/types";
import { AVATAR_COLORS } from "@/lib/constants";

interface ParticipantStatus {
  id: string;
  user_id: string | null;
  nickname: string;
  has_swiped: boolean;
}

export default function GroupSwipePage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [deck, setDeck] = useState<DeckFilm[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [, setSessionStatus] = useState<string>("swiping");
  const [myVotes, setMyVotes] = useState<Record<string, SwipeVote>>({});
  const [isDone, setIsDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const { participantId, ready: participantIdReady } = useParticipantId();
  const redirectingRef = useRef(false);

  const fetchSwipeState = useCallback(async () => {
    if (redirectingRef.current) return;
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const isGuest = !headers.Authorization;
      const pidParam =
        isGuest && participantId
          ? `?participantId=${participantId}`
          : "";

      const res = await fetch(`/api/group/${code}/swipe${pidParam}`, {
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "Session is not in swiping phase") {
          const lobbyRes = await fetch(`/api/group/${code}`);
          const lobbyData = await lobbyRes.json();
          if (lobbyData.session?.status === "done") {
            redirectingRef.current = true;
            router.replace(`/group/${code}/results`);
            return;
          }
          if (lobbyData.session?.status === "lobby") {
            redirectingRef.current = true;
            router.replace(`/group/${code}`);
            return;
          }
          if (lobbyData.session?.status === "mood") {
            redirectingRef.current = true;
            router.replace(`/group/${code}/mood`);
            return;
          }
        }
        setError(data.error || "Failed to load session");
        return;
      }

      const data = await res.json();

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      setDeck(data.deck);
      setParticipants(data.participants);
      setSessionStatus(data.sessionStatus);

      setMyVotes((prev) => {
        const merged = { ...prev };
        for (const s of data.swipes) {
          merged[String(s.movie_id)] = s.vote;
        }
        return merged;
      });
      setStartIndex((prev) => Math.max(prev, data.progress.swiped));

      const currentPid = participantId;
      const me = data.participants.find((p: ParticipantStatus) => {
        if (user) return p.user_id === user.id;
        return p.id === currentPid;
      });
      if (me?.has_swiped || data.progress.swiped >= data.progress.total) {
        setIsDone(true);
      }

      const everyoneDone = data.participants.every(
        (p: ParticipantStatus) => p.has_swiped,
      );
      setAllDone(everyoneDone);

      if (data.sessionStatus === "done") {
        setAllDone(true);
        setIsDone(true);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [code, router, user, participantId, sessionId]);

  useEffect(() => {
    if (!authLoading && participantIdReady) fetchSwipeState();
  }, [authLoading, participantIdReady, fetchSwipeState]);

  // Detect local completion — all cards in the deck have a vote
  useEffect(() => {
    if (deck.length > 0 && Object.keys(myVotes).length >= deck.length) {
      setIsDone(true);
    }
  }, [myVotes, deck.length]);

  // Realtime + polling
  useGroupRealtime({
    sessionId,
    channelPrefix: "swipe",
    onUpdate: fetchSwipeState,
    paused: loading,
  });

  const sendVote = useCallback(
    async (movieId: number, vote: SwipeVote) => {
      const headers = await getAuthHeaders();
      const isGuest = !headers.Authorization;

      const body: { movieId: number; vote: SwipeVote; participantId?: string } = {
        movieId,
        vote,
      };
      if (isGuest && participantId) {
        body.participantId = participantId;
      }

      const res = await fetch(`/api/group/${code}/swipe`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      return res;
    },
    [code, participantId],
  );

  const handleVote = useCallback(
    async (movieId: number, vote: SwipeVote) => {
      // Optimistic — the card is already gone from SwipeDeck, so we never
      // roll this back. If the POST fails we retry once; the polling will
      // eventually sync the server state regardless.
      setMyVotes((prev) => ({ ...prev, [String(movieId)]: vote }));

      try {
        const res = await sendVote(movieId, vote);

        if (res.ok) {
          const data = await res.json();
          if (data.participantDone) setIsDone(true);
          if (data.allDone) setAllDone(true);
          return;
        }

        // 409 = already recorded, nothing to retry
        if (res.status === 409) return;

        // Other server error — retry once after a short delay
        await new Promise((r) => setTimeout(r, 800));
        const retry = await sendVote(movieId, vote);
        if (retry.ok) {
          const data = await retry.json();
          if (data.participantDone) setIsDone(true);
          if (data.allDone) setAllDone(true);
        }
      } catch {
        // Network error — retry once
        try {
          await new Promise((r) => setTimeout(r, 800));
          const retry = await sendVote(movieId, vote);
          if (retry.ok) {
            const data = await retry.json();
            if (data.participantDone) setIsDone(true);
            if (data.allDone) setAllDone(true);
          }
        } catch {
          // Both attempts failed — the optimistic vote stays in myVotes
          // so the done screen still shows. Polling will sync server state.
        }
      }
    },
    [sendVote],
  );

  const voteCounts = Object.values(myVotes).reduce(
    (acc, v) => {
      acc[v]++;
      return acc;
    },
    { yes: 0, no: 0, maybe: 0 } as Record<SwipeVote, number>,
  );

  const finishedCount = participants.filter((p) => p.has_swiped).length;
  const totalParticipants = participants.length;
  const swiped = Object.keys(myVotes).length;
  const totalCards = deck.length;
  const progressPercent = totalCards > 0 ? (swiped / totalCards) * 100 : 0;

  // Loading
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
              background: "var(--gold)",
              animation: "breathe 2s ease-in-out infinite",
            }}
          />
          <p className="font-sans" style={{ fontSize: "13px", color: "var(--t3)", fontWeight: 500 }}>
            Loading deck...
          </p>
        </div>
      </main>
    );
  }

  // Error
  if (error && deck.length === 0) {
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

      {/* Breadcrumb */}
      <div style={{ padding: "14px 28px 0", position: "relative", zIndex: 2 }}>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Group", href: "/group" },
            { label: "Swipe" },
          ]}
        />
      </div>

      {/* Progress strip */}
      <div
        className="lobby-section-1"
        style={{
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="font-sans" style={{ fontSize: "13px", color: "var(--t2)", whiteSpace: "nowrap" }}>
          Film <strong style={{ color: "var(--t1)", fontWeight: 700 }}>{Math.min(swiped + 1, totalCards)}</strong> of{" "}
          <strong style={{ color: "var(--t1)", fontWeight: 700 }}>{totalCards}</strong>
        </div>
        <div
          style={{
            flex: 1,
            height: "3px",
            background: "var(--surface3)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "var(--gold)",
              borderRadius: "2px",
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              width: `${progressPercent}%`,
            }}
          />
        </div>
        <div className="font-sans" style={{ fontSize: "11px", color: "var(--t3)", whiteSpace: "nowrap" }}>
          {totalCards - swiped} left
        </div>

        {/* Group participant dots */}
        <div
          className="swipe-group-dots"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            marginLeft: "auto",
          }}
        >
          {participants.map((p, i) => {
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const initial = p.nickname?.[0]?.toUpperCase() || "?";
            return (
              <div
                key={p.id}
                title={`${p.nickname}${p.has_swiped ? " (done)" : ""}`}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "7px",
                  fontWeight: 700,
                  fontFamily: "var(--sans)",
                  background: color.bg,
                  color: color.text,
                  opacity: p.has_swiped ? 0.35 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                {initial}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main card area */}
      <div
        className="lobby-section-2"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px 32px",
          maxWidth: "820px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {!isDone ? (
          <SwipeDeck
            deck={deck}
            startIndex={startIndex}
            onVote={handleVote}
            disabled={isDone}
          />
        ) : (
          /* Done state */
          <div
            style={{
              textAlign: "center",
              animation: "fadeUp 0.5s ease both",
              padding: "40px 20px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--teal-soft)",
                border: "1.5px solid rgba(90,170,143,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l5.5 5.5 8.5-8.5" />
              </svg>
            </div>

            <h2 className="font-serif" style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "var(--t1)",
              marginBottom: "6px",
            }}>
              All films rated
            </h2>
            <p className="font-sans" style={{
              fontSize: "13px",
              color: "var(--t2)",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}>
              Here&apos;s how you voted on the {totalCards}-film deck.
            </p>

            {/* Vote summary */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "28px",
              marginBottom: "28px",
            }}>
              {[
                { label: "Yes", count: voteCounts.yes, color: "var(--teal)" },
                { label: "Maybe", count: voteCounts.maybe, color: "var(--gold)" },
                { label: "No", count: voteCounts.no, color: "var(--rose)" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <span className="font-sans" style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1, color: item.color }}>
                    {item.count}
                  </span>
                  <span className="font-sans" style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--t3)",
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Waiting or results */}
            {!allDone ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div className="font-sans" style={{ fontSize: "13px", fontWeight: 600, color: "var(--t2)" }}>
                  {finishedCount} of {totalParticipants} finished
                </div>
                <div className="font-sans" style={{
                  fontSize: "12px",
                  color: "var(--t3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  Waiting for others
                  <span style={{ display: "inline-flex", gap: "3px" }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: "3px",
                          height: "3px",
                          borderRadius: "50%",
                          background: "var(--t3)",
                          animation: "breathe 1.4s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </span>
                </div>

                {/* Participant status */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  width: "100%",
                  maxWidth: "260px",
                  marginTop: "4px",
                }}>
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="font-sans"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: p.has_swiped ? "var(--teal-soft)" : "var(--surface2)",
                        border: `1px solid ${p.has_swiped ? "rgba(90,170,143,0.15)" : "var(--border)"}`,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <span style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: p.has_swiped ? "var(--t1)" : "var(--t3)",
                      }}>
                        {p.nickname}
                      </span>
                      {p.has_swiped ? (
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--teal)" }}>
                          Done
                        </span>
                      ) : (
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--t3)",
                          animation: "breathe 2s ease-in-out infinite",
                          display: "inline-block",
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                className="font-sans cursor-pointer"
                onClick={() => router.replace(`/group/${code}/results`)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 32px",
                  borderRadius: "10px",
                  background: "var(--gold)",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0a0a0c",
                  transition: "all 0.25s",
                  animation: "fadeUp 0.4s ease both 0.2s",
                }}
              >
                See group results &rarr;
              </button>
            )}
          </div>
        )}
      </div>

      {/* Session footer */}
      <p
        className="lobby-section-4 font-sans text-center"
        style={{
          fontSize: "11px",
          color: "var(--t3)",
          padding: "0 0 24px",
          position: "relative",
          zIndex: 2,
        }}
      >
        Session {code}
      </p>
    </main>
  );
}
