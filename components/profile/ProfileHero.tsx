"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ProfileHero.tsx
// Shows the user's avatar, name, email, join date, and a stats strip.
//
// 🔌 TO HOOK UP BACKEND (stats strip):
//   Replace the hardcoded stats values with real data from Supabase:
//
//   const [stats, setStats] = useState({ watchlist: 0, moodPicks: 0, topMood: "—" })
//
//   useEffect(() => {
//     async function load() {
//       // Watchlist count
//       const { count: wlCount } = await supabase
//         .from("watchlist").select("id", { count: "exact", head: true }).eq("user_id", user.id)
//
//       // Mood picks + top mood
//       const { data: moods } = await supabase
//         .from("mood_history").select("mood").eq("user_id", user.id)
//       const freq: Record<string, number> = {}
//       moods?.forEach(({ mood }) => { freq[mood] = (freq[mood] ?? 0) + 1 })
//       const topMood = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
//
//       setStats({ watchlist: wlCount ?? 0, moodPicks: moods?.length ?? 0, topMood })
//     }
//     load()
//   }, [user.id])
// ─────────────────────────────────────────────────────────────────────────────

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

  // ── PLACEHOLDER STATS ──────────────────────────────────────────────────────
  // 🔌 Replace these with real values from Supabase (see comment at top)
  const stats = [
    { value: "—", label: "Watchlist", color: "text-[var(--gold)]" },
    { value: "—", label: "Mood Picks", color: "text-[var(--blue)]" },
    { value: "—", label: "Top Mood", color: "text-[var(--violet)]" },
    { value: "✓", label: "Active", color: "text-[var(--teal)]" },
  ];

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-[20px] border px-5 pb-5 pt-6 md:px-9 md:pb-7 md:pt-9"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Gold glow orb */}
      <div
        className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full blur-[60px]"
        style={{ background: "var(--gold-glow)" }}
      />

      {/* ── Top row ── */}
      {/* On mobile: avatar + logout on same row, then name/email/badges below */}
      {/* On desktop: avatar + info + logout all in one row */}
      <div className="relative mb-5">
        {/* Mobile: avatar row with logout pushed right */}
        <div className="flex items-start justify-between md:hidden mb-3">
          <div className="relative">
            <div
              className="flex cursor-pointer items-center justify-center rounded-full border-[3px] text-[22px] font-bold leading-none text-[#0a0a0c] transition-shadow hover:shadow-[0_0_0_2px_var(--gold)]"
              style={{
                width: "68px",
                height: "68px",
                background: "var(--gold)",
                borderColor: "var(--bg)",
                boxShadow: "0 0 0 1px var(--border)",
              }}
            >
              {initial}
            </div>
            <div
              className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border text-[11px] transition-colors hover:border-[var(--border-h)]"
              style={{
                background: "var(--surface2)",
                borderColor: "var(--border)",
              }}
            >
              ✎
            </div>
          </div>
          <button
            onClick={signOut}
            className="cursor-pointer rounded-[10px] border bg-transparent px-3 py-1.5 text-xs font-medium leading-none transition-all"
            style={{ borderColor: "var(--border)", color: "var(--t2)" }}
          >
            Log out
          </button>
        </div>

        {/* Mobile: name, email, badges below avatar row */}
        <div className="md:hidden">
          <div
            className="font-serif mb-1 text-xl font-semibold leading-[1.1]"
            style={{ color: "var(--t1)" }}
          >
            {displayName}
          </div>
          <div
            className="mb-2.5 text-sm truncate leading-none"
            style={{ color: "var(--t2)" }}
          >
            {user.email}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none"
              style={{
                background: "var(--tag-bg)",
                borderColor: "var(--tag-border)",
                color: "var(--t2)",
              }}
            >
              📅 Member since {joinedDate}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none"
              style={{
                background: "var(--tag-bg)",
                borderColor: "var(--tag-border)",
                color: "var(--gold)",
              }}
            >
              ✦ Filmood member
            </span>
          </div>
        </div>

        {/* Desktop: single row with avatar + info + logout */}
        <div className="hidden md:flex items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="flex cursor-pointer items-center justify-center rounded-full border-[3px] text-[28px] font-bold leading-none text-[#0a0a0c] transition-shadow hover:shadow-[0_0_0_2px_var(--gold)]"
              style={{
                width: "84px",
                height: "84px",
                background: "var(--gold)",
                borderColor: "var(--bg)",
                boxShadow: "0 0 0 1px var(--border)",
              }}
            >
              {initial}
            </div>
            <div
              className="absolute bottom-0 right-0 flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-full border text-[11px] transition-colors hover:border-[var(--border-h)]"
              style={{
                background: "var(--surface2)",
                borderColor: "var(--border)",
              }}
            >
              ✎
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div
              className="font-serif mb-[5px] text-[26px] font-semibold leading-[1.1]"
              style={{ color: "var(--t1)" }}
            >
              {displayName}
            </div>
            <div
              className="mb-2.5 text-sm leading-none"
              style={{ color: "var(--t2)" }}
            >
              {user.email}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-[5px] rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none"
                style={{
                  background: "var(--tag-bg)",
                  borderColor: "var(--tag-border)",
                  color: "var(--t2)",
                }}
              >
                📅 Member since {joinedDate}
              </span>
              <span
                className="inline-flex items-center gap-[5px] rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none"
                style={{
                  background: "var(--tag-bg)",
                  borderColor: "var(--tag-border)",
                  color: "var(--gold)",
                }}
              >
                ✦ Filmood member
              </span>
            </div>
          </div>

          {/* Logout */}
          <div className="ml-auto shrink-0">
            <button
              onClick={signOut}
              className="cursor-pointer rounded-[10px] border bg-transparent px-3.5 py-[7px] text-xs font-medium leading-none transition-all hover:text-[var(--t1)]"
              style={{ borderColor: "var(--border)", color: "var(--t2)" }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {/* 🔌 Replace each stat.value with real Supabase data when ready */}
      <div
        className="grid grid-cols-4 overflow-hidden rounded-xl border"
        style={{
          gap: "1px",
          background: "var(--border)",
          borderColor: "var(--border)",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`py-3 text-center px-2 sm:px-3 md:px-[18px] ${
              i === 0
                ? "rounded-l-xl"
                : i === stats.length - 1
                  ? "rounded-r-xl"
                  : ""
            }`}
            style={{ background: "var(--surface2)" }}
          >
            {/* Stat value */}
            <div
              className={`mb-1 font-bold leading-none ${stat.color}`}
              style={{ fontSize: "clamp(15px, 4vw, 22px)" }}
            >
              {stat.value}
            </div>
            {/* Full label from sm up */}
            <div
              className="hidden text-[10px] uppercase tracking-[0.8px] sm:block"
              style={{ color: "var(--t3)" }}
            >
              {stat.label}
            </div>
            {/* Abbreviated label on tiny screens */}
            <div
              className="block text-[9px] uppercase tracking-[0.5px] sm:hidden"
              style={{ color: "var(--t3)" }}
            >
              {stat.label.split(" ")[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
