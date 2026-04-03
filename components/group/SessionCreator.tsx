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

  // Guest gate
  if (!user) {
    return (
      <div
        className="flex flex-col items-center gap-5"
        style={{ padding: "32px 0" }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--gold-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          &#9733;
        </div>
        <div className="text-center">
          <p
            className="font-sans"
            style={{
              color: "var(--t1)",
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Create an account to host
          </p>
          <p
            className="font-sans"
            style={{
              color: "var(--t3)",
              fontSize: "13px",
              lineHeight: 1.5,
              maxWidth: "280px",
            }}
          >
            Sign up to create group sessions. You can join existing sessions as a guest.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="font-sans"
            style={{
              padding: "10px 24px",
              borderRadius: "var(--r)",
              background: "var(--gold)",
              color: "#0a0a0c",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all var(--t-base)",
            }}
          >
            Sign up free
          </Link>
          <Link
            href="/login"
            className="font-sans"
            style={{
              padding: "9px 20px",
              borderRadius: "var(--r)",
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
    );
  }

  // Session created — marquee code display
  if (code) {
    return (
      <div
        className="flex flex-col items-center"
        style={{ padding: "28px 0 24px" }}
      >
        {/* Success label */}
        <span
          className="font-sans"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "2.5px",
            color: "var(--teal)",
            marginBottom: "16px",
          }}
        >
          Session created
        </span>

        {/* Share prompt */}
        <p
          className="font-sans text-center"
          style={{
            color: "var(--t2)",
            fontSize: "14px",
            marginBottom: "20px",
            lineHeight: 1.5,
          }}
        >
          Share this code with your group
        </p>

        {/* Code display with glow */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <button
            onClick={handleCopy}
            className="cursor-pointer"
            style={{
              fontFamily: "monospace",
              fontSize: "clamp(30px, 6vw, 42px)",
              fontWeight: 700,
              letterSpacing: "8px",
              color: "var(--teal)",
              background: "var(--surface2)",
              border: `1px solid ${copied ? "var(--teal)" : "var(--border)"}`,
              borderRadius: "var(--r)",
              padding: "18px 32px",
              transition: "all var(--t-base)",
              animation: copied ? "none" : "glowPulse 4s ease-in-out infinite",
              boxShadow: copied
                ? "0 0 30px var(--teal-glow), inset 0 0 20px var(--teal-glow)"
                : undefined,
              position: "relative",
              zIndex: 1,
            }}
          >
            {code}
          </button>

          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "120%",
              height: "160%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, var(--teal-glow) 0%, transparent 70%)",
              opacity: 0.6,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        </div>

        <p
          className="font-sans"
          style={{
            fontSize: "11px",
            color: copied ? "var(--teal)" : "var(--t3)",
            transition: "color var(--t-fast)",
            fontWeight: 500,
            marginBottom: "24px",
          }}
        >
          {copied ? "Copied to clipboard" : "Tap code to copy"}
        </p>

        {/* Dashed divider */}
        <div
          style={{
            width: "100%",
            borderTop: "1px dashed var(--border-h)",
            marginBottom: "24px",
          }}
        />

        {/* Go to lobby */}
        <button
          onClick={handleGoToLobby}
          className="cursor-pointer font-sans"
          style={{
            padding: "14px 36px",
            borderRadius: "var(--r)",
            background: "var(--teal)",
            color: "#0a0a0c",
            fontSize: "14px",
            fontWeight: 600,
            border: "none",
            transition: "all var(--t-base)",
            width: "100%",
            maxWidth: "260px",
          }}
        >
          Enter lobby
        </button>

        <p
          className="font-sans"
          style={{
            fontSize: "11px",
            color: "var(--t3)",
            marginTop: "10px",
          }}
        >
          Your friends can join with the code above
        </p>
      </div>
    );
  }

  // Default — create state
  return (
    <div
      className="flex flex-col items-center"
      style={{ padding: "28px 0 24px" }}
    >
      {/* Icon */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "var(--teal-soft)",
          border: "1px solid var(--teal)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          marginBottom: "20px",
          opacity: 0.85,
        }}
      >
        +
      </div>

      <p
        className="font-sans text-center"
        style={{
          color: "var(--t2)",
          fontSize: "14px",
          maxWidth: "300px",
          lineHeight: 1.6,
          marginBottom: "8px",
        }}
      >
        Start a private room and invite up to 10 friends. Everyone picks their mood, swipes on films, and Filmood finds the match.
      </p>

      {/* Feature hints */}
      <div
        className="flex items-center justify-center gap-4 flex-wrap"
        style={{ marginBottom: "24px", marginTop: "8px" }}
      >
        {["Private room", "Up to 10 friends", "4hr session"].map((hint) => (
          <span
            key={hint}
            className="font-sans"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "var(--t3)",
              padding: "5px 10px",
              borderRadius: "100px",
              background: "var(--tag-bg)",
              border: "1px solid var(--tag-border)",
            }}
          >
            {hint}
          </span>
        ))}
      </div>

      {error && (
        <p
          className="font-sans"
          style={{ color: "var(--rose)", fontSize: "13px", marginBottom: "12px" }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="cursor-pointer font-sans"
        style={{
          padding: "14px 36px",
          borderRadius: "var(--r)",
          background: loading ? "var(--surface2)" : "var(--teal)",
          color: loading ? "var(--t3)" : "#0a0a0c",
          fontSize: "14px",
          fontWeight: 600,
          border: "none",
          transition: "all var(--t-base)",
          opacity: loading ? 0.7 : 1,
          width: "100%",
          maxWidth: "260px",
        }}
      >
        {loading ? "Creating session..." : "Create session"}
      </button>
    </div>
  );
}
