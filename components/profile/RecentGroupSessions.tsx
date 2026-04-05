"use client";

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
  //Replace PLACEHOLDER_SESSIONS with state loaded from Supabase
  const sessions = PLACEHOLDER_SESSIONS;

  return (
    <div className="mb-4 rounded-2xl border border-(--border) bg-(--surface) p-5.5">
      {/* Section label — matches .card-label */}
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[1.8px] text-(--t3)">
        Recent group sessions
      </div>

      {/* Session list — matches .session-list */}
      <div className="flex flex-col gap-2.5">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/film/${session.id}`}
            className="flex cursor-pointer items-center gap-3.5 rounded-xl border border-(--border) bg-(--surface2) p-3.5 no-underline transition-colors hover:border-(--border-h)"
          >
            {/* Poster — matches .session-poster */}
            <div
              className="h-15 w-10.5 shrink-0 rounded-[7px] bg-(--surface3) bg-cover bg-center"
              style={{ backgroundImage: `url('${session.posterUrl}')` }}
            />

            {/* Info — matches .session-info */}
            <div className="min-w-0 flex-1">
              {/* Film title — matches .session-film */}
              <div className="mb-0.75 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold leading-[1.2] text-(--t1)">
                {session.filmTitle}
              </div>

              {/* Meta — matches .session-meta */}
              <div className="mb-1.5 text-[11px] leading-none text-(--t3)">
                {session.meta}
              </div>

              {/* Participant avatars — matches .session-avatars */}
              <div className="flex items-center">
                {session.participants.map((p, i) => (
                  <div
                    key={i}
                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-(--surface2) text-[8px] font-semibold text-[#0a0a0c]"
                    style={{
                      background: p.color,
                      // Overlap avatars — first one has no negative margin
                      marginLeft: i === 0 ? 0 : "-4px",
                    }}
                  >
                    {p.initial}
                  </div>
                ))}
              </div>
            </div>

            {/* Result badge — matches .session-result-badge */}
            <span
              className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold leading-none ${
                session.result === "match"
                  ? "bg-(--teal-soft)-[var(--teal)]" // .badge-match
                  : "bg-(--gold-soft) text-(--gold)" // .badge-close
              }`}
            >
              {session.resultLabel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
