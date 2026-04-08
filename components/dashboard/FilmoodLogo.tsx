"use client";

/**
 * Filmood animated SVG logo
 */

type LogoVariant = "hero" | "nav" | "static";

interface FilmoodLogoProps {
  variant?: LogoVariant;
  /** CSS width — height is auto-derived from viewBox aspect ratio */
  size?: number | string;
  className?: string;
}

const variantClass: Record<LogoVariant, string> = {
  hero: "logo-drift",
  nav: "logo-drift-fast",
  static: "logo-static",
};

export default function FilmoodLogo({
  variant = "hero",
  size = 120,
  className = "",
}: FilmoodLogoProps) {
  return (
    <svg
      className={`${variantClass[variant]} ${className}`}
      viewBox="0 0 38 36"
      fill="none"
      role="img"
      aria-label="Filmood logo"
      style={{ width: typeof size === "number" ? `${size}px` : size, height: "auto" }}
    >
      <circle
        className="c1"
        cx="19"
        cy="12"
        r="11"
        fill="var(--gold)"
        opacity="0.35"
        stroke="var(--gold)"
        strokeWidth="1.3"
      />
      <circle
        className="c2"
        cx="12"
        cy="24"
        r="11"
        fill="var(--blue)"
        opacity="0.35"
        stroke="var(--blue)"
        strokeWidth="1.3"
      />
      <circle
        className="c3"
        cx="26"
        cy="24"
        r="11"
        fill="var(--rose)"
        opacity="0.35"
        stroke="var(--rose)"
        strokeWidth="1.3"
      />
      <path
        className="play"
        d="M17 17 L23 20.5 L17 24Z"
        fill="var(--gold)"
        opacity="0.9"
        stroke="var(--t1)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
