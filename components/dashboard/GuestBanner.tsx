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
      className="flex items-center justify-between gap-3 px-4 py-3 border-b sm:px-6 sm:py-3.5 sm:gap-4"
      style={{ background: "var(--surface3)", borderColor: "var(--border)" }}
    >
      {/* Left: icon + text */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="shrink-0 text-sm" style={{ color: "var(--gold)" }}>
          ✦
        </span>
        <div>
          <p
            className="text-xs font-semibold leading-none sm:text-sm"
            style={{ color: "var(--t1)" }}
          >
            Get more from Filmood
          </p>
          <p
            className="hidden sm:block text-xs leading-none mt-1"
            style={{ color: "var(--t2)" }}
          >
            Sign up for personalized picks, watchlists, and group sessions with
            friends.
          </p>
        </div>
      </div>

      {/* Right: CTA + dismiss */}
      <div className="flex items-center gap-2 shrink-0 sm:gap-3">
        <Link
          href="/signup"
          className="no-underline rounded-lg px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all hover:brightness-110 sm:px-4 sm:py-2 sm:text-xs"
          style={{ background: "var(--gold)", color: "#0a0a0c" }}
        >
          {/* Shorter label on mobile */}
          <span className="sm:hidden">Sign up free</span>
          <span className="hidden sm:inline">Create free account</span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="cursor-pointer border-none bg-transparent text-sm leading-none transition-colors hover:text-(--t1)"
          style={{ color: "var(--t3)" }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
