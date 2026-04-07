"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { DeckFilm, SwipeVote } from "@/lib/types";
import SwipeCard from "./SwipeCard";

interface SwipeDeckProps {
  deck: DeckFilm[];
  startIndex: number;
  onVote: (movieId: number, vote: SwipeVote) => void;
  disabled: boolean;
}

const SWIPE_THRESHOLD = 80;
const SWIPE_Y_THRESHOLD = 60;

// Vote button config — keeps the JSX clean
const VOTE_BUTTONS: {
  vote: SwipeVote;
  label: string;
  color: string;
  hoverBg: string;
  hoverText: string;
  size: number;
  icon: React.ReactNode;
}[] = [
  {
    vote: "no",
    label: "Nah",
    color: "var(--rose)",
    hoverBg: "var(--rose)",
    hoverText: "#fff",
    size: 56,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 5l10 10M15 5L5 15" />
      </svg>
    ),
  },
  {
    vote: "maybe",
    label: "Maybe",
    color: "var(--gold)",
    hoverBg: "var(--gold)",
    hoverText: "#0a0a0c",
    size: 46,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 10.5c2-3 4-3 6 0s4 3 6 0" />
      </svg>
    ),
  },
  {
    vote: "yes",
    label: "Yes",
    color: "var(--teal)",
    hoverBg: "var(--teal)",
    hoverText: "#0a0a0c",
    size: 56,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 10.5l4 4 7-7" />
      </svg>
    ),
  },
];

export default function SwipeDeck({
  deck,
  startIndex,
  onVote,
  disabled,
}: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up" | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<SwipeVote | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const votingRef = useRef(false);

  useEffect(() => {
    setCurrentIndex((prev) => Math.max(prev, startIndex));
  }, [startIndex]);

  const triggerVote = useCallback(
    (vote: SwipeVote) => {
      if (votingRef.current || disabled || currentIndex >= deck.length) return;
      votingRef.current = true;
      setIsVoting(true);

      const direction =
        vote === "no" ? "left" : vote === "yes" ? "right" : "up";
      setExitDirection(direction);

      const movieId = deck[currentIndex].id;

      setTimeout(() => {
        onVote(movieId, vote);
        setCurrentIndex((prev) => prev + 1);
        setExitDirection(null);
        setDragOffset({ x: 0, y: 0 });
        votingRef.current = false;
        setIsVoting(false);
      }, 380);
    },
    [currentIndex, deck, disabled, onVote],
  );

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") triggerVote("no");
      else if (e.key === "ArrowRight") triggerVote("yes");
      else if (e.key === "ArrowDown") triggerVote("maybe");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [triggerVote]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || votingRef.current) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current || !isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > SWIPE_THRESHOLD) {
      triggerVote("yes");
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      triggerVote("no");
    } else if (dragOffset.y < -SWIPE_Y_THRESHOLD) {
      triggerVote("maybe");
    } else {
      setDragOffset({ x: 0, y: 0 });
    }

    dragStart.current = null;
  };

  if (currentIndex >= deck.length) return null;

  const currentFilm = deck[currentIndex];
  const hasNext = currentIndex + 1 < deck.length;
  const hasNextNext = currentIndex + 2 < deck.length;

  return (
    <div style={{ width: "100%" }}>
      {/* Card stack */}
      <div style={{ position: "relative", width: "100%" }}>
        {/* Ghost shadow cards */}
        {hasNextNext && (
          <div
            style={{
              position: "absolute",
              inset: "5px 8px -5px 8px",
              borderRadius: "16px",
              border: "1px solid var(--border-h)",
              background: "var(--surface2)",
              pointerEvents: "none",
              opacity: 0.35,
              zIndex: 1,
            }}
          />
        )}
        {hasNext && (
          <div
            style={{
              position: "absolute",
              inset: "2px 4px -2px 4px",
              borderRadius: "16px",
              border: "1px solid var(--border-h)",
              background: "var(--surface2)",
              pointerEvents: "none",
              opacity: 0.6,
              zIndex: 2,
            }}
          />
        )}

        <SwipeCard
          film={currentFilm}
          index={currentIndex}
          total={deck.length}
          exitDirection={exitDirection}
          dragOffset={dragOffset}
          isDragging={isDragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>

      {/* Vote buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "28px 0 8px",
        }}
      >
        {VOTE_BUTTONS.map((btn) => {
          const isHovered = hoveredBtn === btn.vote;
          return (
            <button
              key={btn.vote}
              onClick={() => triggerVote(btn.vote)}
              onMouseEnter={() => setHoveredBtn(btn.vote)}
              onMouseLeave={() => setHoveredBtn(null)}
              disabled={disabled || isVoting}
              aria-label={`Vote ${btn.vote}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                cursor: disabled || isVoting ? "default" : "pointer",
                background: "none",
                border: "none",
                padding: 0,
                opacity: disabled || isVoting ? 0.4 : 1,
                transform: isHovered ? "scale(1.08)" : "scale(1)",
                transition: "transform 0.2s",
              }}
            >
              <span
                style={{
                  width: `${btn.size}px`,
                  height: `${btn.size}px`,
                  borderRadius: "50%",
                  border: `2px solid ${btn.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isHovered ? btn.hoverText : btn.color,
                  background: isHovered ? btn.hoverBg : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {btn.icon}
              </span>
              <span
                className="font-sans"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: isHovered ? btn.color : "var(--t3)",
                  transition: "color 0.2s",
                }}
              >
                {btn.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Keyboard hints */}
      <div
        className="swipe-key-hints"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "28px",
          padding: "6px 0 0",
        }}
      >
        {[
          { key: "\u2190", label: "Nah" },
          { key: "\u2193", label: "Maybe" },
          { key: "\u2192", label: "Yes" },
        ].map((h) => (
          <span
            key={h.label}
            className="font-sans"
            style={{
              fontSize: "10px",
              color: "var(--t3)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <kbd
              style={{
                padding: "1px 5px",
                borderRadius: "4px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                fontSize: "9px",
                fontWeight: 600,
                lineHeight: 1.2,
                color: "var(--t2)",
                fontFamily: "var(--sans)",
              }}
            >
              {h.key}
            </kbd>
            {h.label}
          </span>
        ))}
      </div>
    </div>
  );
}
