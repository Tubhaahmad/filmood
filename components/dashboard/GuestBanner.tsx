"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function GuestBanner() {
  const { user, loading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Only show for guests, hide if dismissed or still loading
  if (loading || user || dismissed) return null;

  return (
    <div
      className="flex items-center justify-between gap-4 px-6 py-3.5 border-b"
      style={{ background: "var(--surface3)", borderColor: "var(--border)" }}
    >
      {/* Left icon + text */}
      <div className="flex items-center gap-3 min-w-0">
        <span style={{ color: "var(--gold)", fontSize: "14px", flexShrink: 0 }}>
          ✦
        </span>
        <div className="min-w-0">
          <p
            className="text-sm font-semibold leading-none mb-1"
            style={{ color: "var(--t1)" }}
          >
            Get more from Filmood
          </p>
          <p className="text-xs leading-none" style={{ color: "var(--t2)" }}>
            Sign up for personalized picks, watchlists, and group sessions with
            friends.
          </p>
        </div>
      </div>

      {/* Right cta + dismiss */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/signup"
          className="no-underline rounded-lg px-4 py-2 text-xs font-semibold transition-all hover:brightness-110"
          style={{ background: "var(--gold)", color: "#0a0a0c" }}
        >
          Create free account
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="cursor-pointer border-none bg-transparent text-base leading-none transition-colors hover:text-[var(--t1)]"
          style={{ color: "var(--t3)" }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
