"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/getAuthToken";

interface SessionJoinProps {
  initialCode?: string;
}

const CODE_LENGTH = 6;

export default function SessionJoin({ initialCode = "" }: SessionJoinProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Pad initial code to array of individual characters
  const initialChars = initialCode
    .toUpperCase()
    .split("")
    .concat(Array(CODE_LENGTH).fill(""))
    .slice(0, CODE_LENGTH);

  const [chars, setChars] = useState<string[]>(initialChars);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = chars.join("");
  const isFilled = chars.every((c) => c !== "");

  const handleCharChange = (index: number, value: string) => {
    // Only allow alphanumeric
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!char && value !== "") return;

    const next = [...chars];

    if (char) {
      next[index] = char;
      setChars(next);

      // Auto-advance to next slot
      if (index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      next[index] = "";
      setChars(next);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      // Move back on empty backspace
      const next = [...chars];
      next[index - 1] = "";
      setChars(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, CODE_LENGTH);

    if (pasted.length > 0) {
      const next = pasted
        .split("")
        .concat(Array(CODE_LENGTH).fill(""))
        .slice(0, CODE_LENGTH);
      setChars(next);

      // Focus the slot after the last pasted char
      const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFilled) {
      setError("Enter the full 6-character code");
      return;
    }

    if (!user && nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters");
      return;
    }

    setLoading(true);

    try {
      const headers = await getAuthHeaders();
      const body: Record<string, string> = { code };
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

      localStorage.setItem("participantId", data.participantId);
      router.push(`/group/${data.code}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleJoin}
      className="flex flex-col items-center"
      style={{ padding: "28px 0 24px" }}
    >
      {/* Icon */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "var(--gold-soft)",
          border: "1px solid var(--gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          marginBottom: "20px",
          opacity: 0.85,
          color: "var(--gold)",
          fontWeight: 700,
        }}
      >
        #
      </div>

      <p
        className="font-sans text-center"
        style={{
          color: "var(--t2)",
          fontSize: "14px",
          maxWidth: "300px",
          lineHeight: 1.6,
          marginBottom: "24px",
        }}
      >
        Enter the 6-character code shared by your group host.
      </p>

      {/* Character slot inputs */}
      <div
        className="flex items-center justify-center"
        style={{
          gap: "clamp(4px, 1.5vw, 8px)",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "320px",
        }}
        onPaste={handlePaste}
      >
        {chars.map((char, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="text"
            maxLength={1}
            value={char}
            onChange={(e) => handleCharChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Session code character ${i + 1} of 6`}
            className="font-sans"
            style={{
              width: "clamp(38px, 12vw, 46px)",
              height: "clamp(46px, 14vw, 54px)",
              borderRadius: "10px",
              background: char ? "var(--surface2)" : "var(--surface)",
              border: `1.5px solid ${char ? "var(--gold)" : "var(--border)"}`,
              color: "var(--t1)",
              fontSize: "clamp(16px, 5vw, 20px)",
              fontWeight: 700,
              textAlign: "center",
              textTransform: "uppercase",
              outline: "none",
              transition: "all var(--t-fast)",
              boxShadow: char ? "0 0 8px var(--gold-glow)" : "none",
              caretColor: "var(--gold)",
              flex: 1,
              maxWidth: "46px",
            }}
            onFocus={(e) => {
              if (!char) e.target.style.borderColor = "var(--gold)";
            }}
            onBlur={(e) => {
              if (!char) e.target.style.borderColor = "var(--border)";
            }}
          />
        ))}
      </div>

      {/* Paste hint */}
      <p
        className="font-sans"
        style={{
          fontSize: "10px",
          color: "var(--t3)",
          marginBottom: "20px",
          fontWeight: 500,
        }}
      >
        Type or paste the code
      </p>

      {/* Nickname field for guests */}
      {!user && (
        <div
          style={{
            width: "100%",
            maxWidth: "280px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              borderTop: "1px dashed var(--border-h)",
              paddingTop: "20px",
            }}
          >
            <label
              htmlFor="guest-nickname"
              className="font-sans"
              style={{
                display: "block",
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--t3)",
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              Joining as guest
            </label>
            <input
              id="guest-nickname"
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
        </div>
      )}

      <div role="alert" aria-live="assertive">
        {error && (
          <p
            className="font-sans"
            style={{ color: "var(--rose)", fontSize: "13px", marginBottom: "12px" }}
          >
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !isFilled}
        className="cursor-pointer font-sans"
        style={{
          padding: "14px 36px",
          borderRadius: "var(--r)",
          background: loading || !isFilled ? "var(--surface2)" : "var(--gold)",
          color: loading || !isFilled ? "var(--t3)" : "#0a0a0c",
          fontSize: "14px",
          fontWeight: 600,
          border: "none",
          transition: "all var(--t-base)",
          opacity: loading ? 0.7 : 1,
          width: "100%",
          maxWidth: "260px",
        }}
      >
        {loading ? "Joining..." : "Join session"}
      </button>
    </form>
  );
}
