"use client";

// ─────────────────────────────────────────────────────────────────────────────
// RecentGroupSessions.tsx
// Shows the user's 3 most recent group movie sessions with participants
// and match result badges.
// Currently shows placeholder data — no Supabase queries yet.
//
// 🔌 TO HOOK UP BACKEND:
//   1. Create a `group_sessions` table in Supabase:
//        id            uuid default gen_random_uuid() primary key
//        created_by    uuid references auth.users(id)
//        film_id       integer
//        film_title    text
//        poster_path   text
//        result        text  -- e.g. "Perfect match" | "Close call"
//        created_at    timestamp default now()
//
//   2. Create a `session_participants` table:
//        session_id    uuid references group_sessions(id)
//        user_id       uuid references auth.users(id)
//        initial       text
//        color         text
//
//   3. Fetch sessions here:
//        const { data } = await supabase
//          .from("group_sessions")
//          .select("*, session_participants(*)")
//          .eq("created_by", user.id)
//          .order("created_at", { ascending: false })
//          .limit(3)
//        setSessions(data ?? [])
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";

interface Participant {
  initial: string;
  color: string;
}

interface Session {
  id: string;
  filmTitle: string;
  posterUrl: string;
  meta: string;
  result: "match" | "close";
  resultLabel: string;
  participants: Participant[];
}

// ── PLACEHOLDER DATA ──────────────────────────────────────────────────────────
// 🔌 Replace this with real data loaded from Supabase (see above)
const PLACEHOLDER_SESSIONS: Session[] = [
  {
    id: "1",
    filmTitle: "Dune: Part Two",
    posterUrl:
      "https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    meta: "2 days ago · 4 participants",
    result: "match",
    resultLabel: "Perfect match",
    participants: [
      { initial: "S", color: "var(--gold)" },
      { initial: "M", color: "var(--blue)" },
      { initial: "A", color: "var(--teal)" },
      { initial: "K", color: "var(--rose)" },
    ],
  },
  {
    id: "2",
    filmTitle: "Flow",
    posterUrl:
      "https://image.tmdb.org/t/p/w300/jKCdBeyMRJdpUCvZXg0Y4jRKt5E.jpg",
    meta: "Last week · 3 participants",
    result: "close",
    resultLabel: "Close call",
    participants: [
      { initial: "S", color: "var(--gold)" },
      { initial: "M", color: "var(--blue)" },
      { initial: "L", color: "var(--violet)" },
    ],
  },
  {
    id: "3",
    filmTitle: "The Wild Robot",
    posterUrl:
      "https://image.tmdb.org/t/p/w300/wTnV0ANpRTbRkN1UrdAgW2hgPuW.jpg",
    meta: "2 weeks ago · 5 participants",
    result: "match",
    resultLabel: "Perfect match",
    participants: [
      { initial: "S", color: "var(--gold)" },
      { initial: "M", color: "var(--blue)" },
      { initial: "A", color: "var(--teal)" },
      { initial: "K", color: "var(--rose)" },
      { initial: "J", color: "var(--ember)" },
    ],
  },
];

export default function RecentGroupSessions() {
  // Replace PLACEHOLDER_SESSIONS with state loaded from Supabase
  const sessions = PLACEHOLDER_SESSIONS;

  return (
    <div
      className="mb-4 rounded-2xl border p-5.5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Section label */}
      <div
        className="mb-4 text-[10px] font-semibold uppercase tracking-[1.8px]"
        style={{ color: "var(--t3)" }}
      >
        Recent group sessions
      </div>

      {/* Session list */}
      <div className="flex flex-col gap-2.5">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/film/${session.id}`}
            className="flex cursor-pointer items-start gap-3 rounded-xl p-3 no-underline transition-colors"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface2)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-h)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            {/* Poster */}
            <div
              role="img"
              aria-label={`${session.filmTitle} poster`}
              className="h-15 w-10.5 shrink-0 rounded-[7px] bg-(--surface3) bg-cover bg-center"
              style={{ backgroundImage: `url('${session.posterUrl}')` }}
            />

            {/* Info + badge — stacked vertically so badge never overlaps */}
            <div className="min-w-0 flex-1 flex flex-col gap-1.5">
              {/* Top: title */}
              <div
                className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold leading-[1.2]"
                style={{ color: "var(--t1)" }}
              >
                {session.filmTitle}
              </div>

              {/* Meta */}
              <div
                className="text-[11px] leading-none"
                style={{ color: "var(--t3)" }}
              >
                {session.meta}
              </div>

              {/* Bottom row: avatars + badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Participant avatars */}
                <div className="flex items-center">
                  {session.participants.map((p, i) => (
                    <div
                      key={i}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-semibold text-[#0a0a0c]"
                      style={{
                        background: p.color,
                        marginLeft: i === 0 ? 0 : "-4px",
                        border: "2px solid var(--surface2)",
                      }}
                    >
                      {p.initial}
                    </div>
                  ))}
                </div>

                {/* Result badge */}
                <span
                  className="rounded-md px-2 py-1 text-[10px] font-semibold leading-none whitespace-nowrap"
                  style={
                    session.result === "match"
                      ? { background: "var(--teal-soft)", color: "var(--teal)" }
                      : { background: "var(--gold-soft)", color: "var(--gold)" }
                  }
                >
                  {session.resultLabel}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
