"use client";

import { useState } from "react";

interface Participant {
  id: string;
  nickname: string;
  user_id: string | null;
  is_ready: boolean;
  joined_at: string;
}

interface ParticipantListProps {
  participants: Participant[];
  hostId: string;
  isHost: boolean;
  sessionCode: string;
  accessToken: string | undefined;
}

const AVATAR_COLORS = [
  "var(--teal)",
  "var(--gold)",
  "var(--blue)",
  "var(--violet)",
  "var(--rose)",
  "var(--ember)",
];

const AVATAR_GLOWS = [
  "var(--teal-glow)",
  "var(--gold-glow)",
  "var(--blue-glow)",
  "var(--violet-glow)",
  "var(--rose-glow)",
  "var(--ember-glow)",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ParticipantList({
  participants,
  hostId,
  isHost,
  sessionCode,
  accessToken,
}: ParticipantListProps) {
  const [kickingId, setKickingId] = useState<string | null>(null);

  const handleKick = async (participantId: string) => {
    if (!confirm("Remove this person from the session?")) return;

    setKickingId(participantId);
    try {
      await fetch(`/api/group/${sessionCode}/kick`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ participantId }),
      });
    } finally {
      setKickingId(null);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
        gap: "20px",
        justifyItems: "center",
      }}
    >
      {participants.map((p, i) => {
        const isThisHost = p.user_id === hostId;
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const glow = AVATAR_GLOWS[i % AVATAR_GLOWS.length];

        return (
          <div
            key={p.id}
            className="flex flex-col items-center gap-2"
            style={{
              animation: "popIn 0.4s ease both",
              animationDelay: `${i * 80}ms`,
              position: "relative",
            }}
          >
            {/* Avatar with aura */}
            <div style={{ position: "relative" }}>
              {/* Aura ring — visible when ready */}
              {p.is_ready && (
                <div
                  style={{
                    position: "absolute",
                    inset: "-8px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${glow} 30%, transparent 70%)`,
                    opacity: 0.8,
                    animation: "breathe 3s ease-in-out infinite",
                    animationDelay: `${i * 200}ms`,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Avatar circle */}
              <div
                style={{
                  position: "relative",
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: `color-mix(in srgb, ${color} 12%, var(--surface2))`,
                  border: `2px solid ${p.is_ready ? color : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: color,
                  letterSpacing: "0.5px",
                  transition: "border-color 0.4s ease, box-shadow 0.4s ease",
                  boxShadow: p.is_ready
                    ? `0 0 16px ${glow}`
                    : "none",
                  zIndex: 1,
                }}
              >
                {getInitials(p.nickname)}

                {/* Host star */}
                {isThisHost && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-5px",
                      fontSize: "14px",
                      lineHeight: 1,
                      filter: "drop-shadow(0 0 4px var(--gold-glow))",
                    }}
                    title="Host"
                  >
                    &#9733;
                  </span>
                )}

                {/* Ready checkmark */}
                {p.is_ready && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-3px",
                      right: "-3px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "var(--teal)",
                      color: "#0a0a0c",
                      fontSize: "10px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "popIn 0.3s ease both",
                      boxShadow: "0 0 8px var(--teal-glow)",
                      zIndex: 2,
                    }}
                  >
                    &#10003;
                  </span>
                )}
              </div>
            </div>

            {/* Name */}
            <span
              className="font-sans"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: isThisHost ? "var(--t1)" : "var(--t2)",
                textAlign: "center",
                maxWidth: "90px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.nickname}
            </span>

            {/* Role label */}
            <span
              className="font-sans"
              style={{
                fontSize: "9px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                color: isThisHost
                  ? "var(--teal)"
                  : p.is_ready
                    ? "var(--gold)"
                    : "var(--t3)",
              }}
            >
              {isThisHost ? "Host" : p.is_ready ? "Ready" : p.user_id ? "Member" : "Guest"}
            </span>

            {/* Kick button */}
            {isHost && !isThisHost && (
              <button
                onClick={() => handleKick(p.id)}
                disabled={kickingId === p.id}
                className="cursor-pointer font-sans"
                style={{
                  fontSize: "9px",
                  fontWeight: 500,
                  color: "var(--t3)",
                  background: "none",
                  border: "none",
                  padding: "2px 6px",
                  transition: "color var(--t-fast)",
                  opacity: kickingId === p.id ? 0.5 : 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--rose)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
              >
                {kickingId === p.id ? "..." : "Remove"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
