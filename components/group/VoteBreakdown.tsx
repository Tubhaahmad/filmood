"use client";

import type { SwipeVote } from "@/lib/types";
import { AVATAR_COLORS } from "@/lib/constants";

// Vote → color token. Kept as CSS vars so both themes resolve correctly.
const VOTE_COLORS: Record<SwipeVote, string> = {
  yes: "var(--teal)",
  maybe: "var(--gold)",
  no: "var(--rose)",
};

const VOTE_LABELS: Record<SwipeVote, string> = {
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
};

interface VoteBreakdownProps {
  votes: {
    participant_id: string;
    nickname: string;
    vote: SwipeVote | null;
  }[];
  /** "full" = stacked rows with nicknames; "compact" = tight avatar row */
  variant?: "full" | "compact";
}

export default function VoteBreakdown({
  votes,
  variant = "full",
}: VoteBreakdownProps) {
  if (variant === "compact") {
    return (
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {votes.map((v, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const voteColor = v.vote ? VOTE_COLORS[v.vote] : "var(--t3)";
          const initial = v.nickname?.[0]?.toUpperCase() || "?";
          return (
            <div
              key={v.participant_id}
              title={`${v.nickname}: ${v.vote ? VOTE_LABELS[v.vote] : "didn't vote"}`}
              style={{ position: "relative", width: "22px", height: "22px" }}
            >
              <div
                className="font-sans"
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  background: color.bg,
                  color: color.text,
                  opacity: v.vote === "no" ? 0.4 : 1,
                }}
              >
                {initial}
              </div>
              {/* Vote dot — sits on the bottom-right corner of the avatar */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: voteColor,
                  border: "1.5px solid var(--surface2)",
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Full variant — stacked rows with nickname + vote label
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
      }}
    >
      {votes.map((v, i) => {
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const voteColor = v.vote ? VOTE_COLORS[v.vote] : "var(--t3)";
        const initial = v.nickname?.[0]?.toUpperCase() || "?";
        return (
          <div
            key={v.participant_id}
            className="font-sans"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "10px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                background: color.bg,
                color: color.text,
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--t1)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {v.nickname}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: voteColor,
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: voteColor,
                }}
              />
              {v.vote ? VOTE_LABELS[v.vote] : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
