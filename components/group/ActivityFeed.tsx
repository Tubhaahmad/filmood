"use client";

export interface ActivityEvent {
  id: string;
  type: "join" | "leave" | "ready" | "unready" | "kick" | "created";
  nickname: string;
  timestamp: number;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function eventMessage(event: ActivityEvent): string {
  switch (event.type) {
    case "created":
      return `${event.nickname} created the session`;
    case "join":
      return `${event.nickname} joined the lobby`;
    case "leave":
      return `${event.nickname} left`;
    case "ready":
      return `${event.nickname} is ready`;
    case "unready":
      return `${event.nickname} is no longer ready`;
    case "kick":
      return `${event.nickname} was removed`;
    default:
      return "";
  }
}

function eventColor(type: ActivityEvent["type"]): string {
  switch (type) {
    case "join":
    case "created":
      return "var(--teal)";
    case "ready":
      return "var(--gold)";
    case "leave":
    case "kick":
      return "var(--rose)";
    case "unready":
      return "var(--t3)";
    default:
      return "var(--t3)";
  }
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) return null;

  const recent = events.slice(-8);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative left edge — thin accent line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "20%",
          bottom: "20%",
          width: "2px",
          background: "linear-gradient(to bottom, transparent, var(--teal), transparent)",
          opacity: 0.3,
        }}
      />

      <span
        className="font-sans"
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "var(--t3)",
          display: "block",
          marginBottom: "16px",
          paddingLeft: "12px",
        }}
      >
        Activity
      </span>

      <div
        className="lobby-feed-mask flex flex-col gap-3"
        style={{ paddingLeft: "12px" }}
      >
        {recent.map((event, i) => (
          <div
            key={event.id}
            className="flex items-center gap-3"
            style={{
              animation: "fadeUp 0.3s ease both",
              animationDelay: `${i * 40}ms`,
            }}
          >
            {/* Accent dot with glow */}
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: eventColor(event.type),
                flexShrink: 0,
                boxShadow: `0 0 6px ${eventColor(event.type)}`,
              }}
            />

            {/* Message */}
            <span
              className="font-sans"
              style={{
                fontSize: "12px",
                color: "var(--t2)",
                flex: 1,
                lineHeight: 1.4,
              }}
            >
              {eventMessage(event)}
            </span>

            {/* Timestamp */}
            <span
              className="font-sans"
              style={{
                fontSize: "10px",
                color: "var(--t3)",
                flexShrink: 0,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatTime(event.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
