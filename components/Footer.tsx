"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import FilmoodLogo from "./dashboard/FilmoodLogo";
import { allMoods } from "@/lib/moodMap";

const ACCENT_CSS: Record<string, string> = {
  gold: "var(--gold)",
  blue: "var(--blue)",
  rose: "var(--rose)",
  violet: "var(--violet)",
  teal: "var(--teal)",
  ember: "var(--ember)",
};

export default function Footer() {
  const { user, loading } = useAuth();

  return (
    <footer
      style={{
        position: "relative",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* Gold horizon glow at top edge */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "120px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, var(--gold-glow) 0%, transparent 70%)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      {/* Grain texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.03,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
        }}
      />

      <div
        className="footer-inner"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "48px 28px 0",
        }}
      >
        {/* ── Main grid: brand + nav columns ── */}
        <div className="footer-grid">
          {/* Brand */}
          <div style={{ maxWidth: "280px" }}>
            <Link
              href="/"
              className="font-serif"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--t1)",
                textDecoration: "none",
                marginBottom: "12px",
              }}
            >
              <FilmoodLogo variant="static" size={24} />
              Filmood
            </Link>
            <p
              className="font-sans"
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--t2)",
                margin: "0 0 16px",
              }}
            >
              Tell Filmood how you want to feel.
              <br />
              It tells you what to watch.
            </p>
          </div>

          {/* Discover column */}
          <div>
            <p
              className="font-sans"
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--t3)",
                marginBottom: "14px",
              }}
            >
              Discover
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/browse">Browse</FooterLink>
              <FooterLink href="/group">Group Session</FooterLink>
            </nav>
          </div>

          {/* Account column */}
          <div>
            <p
              className="font-sans"
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--t3)",
                marginBottom: "14px",
              }}
            >
              Account
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {!loading && user ? (
                <>
                  <FooterLink href="/profile">Profile</FooterLink>
                  <FooterLink href="/watchlist">Watchlist</FooterLink>
                </>
              ) : (
                <>
                  <FooterLink href="/login">Log in</FooterLink>
                  <FooterLink href="/signup">Sign up</FooterLink>
                </>
              )}
            </nav>
          </div>

          {/* Project column */}
          <div>
            <p
              className="font-sans"
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--t3)",
                marginBottom: "14px",
              }}
            >
              Project
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <FooterLink href="https://github.com/Tubhaahmad/filmood" external>
                GitHub
              </FooterLink>
              <FooterLink href="https://www.noroff.no" external>
                Noroff University
              </FooterLink>
            </nav>
          </div>
        </div>

        {/* ── Mood strip ── */}
        <div
          style={{
            marginTop: "36px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <p
            className="font-sans"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "var(--t3)",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            Pick a mood
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {allMoods.map((mood) => {
              const color = ACCENT_CSS[mood.accentColor] || "var(--t2)";
              return (
                <Link
                  key={mood.key}
                  href={`/results?mood=${mood.key}`}
                  className="font-sans footer-mood-pill"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "5px 14px",
                    borderRadius: "100px",
                    fontSize: "11px",
                    fontWeight: 600,
                    textDecoration: "none",
                    color,
                    background: "transparent",
                    border: `1px solid ${color}`,
                    opacity: 0.55,
                    transition: "opacity 0.2s, background 0.2s, transform 0.2s",
                  }}
                >
                  {mood.tagLabel}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            marginTop: "32px",
            padding: "20px 0",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {/* TMDB attribution */}
          <div
            className="font-sans"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "var(--t3)",
              lineHeight: 1.4,
            }}
          >
            <TmdbLogo />
            <span>
              Film data from{" "}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--t2)", textDecoration: "underline" }}
              >
                TMDB
              </a>
              . Not endorsed or certified by TMDB.
            </span>
          </div>

          {/* Copyright */}
          <p
            className="font-sans"
            style={{
              fontSize: "11px",
              color: "var(--t3)",
              margin: 0,
            }}
          >
            &copy; {new Date().getFullYear()} Filmood &middot; A Noroff University project
          </p>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 40px;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px 24px;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
        .footer-mood-pill:hover {
          opacity: 1 !important;
          transform: translateY(-1px);
        }
      `}</style>
    </footer>
  );
}

/* ── Sub-components ── */

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const style: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--t2)",
    textDecoration: "none",
    transition: "color 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans footer-nav-link"
        style={style}
      >
        {children}
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.5 }}
        >
          <path d="M4.5 1.5H10.5V7.5" />
          <path d="M10.5 1.5L1.5 10.5" />
        </svg>
      </a>
    );
  }

  return (
    <Link href={href} className="font-sans footer-nav-link" style={style}>
      {children}
    </Link>
  );
}

function TmdbLogo() {
  return (
    <svg
      width="40"
      height="16"
      viewBox="0 0 190 28"
      fill="none"
      style={{ flexShrink: 0 }}
      aria-label="TMDB logo"
    >
      <defs>
        <linearGradient id="tmdb-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#90CEA1" />
          <stop offset="100%" stopColor="#01B4E4" />
        </linearGradient>
      </defs>
      <rect width="190" height="28" rx="4" fill="url(#tmdb-grad)" />
      <text
        x="95"
        y="19"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="16"
        fill="#081C22"
      >
        TMDB
      </text>
    </svg>
  );
}
