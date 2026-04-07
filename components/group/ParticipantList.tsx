"use client";

import { useState } from "react";
import { AVATAR_COLORS } from "@/lib/constants";
import { getAuthHeaders } from "@/lib/getAuthToken";

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
}

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
}: ParticipantListProps) {
  const [kickingId, setKickingId] = useState<string | null>(null);
  const [confirmKickId, setConfirmKickId] = useState<string | null>(null);
  const [kickError, setKickError] = useState<string | null>(null);

  const handleKick = async (participantId: string) => {
    setKickingId(participantId);
    setConfirmKickId(null);
    setKickError(null);

    try {
      const res = await fetch(`/api/group/${sessionCode}/kick`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ participantId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setKickError(data.error || "Failed to remove");
      }
    } catch {
      setKickError("Failed to remove");
    } finally {
      setKickingId(null);
    }
  };

  return (
    <div>
      {kickError && (
        <p
          className="font-sans text-center"
          style={{ fontSize: "12px", color: "var(--rose)", marginBottom: "12px" }}
        >
          {kickError}
        </p>
      )}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: participants.length <= 4
          ? `repeat(${Math.min(participants.length, 3)}, 1fr)`
          : "repeat(auto-fill, minmax(100px, 1fr))",
        gap: "12px",
      }}
    >
      {participants.map((p, i) => {
        const isThisHost = p.user_id === hostId;
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length].bg;

        return (
          <div
            key={p.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "16px 8px 12px",
              borderRadius: "12px",
              background: p.is_ready ? "var(--surface2)" : "transparent",
              border: `1px solid ${p.is_ready ? "var(--border-h)" : "var(--border)"}`,
              transition: "all 0.3s ease",
              animation: "popIn 0.4s ease both",
              animationDelay: `${i * 60}ms`,
              position: "relative",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: `color-mix(in srgb, ${color} 12%, var(--surface2))`,
                border: `2px solid ${p.is_ready ? color : "var(--border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 700,
                color: color,
                letterSpacing: "0.5px",
                transition: "border-color 0.3s ease",
                position: "relative",
              }}
            >
              {getInitials(p.nickname)}

              {/* Host star */}
              {isThisHost && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-4px",
                    fontSize: "13px",
                    lineHeight: 1,
                    color: "var(--gold)",
                    filter: "drop-shadow(0 0 3px var(--gold-glow))",
                  }}
                >
                  &#9733;
                </span>
              )}

              {/* Ready checkmark */}
              {p.is_ready && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "var(--teal)",
                    color: "#0a0a0c",
                    fontSize: "9px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "popIn 0.3s ease both",
                  }}
                >
                  &#10003;
                </span>
              )}
            </div>

            {/* Name */}
            <span
              className="font-sans"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--t1)",
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
                color: isThisHost ? "var(--gold)" : p.is_ready ? "var(--teal)" : "var(--t3)",
              }}
            >
              {isThisHost ? "Host" : p.is_ready ? "Ready" : "Joined"}
            </span>

            {/* Kick — two-step confirm */}
            {isHost && !isThisHost && (
              <div style={{ minHeight: "18px" }}>
                {confirmKickId === p.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleKick(p.id)}
                      disabled={kickingId === p.id}
                      className="cursor-pointer font-sans"
                      style={{
                        fontSize: "9px",
                        fontWeight: 600,
                        color: "var(--rose)",
                        background: "none",
                        border: "none",
                        padding: "2px 4px",
                      }}
                    >
                      {kickingId === p.id ? "..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmKickId(null)}
                      className="cursor-pointer font-sans"
                      style={{
                        fontSize: "9px",
                        fontWeight: 500,
                        color: "var(--t3)",
                        background: "none",
                        border: "none",
                        padding: "2px 4px",
                      }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmKickId(p.id)}
                    className="cursor-pointer font-sans"
                    style={{
                      fontSize: "9px",
                      fontWeight: 500,
                      color: "var(--t3)",
                      background: "none",
                      border: "none",
                      padding: "2px 4px",
                      transition: "color var(--t-fast)",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
    </div>
  );
}
