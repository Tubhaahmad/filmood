"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

function useTheme() {
  // Always start "dark" to match server-rendered HTML (data-theme="dark").
  // The inline script in layout.tsx may have already flipped the DOM to "light",
  // so we sync from the DOM after mount to avoid a hydration mismatch.
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light") setTheme("light");
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  return { theme, toggle, mounted };
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { theme, toggle: toggleTheme, mounted } = useTheme();

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between"
      style={{
        padding: "14px 28px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <Link
        href="/"
        className="font-serif no-underline"
        style={{ fontSize: "22px", fontWeight: 600, color: "var(--t1)", letterSpacing: "-0.3px" }}
      >
        Filmood
      </Link>

      <div className="hidden md:flex items-center gap-[10px]">
        <button
          onClick={toggleTheme}
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
          {!mounted || theme === "dark" ? "☾" : "☀"}
        </button>

        {!loading && !user && (
          <div className="flex gap-[6px]">
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

        {!loading && user && (
          <div className="flex items-center gap-[10px]">
            <button
              onClick={signOut}
              className="cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 500, color: "var(--t3)", background: "none", border: "none" }}
            >
              Sign out
            </button>
            <div
              className="flex items-center justify-center"
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
          </div>
        )}
      </div>

      <button
        className="md:hidden cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        style={{ fontSize: "22px", color: "var(--t1)", background: "none", border: "none" }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full flex flex-col items-end gap-[16px] md:hidden"
          style={{ padding: "20px 28px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={toggleTheme}
            className="cursor-pointer"
            style={{ fontSize: "14px", color: "var(--t2)", background: "none", border: "none" }}
          >
            {!mounted || theme === "dark" ? "☾ Dark" : "☀ Light"}
          </button>
          {!loading && !user && (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)} className="no-underline" style={{ fontSize: "14px", color: "var(--t2)" }}>Log in</Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="no-underline" style={{ fontSize: "14px", color: "var(--gold)" }}>Sign up</Link>
            </>
          )}
          {!loading && user && (
            <button onClick={() => { signOut(); setIsOpen(false); }} className="cursor-pointer" style={{ fontSize: "14px", color: "var(--t3)", background: "none", border: "none" }}>Sign out</button>
          )}
        </div>
      )}
    </nav>
  );
}
