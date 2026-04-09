"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/getAuthToken";
import Link from "next/link";

interface ExplorePanelProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

type Tab = "create" | "join";

const steps = [
  {
    num: "1",
    title: "Create & share",
    sub: "Send the code to your group",
    accent: "var(--teal)",
    accentSoft: "var(--teal-soft)",
  },
  {
    num: "2",
    title: "Pick moods",
    sub: "Everyone selects privately",
    accent: "var(--violet)",
    accentSoft: "var(--violet-soft)",
  },
  {
    num: "3",
    title: "Swipe & match",
    sub: "Find the film together",
    accent: "var(--gold)",
    accentSoft: "var(--gold-soft)",
  },
];

export default function ExplorePanel({ isOpen, onClose, embedded }: ExplorePanelProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("create");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user) {
      router.push("/group");
      return;
    }

    setCreateError(null);
    setCreateLoading(true);

    try {
      const res = await fetch("/api/group/create", {
        method: "POST",
        headers: await getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Failed to create session");
        return;
      }

      localStorage.setItem("participantId", data.participantId);
      router.push(`/group/${data.code}`);
    } catch {
      setCreateError("Something went wrong");
    } finally {
      setCreateLoading(false);
    }
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
      const headers = await getAuthHeaders();

      const res = await fetch("/api/group/join", {
        method: "POST",
        headers,
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

  const content = (
    <>
      {/* Panel label */}
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.8px",
          color: "var(--teal)",
          marginBottom: "16px",
        }}
      >
        Group session
      </div>

      {/* Steps — compact horizontal row */}
      <div
        className="grid grid-cols-3 gap-2"
        style={{ marginBottom: "20px" }}
      >
        {steps.map((step) => (
          <div
            key={step.num}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "14px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                background: step.accentSoft,
                color: step.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                margin: "0 auto 8px",
              }}
            >
              {step.num}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--t1)",
                lineHeight: 1.3,
                marginBottom: "3px",
              }}
            >
              {step.title}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--t3)",
                lineHeight: 1.3,
              }}
            >
              {step.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Tab toggle — mirrors /group page pattern */}
      <div
        style={{
          display: "flex",
          background: "var(--surface2)",
          borderRadius: "var(--r)",
          padding: "3px",
          marginBottom: "14px",
        }}
      >
        {(["create", "join"] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setJoinError(null);
                setCreateError(null);
              }}
              className="cursor-pointer font-sans"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                transition: "all 0.25s ease",
                background: isActive ? "var(--surface)" : "transparent",
                color: isActive ? "var(--t1)" : "var(--t3)",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
              }}
            >
              {tab === "create" ? "Create session" : "Join with code"}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        style={{
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "20px 16px",
          marginBottom: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent top line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent 0%, ${activeTab === "create" ? "var(--teal)" : "var(--gold)"} 30%, ${activeTab === "create" ? "var(--teal)" : "var(--gold)"} 70%, transparent 100%)`,
            opacity: 0.5,
            transition: "all 0.3s ease",
          }}
        />

        {activeTab === "create" ? (
          // Create tab
          <div>
            {user ? (
              <div className="flex flex-col items-center gap-3">
                <p
                  className="font-sans text-center"
                  style={{
                    color: "var(--t2)",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  Start a private room and invite up to 10 friends.
                </p>

                {createError && (
                  <p style={{ color: "var(--rose)", fontSize: "12px" }}>
                    {createError}
                  </p>
                )}

                <button
                  onClick={handleCreate}
                  disabled={createLoading}
                  className="cursor-pointer font-sans"
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    background: createLoading ? "var(--surface3)" : "var(--teal)",
                    color: createLoading ? "var(--t3)" : "#0a0a0c",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    transition: "all var(--t-base)",
                  }}
                >
                  {createLoading ? "Creating..." : "Create session"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p
                  className="font-sans text-center"
                  style={{
                    color: "var(--t2)",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  Sign in to create a session. Guests can join with a code.
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/signup"
                    className="font-sans"
                    style={{
                      padding: "10px 20px",
                      borderRadius: "10px",
                      background: "var(--teal)",
                      color: "#0a0a0c",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Sign up free
                  </Link>
                  <Link
                    href="/login"
                    className="font-sans"
                    style={{
                      padding: "9px 18px",
                      borderRadius: "10px",
                      background: "none",
                      color: "var(--t2)",
                      fontSize: "13px",
                      fontWeight: 500,
                      textDecoration: "none",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Log in
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Join tab
          <div className="flex flex-col items-center gap-3">
            <p
              className="font-sans text-center"
              style={{
                color: "var(--t2)",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Enter the 6-character code from your host.
            </p>

            <div className="flex gap-2 w-full" style={{ maxWidth: "300px" }}>
              <input
                aria-label="Session code"
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                  setJoinError(null);
                }}
                placeholder="ABC123"
                maxLength={6}
                className="font-sans"
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: "10px",
                  background: "var(--surface)",
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
                  padding: "11px 20px",
                  borderRadius: "10px",
                  background: joinLoading ? "var(--surface3)" : "var(--gold)",
                  color: joinLoading ? "var(--t3)" : "#0a0a0c",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  transition: "all var(--t-fast)",
                  whiteSpace: "nowrap",
                }}
              >
                {joinLoading ? "Joining..." : "Join"}
              </button>
            </div>

            {joinError && (
              <p style={{ fontSize: "12px", color: "var(--rose)" }}>
                {joinError}
              </p>
            )}

            {!user && (
              <p
                className="font-sans"
                style={{
                  fontSize: "11px",
                  color: "var(--t3)",
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                You&apos;ll be asked for a nickname on the next step.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer: close + full page link */}
      <div
        className="flex items-center gap-2.5 flex-wrap"
        style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}
      >
        <button
          onClick={onClose}
          className="btn-panel-outline cursor-pointer font-sans"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "9px 18px",
            borderRadius: "10px",
            background: "none",
            color: "var(--t1)",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1,
            border: "1px solid var(--border-h)",
            transition: "all var(--t-base)",
          }}
        >
          Close
        </button>

        <Link
          href="/group"
          className="btn-panel-outline font-sans"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "9px 16px",
            borderRadius: "10px",
            background: "var(--teal-soft)",
            color: "var(--teal)",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: 1,
            textDecoration: "none",
            border: "1px solid rgba(90, 170, 143, 0.2)",
            transition: "all var(--t-base)",
          }}
        >
          Open full page
          <span style={{ fontSize: "11px" }}>→</span>
        </Link>

        <span
          className="ml-auto"
          style={{ fontSize: "11px", color: "var(--t3)" }}
        >
          Sessions expire after 4 hours
        </span>
      </div>
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

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
        {content}
      </div>
    </div>
  );
}
