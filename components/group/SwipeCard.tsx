"use client";

import type { DeckFilm } from "@/lib/types";
import { moodMap } from "@/lib/moodMap";
import { genreMap } from "@/lib/genres";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { ACCENT_VARS } from "@/lib/constants";

interface SwipeCardProps {
  film: DeckFilm;
  index: number;
  total: number;
  exitDirection: "left" | "right" | "up" | null;
  dragOffset: { x: number; y: number };
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}

// Exit transforms keyed by direction
const EXIT_TRANSFORMS: Record<string, string> = {
  left: "translateX(-120%) rotate(-8deg)",
  right: "translateX(120%) rotate(8deg)",
  up: "translateY(-80%) scale(0.92)",
};

export default function SwipeCard({
  film,
  index,
  total,
  exitDirection,
  dragOffset,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: SwipeCardProps) {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  const year = film.release_date?.split("-")[0] || "";
  const rating = film.vote_average?.toFixed(1) || "---";
  const posterUrl = film.poster_path
    ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
    : null;

  // Drag visual feedback
  const rotation = isDragging ? dragOffset.x * 0.04 : 0;
  const dragX = isDragging ? dragOffset.x : 0;
  const dragY = isDragging ? Math.min(dragOffset.y, 0) * 0.3 : 0;

  // Directional color glow while dragging
  let glowColor = "transparent";
  let glowLabel = "";
  if (isDragging) {
    if (dragOffset.x > 40) {
      glowColor = "rgba(90,170,143,0.25)";
      glowLabel = "Yes";
    } else if (dragOffset.x < -40) {
      glowColor = "rgba(196,107,124,0.25)";
      glowLabel = "Nah";
    } else if (dragOffset.y < -40) {
      glowColor = "rgba(196,163,90,0.25)";
      glowLabel = "Maybe";
    }
  }

  const isExiting = !!exitDirection;

  // Resolve mood tags from mood_keys
  const moodTags = (film.mood_keys ?? [])
    .map((key) => {
      const config = moodMap[key];
      if (!config) return null;
      return { label: config.tagLabel, accent: config.accentColor };
    })
    .filter(Boolean) as { label: string; accent: string }[];

  // Resolve genre names from genre_ids (max 3 to keep it clean)
  const genres = (film.genre_ids ?? [])
    .map((id) => genreMap[id])
    .filter(Boolean)
    .slice(0, 3);

  // Always side-by-side — just adjust poster width per breakpoint
  const posterWidth = isMobile ? "120px" : isTablet ? "180px" : "240px";
  const infoPad = isMobile ? "14px 16px" : "24px 28px";
  const titleSize = isMobile ? "18px" : "24px";
  const overviewClamp = isMobile ? 3 : 4;
  const overviewSize = isMobile ? "12px" : "13px";
  const posterMinH = isMobile ? "240px" : isTablet ? "300px" : "360px";

  return (
    <div
      style={{
        position: "relative",
        zIndex: 3,
        background: "var(--surface2)",
        border: "1px solid var(--border-active)",
        borderRadius: "16px",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: `${posterWidth} 1fr`,
        userSelect: "none",
        transform: isExiting
          ? EXIT_TRANSFORMS[exitDirection!]
          : `translate(${dragX}px, ${dragY}px) rotate(${rotation}deg)`,
        opacity: isExiting ? 0 : 1,
        transition: isDragging
          ? "none"
          : isExiting
            ? "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease"
            : "transform 0.25s ease",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Directional glow overlay */}
      {isDragging && glowLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "16px",
            pointerEvents: "none",
            background: glowColor,
            transition: "background 0.15s ease",
          }}
        >
          <span
            className="font-sans"
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color:
                glowLabel === "Yes"
                  ? "var(--teal)"
                  : glowLabel === "Nah"
                    ? "var(--rose)"
                    : "var(--gold)",
              opacity: Math.min(
                1,
                Math.max(Math.abs(dragOffset.x), Math.abs(dragOffset.y)) / 100,
              ),
            }}
          >
            {glowLabel}
          </span>
        </div>
      )}

      {/* Poster */}
      <div
        role="img"
        aria-label={`${film.title} poster`}
        style={{
          position: "relative",
          width: "100%",
          minHeight: posterMinH,
          backgroundImage: posterUrl
            ? `url(${posterUrl})`
            : "linear-gradient(160deg, #1a1520, #2a1f35 30%, #0d1520)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {/* Counter badge */}
        <div
          className="font-sans"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 2,
            padding: "3px 8px",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            fontSize: "10px",
            fontWeight: 600,
            lineHeight: 1,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {index + 1} / {total}
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          padding: infoPad,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: titleSize,
            lineHeight: 1.15,
            fontWeight: 600,
            color: "var(--t1)",
            marginBottom: "6px",
            letterSpacing: "-0.3px",
          }}
        >
          {film.title}
        </h2>

        {/* Year + Rating row */}
        <div
          className="font-sans"
          style={{
            fontSize: "12px",
            color: "var(--t3)",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {year && <span>{year}</span>}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--gold)",
              fontWeight: 600,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="var(--gold)">
              <path d="M6 .5l1.55 3.6 3.95.5-2.9 2.7.7 3.9L6 9.3 2.7 11.2l.7-3.9L.5 4.6l3.95-.5z" />
            </svg>
            {rating}
          </span>
        </div>

        {/* Mood pills */}
        {moodTags.length > 0 && (
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "6px" }}>
            {moodTags.map((tag) => {
              const vars = ACCENT_VARS[tag.accent as keyof typeof ACCENT_VARS] ?? ACCENT_VARS.gold;
              return (
                <span
                  key={tag.label}
                  className="font-sans"
                  style={{
                    padding: "3px 8px",
                    borderRadius: "100px",
                    fontSize: isMobile ? "9px" : "10px",
                    fontWeight: 600,
                    lineHeight: 1,
                    color: vars.color,
                    background: vars.bg,
                    border: `1px solid ${vars.border}`,
                  }}
                >
                  {tag.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Genre pills */}
        {genres.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: isMobile ? "8px" : "14px" }}>
            {genres.map((name) => (
              <span
                key={name}
                className="font-sans"
                style={{
                  padding: "3px 8px",
                  borderRadius: "100px",
                  fontSize: isMobile ? "9px" : "10px",
                  fontWeight: 500,
                  lineHeight: 1,
                  background: "var(--tag-bg)",
                  border: "1px solid var(--tag-border)",
                  color: "var(--t2)",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        )}

        <p
          className="font-sans"
          style={{
            fontSize: overviewSize,
            lineHeight: 1.5,
            color: "var(--t2)",
            display: "-webkit-box",
            WebkitLineClamp: overviewClamp,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {film.overview}
        </p>
      </div>
    </div>
  );
}
