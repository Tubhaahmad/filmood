"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/getAuthToken";
import Link from "next/link";

export default function SessionCreator() {
  const { user, session } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/group/create", {
        method: "POST",
        headers: await getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create session");
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

  if (!user) {
    return (
      <div
        className="flex flex-col items-center gap-5"
        style={{ padding: "32px 0" }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "var(--gold-soft)",
            border: "1px solid rgba(196,163,90,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            color: "var(--gold)",
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
            Sign in to create a session
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
            You can join existing sessions as a guest.
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

  return (
    <div
      className="flex flex-col items-center"
      style={{ padding: "28px 0 24px" }}
    >
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
        Start a private room and invite up to 10 friends.
      </p>

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
        {loading ? "Creating..." : "Create session"}
      </button>
    </div>
  );
}
