"use client";

import { FiSearch } from "react-icons/fi";

const browseTags = [
  "Trending",
  "Top Rated",
  "New Releases",
  "In Cinemas",
  "By Genre",
  "Streaming in Norway",
];

const trendingToday = [
  { rank: "01", title: "Dune: Part Two", genre: "Sci-Fi" },
  { rank: "02", title: "The Brutalist", genre: "Drama" },
  { rank: "03", title: "Anora", genre: "Drama" },
  { rank: "04", title: "Nosferatu", genre: "Horror" },
];

export default function SearchBox() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-active)",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 0 0 1px var(--border-active)",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.8px",
          color: "#527bc7",
          marginBottom: "12px",
        }}
      >
        Search
      </div>

      <h2
        className="font-serif"
        style={{
          fontSize: "clamp(20px, 2.2vw, 26px)",
          fontWeight: 600,
          color: "var(--t1)",
          lineHeight: 1.2,
          marginBottom: "6px",
        }}
      >
        Find anything
      </h2>

      <p style={{ fontSize: "13px", color: "var(--t2)", lineHeight: 1.5, marginBottom: "16px" }}>
        Search by film title, actor, or director.
      </p>

      <div className="relative mb-3.5">
        <FiSearch
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--t3)" }}
        />
        <input
          type="text"
          placeholder="Film, actor, director..."
          aria-label="Search films, actors, or directors"
          style={{
            width: "100%",
            borderRadius: "12px",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            color: "var(--t1)",
            padding: "11px 14px 11px 40px",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      <div className="mb-4.5 flex flex-wrap gap-2">
        {browseTags.map((tag) => (
          <button
            key={tag}
            type="button"
            style={{
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--t2)",
              fontSize: "12px",
              lineHeight: 1,
              padding: "8px 11px",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <div>
        <div
          style={{
            color: "var(--t3)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          Trending Today
        </div>

        <div className="flex flex-col gap-2.5">
          {trendingToday.map((item) => (
            <div key={item.rank} className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5">
              <span style={{ color: "var(--t3)", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>
                {item.rank}
              </span>
              <span style={{ color: "var(--t1)", fontSize: "14px", fontWeight: 500 }}>{item.title}</span>
              <span style={{ color: "var(--t3)", fontSize: "12px" }}>{item.genre}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}