"use client";

// Shows the user's avatar, name, email, join date, and a stats strip.
// TO HOOK UP BACKEND:
// Replace the hardcoded `stats` array with real data from Supabase.

import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/components/AuthProvider";

interface Props {
  user: User;
}

export default function ProfileHero({ user }: Props) {
  const { signOut } = useAuth();

  // Derive display values from the Supabase user object
  const initial = user.email?.[0]?.toUpperCase() ?? "U";
  const displayName =
    user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
  const joinedDate = new Date(user.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  // These are static placeholders. Replace with real Supabase data (see above).
  const stats = [
    { value: "—", label: "Watchlist", color: "text-[var(--gold)]" },
    { value: "—", label: "Mood Picks", color: "text-[var(--blue)]" },
    { value: "—", label: "Top Mood", color: "text-[var(--violet)]" },
    { value: "✓", label: "Active", color: "text-[var(--teal)]" },
  ];

  return (
    <div className="relative mb-5 overflow-hidden rounded-[20px] border border-(--border)--surface) px-9 pb-7 pt-9">
      {/* Gold glow orb — matches .profile-hero::before */}
      <div className="pointer-events-none absolute -right-15 -top-15 h-65 w-65 rounded-full bg-(--gold-glow) blur-[60px]" />

      {/* ── Top row — matches .hero-top ── */}
      <div className="relative mb-6 flex flex-wrap items-start gap-6">
        {/* Avatar wrap — matches .profile-avatar-wrap */}
        <div className="relative shrink-0">
          {/* Avatar — matches .profile-avatar */}
          <div className="flex h-21 w-21 cursor-pointer items-center justify-center rounded-full border-[3px] border-(--bg) bg-(--gold) text-[28px] font-bold leading-none text-[#0a0a0c] shadow-[0_0_0_1px_var(--border)] transition-shadow hover:shadow-[0_0_0_2px_var(--gold)]">
            {initial}
          </div>
          {/* Edit hint — matches .avatar-change-hint */}
          <div className="absolute bottom-0 right-0 flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-full border border-(--border) bg-(--surface2) text-[11px] transition-colors hover:border-(--border-h)">
            ✎
          </div>
        </div>

        {/* Info — matches .hero-info */}
        <div className="flex-1">
          {/* Name — matches .hero-name */}
          <div className="font-serif mb-1.25 text-[26px] font-semibold leading-[1.1] text-(--t1)">
            {displayName}
          </div>
          {/* Email — matches .hero-email */}
          <div className="mb-2.5 text-sm leading-none text-(--t2)">
            {user.email}
          </div>
          {/* Badges — matches .hero-meta */}
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Joined badge — matches .hero-badge.joined */}
            <span className="inline-flex items-center gap-1.25 rounded-full border border-(--tag-border) bg-(--tag-bg) px-2.5 py-1 text-[11px] font-medium leading-none text-(--t2)">
              📅 Member since {joinedDate}
            </span>
            {/* Filmood member badge — matches .hero-badge with gold colour */}
            <span className="inline-flex items-center gap-1.25 rounded-full border border-(--tag-border) bg-(--tag-bg) px-2.5 py-1 text-[11px] font-medium leading-none text-(--gold)">
              ✦ Filmood member
            </span>
          </div>
        </div>

        {/* Log out — matches .hero-actions */}
        <div className="ml-auto flex shrink-0 gap-2">
          <button
            onClick={signOut}
            className="cursor-pointer rounded-[10px] border border-(--border) bg-transparent px-3.5 py-1.75 text-xs font-medium leading-none text-(--t2) transition-all hover:border-(--border-h) hover:text-(--t1)"
          >
            Log out
          </button>
        </div>
      </div>

      {/* ── Stats strip — matches .stat-strip ── */}
      {/* Replace each stat.value with real Supabase data when ready */}
      <div
        className="grid grid-cols-4 overflow-hidden rounded-xl border border-(--border)"
        style={{ gap: "1px", background: "var(--border)" }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-(--surface2) px-4.5 py-3.5 text-center ${
              i === 0
                ? "rounded-l-xl"
                : i === stats.length - 1
                  ? "rounded-r-xl"
                  : ""
            }`}
          >
            {/* Stat value — matches .stat-value */}
            <div
              className={`mb-1 text-[22px] font-bold leading-none ${stat.color}`}
            >
              {stat.value}
            </div>
            {/* Stat label — matches .stat-label */}
            <div className="text-[11px] uppercase tracking-[0.8px] text-(--t3)">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
