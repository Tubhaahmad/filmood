"use client";

import { useState } from "react";
import { getAuthHeaders } from "@/lib/getAuthToken";

interface LobbyActionsProps {
  isHost: boolean;
  participantCount: number;
  allReady: boolean;
  selfReady: boolean;
  sessionCode: string;
  participantId: string | null;
  onSessionStarted: () => void;
  onReadyToggled: () => void;
  onLeft: () => void;
  onDisbanded: () => void;
}

export default function LobbyActions({
  isHost,
  participantCount,
  allReady,
  selfReady,
  sessionCode,
  participantId,
  onSessionStarted,
  onReadyToggled,
  onLeft,
  onDisbanded,
}: LobbyActionsProps) {
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [togglingReady, setTogglingReady] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = participantCount >= 2 && allReady;

  const handleStart = async () => {
    setError(null);
    setStarting(true);

    try {
      const res = await fetch(`/api/group/${sessionCode}/start`, {
        method: "POST",
        headers: await getAuthHeaders(),
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
      const headers = await getAuthHeaders();
      const isGuest = !headers.Authorization;

      const body = isGuest && participantId
        ? { participantId }
        : {};

      const res = await fetch(`/api/group/${sessionCode}/ready`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to toggle ready state");
      }

      onReadyToggled();
    } catch {
      setError("Network error — please try again");
      onReadyToggled();
    } finally {
      setTogglingReady(false);
    }
  };

  const handleLeave = async () => {
    setError(null);
    setLeaving(true);

    try {
      const headers = await getAuthHeaders();
      const isGuest = !headers.Authorization;

      const body = isGuest && participantId
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
        setConfirmLeave(false);
        return;
      }

      if (data.disbanded) {
        onDisbanded();
      } else {
        onLeft();
      }
    } catch {
      setError("Something went wrong");
      setConfirmLeave(false);
    } finally {
      setLeaving(false);
    }
  };

  const startLabel = () => {
    if (starting) return "Starting...";
    if (canStart) return "Start session";
    if (participantCount < 2) return "Waiting for players...";
    return "Waiting for everyone...";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div role="alert" aria-live="assertive">
        {error && (
          <p
            className="font-sans"
            style={{ fontSize: "13px", color: "var(--rose)" }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Ready toggle */}
      <button
        onClick={handleReady}
        disabled={togglingReady}
        className="cursor-pointer font-sans"
        style={{
          padding: "12px 32px",
          borderRadius: "var(--r)",
          background: selfReady ? "var(--teal)" : "var(--surface2)",
          color: selfReady ? "#0a0a0c" : "var(--t2)",
          fontSize: "14px",
          fontWeight: 600,
          border: `1px solid ${selfReady ? "var(--teal)" : "var(--border)"}`,
          transition: "all 0.25s ease",
          opacity: togglingReady ? 0.7 : 1,
          width: "100%",
          maxWidth: "260px",
        }}
      >
        {selfReady ? "Ready \u2713" : "Mark as ready"}
      </button>

      {/* Start — host only */}
      {isHost && (
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
            transition: "all 0.25s ease",
            opacity: starting ? 0.7 : 1,
            width: "100%",
            maxWidth: "260px",
          }}
        >
          {startLabel()}
        </button>
      )}

      {/* Leave / Disband — with confirm */}
      <div style={{ marginTop: "4px" }}>
        {confirmLeave ? (
          <div className="flex items-center gap-3">
            <span
              className="font-sans"
              style={{ fontSize: "12px", color: "var(--t2)" }}
            >
              {isHost ? "Disband session?" : "Leave session?"}
            </span>
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="cursor-pointer font-sans"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--rose)",
                background: "none",
                border: "none",
                padding: "2px 6px",
              }}
            >
              {leaving ? "..." : "Yes"}
            </button>
            <button
              onClick={() => setConfirmLeave(false)}
              className="cursor-pointer font-sans"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--t3)",
                background: "none",
                border: "none",
                padding: "2px 6px",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLeave(true)}
            className="cursor-pointer font-sans"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--t3)",
              background: "none",
              border: "none",
              padding: "4px 8px",
              transition: "color var(--t-fast)",
            }}
          >
            {isHost ? "Disband session" : "Leave session"}
          </button>
        )}
      </div>
    </div>
  );
}
