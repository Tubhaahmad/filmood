"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useAuth } from "./AuthProvider";
import FilmoodLogo from "./dashboard/FilmoodLogo";

function getThemeSnapshot(): "dark" | "light" {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return { theme, toggle };
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <nav
      className="flex items-center justify-between"
      style={{
        padding: "14px 28px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <Link
        href="/"
        className="font-serif no-underline flex items-center"
        style={{
          gap: "8px",
          fontSize: "22px",
          fontWeight: 600,
          color: "var(--t1)",
          letterSpacing: "-0.3px",
        }}
      >
        <FilmoodLogo variant="nav" size={28} />
        Filmood
      </Link>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2.5">
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="flex items-center justify-center cursor-pointer"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            fontSize: "14px",
            color: "var(--t2)",
            transition: "border-color 0.2s",
          }}
          title="Toggle theme"
        >
          {theme === "dark" ? "☾" : "☀"}
        </button>

        {/* Guest only */}
        {!loading && !user && (
          <div className="flex gap-1.5">
            <Link
              href="/login"
              className="no-underline"
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--t2)",
                border: "1px solid var(--border)",
              }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="no-underline"
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                background: "var(--gold)",
                color: "#0a0a0c",
                border: "none",
              }}
            >
              Sign up
            </Link>
          </div>
        )}

        {/* Logged in only */}
        {!loading && user && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={signOut}
              className="cursor-pointer"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--t3)",
                background: "none",
                border: "none",
              }}
            >
              Sign out
            </button>
            <Link href="/profile" style={{ textDecoration: "none" }}>
              <div
                className="flex items-center justify-center transition-shadow duration-200 hover:shadow-[0_0_0_2px_var(--gold)]"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--gold)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#0a0a0c",
                }}
              >
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        style={{
          fontSize: "22px",
          color: "var(--t1)",
          background: "none",
          border: "none",
        }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full flex flex-col items-end gap-4 md:hidden"
          style={{
            padding: "20px 28px",
            background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="cursor-pointer"
            style={{
              fontSize: "14px",
              color: "var(--t2)",
              background: "none",
              border: "none",
            }}
          >
            {theme === "dark" ? "☾ Dark" : "☀ Light"}
          </button>

          {/* Guest only */}
          {!loading && !user && (
            <>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="no-underline"
                style={{ fontSize: "14px", color: "var(--t2)" }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="no-underline"
                style={{ fontSize: "14px", color: "var(--gold)" }}
              >
                Sign up
              </Link>
            </>
          )}

          {/* Logged in only */}
          {!loading && user && (
            <>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="no-underline"
                style={{ fontSize: "14px", color: "var(--t1)" }}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="cursor-pointer"
                style={{
                  fontSize: "14px",
                  color: "var(--t3)",
                  background: "none",
                  border: "none",
                }}
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
