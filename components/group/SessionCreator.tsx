"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function SessionCreator() {
  const { user, session } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/group/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create session");
        return;
      }

      setCode(data.code);

      // Store participant ID so we can identify ourselves in the lobby
      localStorage.setItem("participantId", data.participantId);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToLobby = () => {
    if (code) router.push(`/group/${code}`);
  };

  // Guest users can't create sessions
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p style={{ color: "var(--t2)", fontSize: "14px", textAlign: "center" }}>
          You need an account to create a group session.
        </p>
        <Link
          href="/login"
          className="font-sans"
          style={{
            padding: "10px 24px",
            borderRadius: "var(--r)",
            background: "var(--gold)",
            color: "#000",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Log in
        </Link>
      </div>
    );
  }

  // Session created — show code
  if (code) {
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        <p style={{ color: "var(--t2)", fontSize: "14px" }}>
          Share this code with your group:
        </p>

        {/* Code display */}
        <button
          onClick={handleCopy}
          className="cursor-pointer"
          style={{
            fontFamily: "monospace",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            letterSpacing: "6px",
            color: "var(--gold)",
            background: "var(--surface2)",
            border: `1px solid ${copied ? "var(--gold)" : "var(--border)"}`,
            borderRadius: "var(--r)",
            padding: "16px 32px",
            transition: "all var(--t-base)",
            boxShadow: copied ? "0 0 20px var(--gold-glow)" : "none",
          }}
        >
          {code}
        </button>

        <p
          style={{
            fontSize: "12px",
            color: copied ? "var(--gold)" : "var(--t3)",
            transition: "color var(--t-fast)",
          }}
        >
          {copied ? "Copied!" : "Click code to copy"}
        </p>

        <button
          onClick={handleGoToLobby}
          className="cursor-pointer font-sans"
          style={{
            padding: "12px 32px",
            borderRadius: "var(--r)",
            background: "var(--gold)",
            color: "#000",
            fontSize: "14px",
            fontWeight: 600,
            border: "none",
            transition: "opacity var(--t-fast)",
          }}
        >
          Go to lobby
        </button>
      </div>
    );
  }

  // Default — create button
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p
        style={{
          color: "var(--t2)",
          fontSize: "14px",
          textAlign: "center",
          maxWidth: "320px",
          lineHeight: 1.5,
        }}
      >
        Start a group session and invite friends to pick a film together.
      </p>

      {error && (
        <p style={{ color: "var(--rose)", fontSize: "13px" }}>{error}</p>
      )}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="cursor-pointer font-sans"
        style={{
          padding: "12px 32px",
          borderRadius: "var(--r)",
          background: loading ? "var(--surface2)" : "var(--gold)",
          color: loading ? "var(--t3)" : "#000",
          fontSize: "14px",
          fontWeight: 600,
          border: "none",
          transition: "all var(--t-base)",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Creating..." : "Create session"}
      </button>
    </div>
  );
}
