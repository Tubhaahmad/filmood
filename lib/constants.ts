import type { AccentColor } from "./types";

/**
 * Consistent avatar colors for participants across all group pages.
 * Index by participant position so the same person
 * gets the same color in lobby, swipe, and results.
 */
export const AVATAR_COLORS: { bg: string; text: string }[] = [
  { bg: "var(--teal)", text: "#0a0a0c" },
  { bg: "var(--gold)", text: "#0a0a0c" },
  { bg: "var(--blue)", text: "#fff" },
  { bg: "var(--violet)", text: "#fff" },
  { bg: "var(--rose)", text: "#fff" },
  { bg: "var(--ember)", text: "#0a0a0c" },
];

/** Mood accent color → CSS variable triplets for mood/genre chips on cards */
export const ACCENT_VARS: Record<
  AccentColor,
  { color: string; bg: string; border: string }
> = {
  gold: { color: "var(--gold)", bg: "var(--gold-soft)", border: "rgba(196,163,90,0.25)" },
  blue: { color: "var(--blue)", bg: "var(--blue-soft)", border: "rgba(91,143,212,0.25)" },
  rose: { color: "var(--rose)", bg: "var(--rose-soft)", border: "rgba(196,107,124,0.25)" },
  violet: { color: "var(--violet)", bg: "var(--violet-soft)", border: "rgba(139,108,196,0.25)" },
  teal: { color: "var(--teal)", bg: "var(--teal-soft)", border: "rgba(90,170,143,0.25)" },
  ember: { color: "var(--ember)", bg: "var(--ember-soft)", border: "rgba(212,122,74,0.25)" },
};
