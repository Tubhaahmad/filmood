"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface ExplorePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    num: "1",
    title: "Create & share a code",
    sub: "Start a session and send the code to your group",
  },
  {
    num: "2",
    title: "Everyone picks their mood",
    sub: "Each person selects moods privately — no bias",
  },
  {
    num: "3",
    title: "Swipe & match",
    sub: "Filmood builds a shared deck. Swipe together, watch the match",
  },
];

export default function ExplorePanel({ isOpen, onClose }: ExplorePanelProps) {
  const { user, session } = useAuth();
  const router = useRouter();

  const [joinMode, setJoinMode] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const handleCreate = () => {
    router.push("/group");
  };

  const handleJoin = async () => {
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setJoinError("Enter a 6-character code");
      return;
    }

    setJoinError(null);

    // Guests need the nickname field on the /group page
    if (!user) {
      router.push(`/group?tab=join&code=${trimmed}`);
      return;
    }

    setJoinLoading(true);

    try {
      const res = await fetch("/api/group/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setJoinError(data.error || "Failed to join");
        return;
      }

      localStorage.setItem("participantId", data.participantId);
      router.push(`/group/${data.code}`);
    } catch {
      setJoinError("Something went wrong");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div
      style={{
        maxHeight: isOpen ? "800px" : "0",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition:
          "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s, padding 0.4s",
        paddingBottom: isOpen ? "10px" : "0",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "22px",
        }}
      >
        {/* Panel label */}
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.8px",
            color: "var(--teal)",
            marginBottom: "20px",
          }}
        >
          Start a group session
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4" style={{ marginBottom: "24px" }}>
          {steps.map((step) => (
            <div key={step.num} className="flex items-start gap-3">
              {/* Step number */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  background: "var(--teal-soft)",
                  color: "var(--teal)",
                }}
              >
                {step.num}
              </div>

              {/* Step text */}
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--t1)",
                    lineHeight: 1.3,
                    marginBottom: "2px",
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--t3)",
                    lineHeight: 1.4,
                  }}
                >
                  {step.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {user ? (
          // Logged-in user actions
          <div
            style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}
          >
            {!joinMode ? (
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleCreate}
                  className="cursor-pointer font-sans"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    background: "var(--teal)",
                    color: "#0a0a0c",
                    fontSize: "13px",
                    fontWeight: 600,
                    lineHeight: 1,
                    border: "none",
                    transition: "all var(--t-base)",
                  }}
                >
                  Create session
                </button>

                <button
                  onClick={() => setJoinMode(true)}
                  className="cursor-pointer font-sans"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    background: "none",
                    color: "var(--t2)",
                    fontSize: "13px",
                    fontWeight: 500,
                    lineHeight: 1,
                    border: "1px solid var(--border)",
                    transition: "all var(--t-base)",
                  }}
                >
                  Join with code
                </button>

                <button
                  onClick={onClose}
                  className="cursor-pointer font-sans"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    background: "none",
                    color: "var(--t2)",
                    fontSize: "13px",
                    fontWeight: 500,
                    lineHeight: 1,
                    border: "1px solid var(--border)",
                    transition: "all var(--t-base)",
                  }}
                >
                  Close
                </button>

                <span
                  className="ml-auto"
                  style={{ fontSize: "12px", color: "var(--t3)" }}
                >
                  Guests can join with a code — no account needed
                </span>
              </div>
            ) : (
              // Join code input
              <div className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                      setJoinError(null);
                    }}
                    placeholder="ENTER CODE"
                    maxLength={6}
                    autoFocus
                    className="font-sans"
                    style={{
                      flex: 1,
                      maxWidth: "200px",
                      padding: "10px 14px",
                      borderRadius: "var(--r)",
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      color: "var(--t1)",
                      fontSize: "15px",
                      fontWeight: 600,
                      letterSpacing: "3px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      outline: "none",
                      transition: "border-color var(--t-fast)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--border-active)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleJoin();
                      }
                    }}
                  />

                  <button
                    onClick={handleJoin}
                    disabled={joinLoading}
                    className="cursor-pointer font-sans"
                    style={{
                      padding: "10px 20px",
                      borderRadius: "10px",
                      background: joinLoading
                        ? "var(--surface2)"
                        : "var(--teal)",
                      color: joinLoading ? "var(--t3)" : "#0a0a0c",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: "none",
                      transition: "all var(--t-fast)",
                    }}
                  >
                    {joinLoading ? "Joining..." : "Join"}
                  </button>

                  <button
                    onClick={() => {
                      setJoinMode(false);
                      setJoinCode("");
                      setJoinError(null);
                    }}
                    className="cursor-pointer font-sans"
                    style={{
                      padding: "9px 14px",
                      borderRadius: "10px",
                      background: "none",
                      color: "var(--t3)",
                      fontSize: "13px",
                      fontWeight: 500,
                      border: "1px solid var(--border)",
                      transition: "all var(--t-base)",
                    }}
                  >
                    Back
                  </button>
                </div>

                {joinError && (
                  <p style={{ fontSize: "12px", color: "var(--rose)" }}>
                    {joinError}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          // Guest prompt
          <div
            style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--t1)",
                marginBottom: "4px",
              }}
            >
              Create an account to host
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--t3)",
                lineHeight: 1.5,
                marginBottom: "14px",
              }}
            >
              Sign up to create group sessions. You can join existing sessions as
              a guest.
            </p>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => router.push("/signup")}
                className="cursor-pointer font-sans"
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "var(--teal)",
                  color: "#0a0a0c",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  transition: "all var(--t-base)",
                }}
              >
                Sign up free
              </button>

              <button
                onClick={() => router.push("/group?tab=join")}
                className="cursor-pointer font-sans"
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  background: "none",
                  color: "var(--t2)",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "1px solid var(--border)",
                  transition: "all var(--t-base)",
                }}
              >
                Join with code
              </button>

              <button
                onClick={onClose}
                className="cursor-pointer font-sans"
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  background: "none",
                  color: "var(--t2)",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "1px solid var(--border)",
                  transition: "all var(--t-base)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
