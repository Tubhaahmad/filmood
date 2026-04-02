"use client";

import { useState } from "react";

interface LobbyActionsProps {
  isHost: boolean;
  participantCount: number;
  allReady: boolean;
  selfReady: boolean;
  sessionCode: string;
  accessToken: string | undefined;
  participantId: string | null;
  onSessionStarted: () => void;
  onLeft: () => void;
  onDisbanded: () => void;
}

export default function LobbyActions({
  isHost,
  participantCount,
  allReady,
  selfReady,
  sessionCode,
  accessToken,
  participantId,
  onSessionStarted,
  onLeft,
  onDisbanded,
}: LobbyActionsProps) {
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [togglingReady, setTogglingReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = participantCount >= 2 && allReady;

  const handleStart = async () => {
    setError(null);
    setStarting(true);

    try {
      const res = await fetch(`/api/group/${sessionCode}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start session");
        return;
      }

      onSessionStarted();
    } catch {
      setError("Something went wrong");
    } finally {
      setStarting(false);
    }
  };

  const handleReady = async () => {
    setTogglingReady(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const body = !accessToken && participantId
        ? { participantId }
        : {};

      await fetch(`/api/group/${sessionCode}/ready`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    } catch {
      // Silently fail — Realtime will correct the state
    } finally {
      setTogglingReady(false);
    }
  };

  const handleLeave = async () => {
    setError(null);
    setLeaving(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const body = !accessToken && participantId
        ? JSON.stringify({ participantId })
        : undefined;

      const res = await fetch(`/api/group/${sessionCode}/leave`, {
        method: "DELETE",
        headers,
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to leave");
        return;
      }

      if (data.disbanded) {
        onDisbanded();
      } else {
        onLeft();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <p style={{ fontSize: "13px", color: "var(--rose)" }}>{error}</p>
      )}

      {/* Ready toggle — for everyone */}
      <button
        onClick={handleReady}
        disabled={togglingReady}
        className="cursor-pointer font-sans"
        style={{
          padding: "12px 32px",
          borderRadius: "var(--r)",
          background: selfReady ? "var(--teal-soft)" : "var(--surface2)",
          color: selfReady ? "var(--teal)" : "var(--t2)",
          fontSize: "14px",
          fontWeight: 600,
          border: `1px solid ${selfReady ? "var(--teal)" : "var(--border)"}`,
          transition: "all var(--t-base)",
          opacity: togglingReady ? 0.7 : 1,
          width: "100%",
          maxWidth: "260px",
        }}
      >
        {selfReady ? "Ready ✓" : "Mark as ready"}
      </button>

      {isHost && (
        <>
          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="cursor-pointer font-sans"
            style={{
              padding: "14px 36px",
              borderRadius: "var(--r)",
              background: canStart && !starting ? "var(--teal)" : "var(--surface2)",
              color: canStart && !starting ? "#0a0a0c" : "var(--t3)",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              transition: "all var(--t-base)",
              opacity: starting ? 0.7 : 1,
              width: "100%",
              maxWidth: "260px",
            }}
          >
            {starting
              ? "Starting..."
              : canStart
                ? "Start session"
                : participantCount < 2
                  ? "Waiting for players..."
                  : "Waiting for everyone to be ready..."}
          </button>
        </>
      )}

      {!isHost && (
        <div className="flex items-center gap-2">
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--teal)",
              animation: "breathe 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--t2)",
            }}
          >
            Waiting for host to start...
          </span>
        </div>
      )}

      {/* Leave/disband */}
      <button
        onClick={handleLeave}
        disabled={leaving}
        className="cursor-pointer font-sans"
        style={{
          padding: "8px 18px",
          borderRadius: "10px",
          background: "none",
          color: leaving ? "var(--t3)" : "var(--t2)",
          fontSize: "12px",
          fontWeight: 500,
          border: "1px solid var(--border)",
          transition: "all var(--t-base)",
        }}
      >
        {leaving
          ? "Leaving..."
          : isHost
            ? "Disband session"
            : "Leave session"}
      </button>
    </div>
  );
}
