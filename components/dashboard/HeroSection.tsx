"use client";

import { useState, useEffect, useCallback } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import FilmoodLogo from "./FilmoodLogo";

/**
 * Mood reel — each entry has a word, the accent color it maps to,
 * and the CSS variable names for the ambient orb coloring.
 */
const MOOD_REEL = [
  { word: "Euphoric", accent: "var(--gold)", glow: "var(--gold-glow)", soft: "var(--gold-soft)" },
  { word: "Tender", accent: "var(--rose)", glow: "var(--rose-glow)", soft: "var(--rose-soft)" },
  { word: "Thrilling", accent: "var(--ember)", glow: "var(--ember-glow)", soft: "var(--ember-soft)" },
  { word: "Melancholic", accent: "var(--blue)", glow: "var(--blue-glow)", soft: "var(--blue-soft)" },
  { word: "Curious", accent: "var(--violet)", glow: "var(--violet-glow)", soft: "var(--violet-soft)" },
  { word: "Cozy", accent: "var(--teal)", glow: "var(--teal-glow)", soft: "var(--teal-soft)" },
  { word: "Inspired", accent: "var(--gold)", glow: "var(--gold-glow)", soft: "var(--gold-soft)" },
  { word: "Restless", accent: "var(--ember)", glow: "var(--ember-glow)", soft: "var(--ember-soft)" },
];

export default function HeroSection() {
  const isMobile = useMediaQuery("(max-width: 899px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const [moodIndex, setMoodIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Cycle mood words every 3s
  useEffect(() => {
    if (prefersReducedMotion) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      timeoutId = setTimeout(() => {
        setMoodIndex((prev) => (prev + 1) % MOOD_REEL.length);
        setIsTransitioning(false);
      }, 500);
    }, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion]);

  const currentMood = MOOD_REEL[moodIndex];

  const handleScrollDown = useCallback(() => {
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
      dashboard.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <section
      aria-label="Filmood — Play Your Mood"
      style={{
        position: "relative",
        width: "100%",
        height: isMobile ? "40vh" : "42vh",
        minHeight: isMobile ? "280px" : "320px",
        maxHeight: "460px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Ambient atmosphere  ── */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}
      >
        {/* Primary orb — follows current mood accent */}
        <div
          className="hero-orb"
          style={{
            position: "absolute",
            top: isMobile ? "-20%" : "-15%",
            left: "50%",
            width: isMobile ? "380px" : "580px",
            height: isMobile ? "300px" : "440px",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${currentMood.glow} 0%, transparent 70%)`,
            opacity: 0.8,
            transition: "background 1.2s ease",
            animation: prefersReducedMotion ? "none" : "heroOrbDrift1 16s ease-in-out infinite",
          }}
        />

        {/* Secondary orb — offset, softer */}
        <div
          className="hero-orb"
          style={{
            position: "absolute",
            bottom: isMobile ? "-25%" : "-20%",
            left: isMobile ? "5%" : "20%",
            width: isMobile ? "300px" : "440px",
            height: isMobile ? "260px" : "360px",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${currentMood.soft} 0%, transparent 65%)`,
            opacity: 0.6,
            transition: "background 1.2s ease",
            animation: prefersReducedMotion ? "none" : "heroOrbDrift2 20s ease-in-out infinite",
          }}
        />

        {/* Tertiary orb — opposite side */}
        <div
          className="hero-orb"
          style={{
            position: "absolute",
            bottom: isMobile ? "-15%" : "-10%",
            right: isMobile ? "0%" : "15%",
            width: isMobile ? "260px" : "380px",
            height: isMobile ? "220px" : "320px",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${currentMood.glow} 0%, transparent 70%)`,
            opacity: 0.4,
            transition: "background 1.2s ease",
            animation: prefersReducedMotion ? "none" : "heroOrbDrift3 18s ease-in-out infinite",
          }}
        />

        {/* Film grain texture */}
        <div className="hero-grain" />
      </div>

      {/* ── Bottom fade into page ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: "linear-gradient(to bottom, transparent 0%, var(--bg) 100%)",
          zIndex: 1,
        }}
      />

      {/* ── Content: logo + tagline + mood reel ── */}
      <div
        className="hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isMobile ? "14px" : "18px",
          padding: "0 24px",
        }}
      >
        <FilmoodLogo
          variant={prefersReducedMotion ? "static" : "hero"}
          size={isMobile ? 64 : 88}
        />

        {/* Tagline with cycling mood word */}
        <h1
          className="font-serif"
          style={{
            fontSize: isMobile ? "32px" : "48px",
            fontWeight: 600,
            color: "var(--t1)",
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
            textAlign: "center",
          }}
        >
          Play Your{" "}
          <span
            style={{
              display: "inline-block",
              color: currentMood.accent,
              transition: "color 0.8s ease, opacity 0.4s ease, transform 0.4s ease",
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
              minWidth: isMobile ? "140px" : "200px",
            }}
            aria-live="polite"
          >
            {currentMood.word}
          </span>
        </h1>

        {/* Mood indicator dots */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          {MOOD_REEL.map((mood, i) => (
            <div
              key={mood.word}
              style={{
                width: i === moodIndex ? "18px" : "4px",
                height: "4px",
                borderRadius: "2px",
                background: i === moodIndex ? currentMood.accent : "var(--border-active)",
                transition: "all 0.5s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Scroll hint ── */}
      <button
        onClick={handleScrollDown}
        aria-label="Scroll to dashboard"
        className="hero-scroll-hint"
        style={{
          position: "absolute",
          bottom: isMobile ? "20px" : "28px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--t3)",
        }}
      >
        <span
          className="font-sans"
          style={{
            fontSize: "9px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Explore
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          style={{ animation: prefersReducedMotion ? "none" : "heroChevron 2s ease-in-out infinite" }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </section>
  );
}
