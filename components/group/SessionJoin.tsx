"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface SessionJoinProps {
  initialCode?: string;
}

export default function SessionJoin({ initialCode = "" }: SessionJoinProps) {
  const { user, session } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length !== 6) {
      setError("Code must be 6 characters");
      return;
    }

    if (!user && nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters");
      return;
    }

    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const body: Record<string, string> = { code: trimmedCode };
      if (!user) {
        body.nickname = nickname.trim();
      }

      const res = await fetch("/api/group/join", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join session");
        return;
      }

      // Store participant ID for guest identification in the lobby
      localStorage.setItem("participantId", data.participantId);
      router.push(`/group/${data.code}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="flex flex-col items-center gap-4 py-6">
      <p
        style={{
          color: "var(--t2)",
          fontSize: "14px",
          textAlign: "center",
          maxWidth: "320px",
          lineHeight: 1.5,
        }}
      >
        Enter the 6-character code shared by your group host.
      </p>

      {/* Code input */}
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
        placeholder="ENTER CODE"
        maxLength={6}
        className="font-sans"
        style={{
          width: "100%",
          maxWidth: "280px",
          padding: "14px 16px",
          borderRadius: "var(--r)",
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          color: "var(--t1)",
          fontSize: "18px",
          fontWeight: 600,
          letterSpacing: "4px",
          textAlign: "center",
          textTransform: "uppercase",
          outline: "none",
          transition: "border-color var(--t-fast)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--border-active)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />

      {/* Nickname field — only for guests */}
      {!user && (
        <div style={{ width: "100%", maxWidth: "280px" }}>
          <label
            style={{
              display: "block",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "var(--t3)",
              marginBottom: "6px",
              textAlign: "center",
            }}
          >
            Joining as guest
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 20))}
            placeholder="Your nickname"
            maxLength={20}
            className="font-sans"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "var(--r)",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--t1)",
              fontSize: "14px",
              textAlign: "center",
              outline: "none",
              transition: "border-color var(--t-fast)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--border-active)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      )}

      {error && (
        <p style={{ color: "var(--rose)", fontSize: "13px" }}>{error}</p>
      )}

      <button
        type="submit"
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
        {loading ? "Joining..." : "Join session"}
      </button>
    </form>
  );
}
