"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { loginSchema, type LoginFormData } from "@/lib/validations";

function useDynamicBackdrop() {
  const [backdrops, setBackdrops] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    fetch("/api/movies/trending")
      .then((r) => r.json())
      .then((data) => {
        const urls: string[] = (data.results ?? data.films ?? data ?? [])
          .filter((m: { backdrop_path?: string }) => m.backdrop_path)
          .slice(0, 10)
          .map(
            (m: { backdrop_path: string }) =>
              `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
          );
        if (urls.length > 0) setBackdrops(urls);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (backdrops.length < 2) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % backdrops.length);
        setNextIndex((prev) => (prev + 1) % backdrops.length);
        setFading(false);
      }, 800);
    }, 6000);
    return () => clearInterval(interval);
  }, [backdrops]);

  return {
    current:
      backdrops[currentIndex] ??
      "https://image.tmdb.org/t/p/original/wabiQjakDFOPGyGZo5h83Bbtqv2.jpg",
    next: backdrops[nextIndex] ?? null,
    fading,
  };
}

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { current, next, fading } = useDynamicBackdrop();

  useEffect(() => {
    if (!authLoading && user) router.push("/");
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string[]>>
  >({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });
    setLoading(false);

    if (error) {
      setGeneralError(error.message);
      return;
    }

    router.push("/");
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-[13px] rounded-xl text-sm outline-none transition-all border ${
      hasError
        ? "border-[var(--rose)] shadow-[0_0_0_3px_var(--rose-soft)]"
        : "border-[var(--border)] focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-soft)]"
    }`;

  return (
    <main
      className="flex min-h-screen"
      style={{ background: "var(--bg)", color: "var(--t1)" }}
    >
      {/* ── Left: cinematic panel — same as signup ── */}
      <div className="hidden lg:flex flex-col justify-end flex-1 relative overflow-hidden p-12">
        {/* Current backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-800"
          style={{
            backgroundImage: `url('${current}')`,
            opacity: fading ? 0 : 1,
          }}
        />

        {/* Next backdrop preloaded underneath */}
        {next && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${next}')`,
              opacity: 1,
              zIndex: -1,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,12,0.94) 0%, rgba(10,10,12,0.45) 50%, rgba(10,10,12,0.18) 100%)",
            zIndex: 1,
          }}
        />

        {/* Content — same structure as signup */}
        <div className="relative z-10">
          <Link
            href="/"
            className="font-serif block mb-8 no-underline"
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#f0efe8",
              letterSpacing: "-0.3px",
            }}
          >
            Filmood
          </Link>
          <div
            className="mb-3 text-[11px] font-medium uppercase tracking-[1.5px]"
            style={{ color: "rgba(240,239,232,0.4)" }}
          >
            How films should be found
          </div>
          <div
            className="font-serif mb-5 text-2xl italic leading-relaxed"
            style={{ color: "rgba(240,239,232,0.9)", maxWidth: "360px" }}
          >
            What do you feel like watching tonight?
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "Cozy and warm",
                color: "rgba(196,163,90,0.7)",
                border: "rgba(196,163,90,0.25)",
              },
              {
                label: "On the edge",
                color: "rgba(212,122,74,0.7)",
                border: "rgba(212,122,74,0.25)",
              },
              {
                label: "Mind-bending",
                color: "rgba(91,143,212,0.7)",
                border: "rgba(91,143,212,0.25)",
              },
              {
                label: "Butterflies",
                color: "rgba(196,107,124,0.7)",
                border: "rgba(196,107,124,0.25)",
              },
              {
                label: "Deeply moved",
                color: "rgba(139,108,196,0.7)",
                border: "rgba(139,108,196,0.25)",
              },
              {
                label: "Easy and light",
                color: "rgba(90,170,143,0.7)",
                border: "rgba(90,170,143,0.25)",
              },
            ].map((pill) => (
              <span
                key={pill.label}
                className="rounded-full px-4 py-1.5 text-xs font-medium"
                style={{
                  border: `1px solid ${pill.border}`,
                  color: pill.color,
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                {pill.label}
              </span>
            ))}
          </div>
          <p
            className="mt-5 text-xs leading-relaxed"
            style={{ color: "rgba(240,239,232,0.3)" }}
          >
            Join Filmood and discover films that match your mood, not just your
            search.
          </p>
        </div>
      </div>

      {/* ── Right: form panel — same structure as signup ── */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-12 lg:px-12">
        <div className="w-full max-w-100">
          {/* Header */}
          <div className="mb-7">
            <h1
              className="font-serif mb-2 text-[28px] font-semibold leading-[1.2]"
              style={{ color: "var(--t1)" }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "var(--t2)" }}>
              New to Filmood?{" "}
              <Link
                href="/signup"
                className="font-medium no-underline hover:underline"
                style={{ color: "var(--gold)" }}
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="h-px flex-1"
              style={{ background: "var(--border-h)" }}
            />
            <span
              className="text-[11px] font-medium tracking-[1px] uppercase"
              style={{ color: "var(--t3)" }}
            >
              or continue with email
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "var(--border-h)" }}
            />
          </div>

          {/* General error */}
          <div role="alert" aria-live="assertive">
            {generalError && (
              <div
                className="mb-5 rounded-xl border px-4 py-3 text-sm"
                style={{
                  background: "var(--rose-soft)",
                  borderColor: "rgba(196,107,124,0.2)",
                  color: "var(--rose)",
                }}
              >
                {generalError}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "var(--t2)" }}
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                className={inputClass(!!fieldErrors.email)}
                style={{ background: "var(--surface)", color: "var(--t1)" }}
              />
              {fieldErrors.email && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--rose)" }}
                >
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "var(--t2)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className={inputClass(!!fieldErrors.password)}
                  style={{ background: "var(--surface)", color: "var(--t1)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent text-sm"
                  style={{ color: "var(--t3)" }}
                >
                  {showPassword ? "🔒" : "👁"}
                </button>
              </div>
              {fieldErrors.password && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--rose)" }}
                >
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            {/* Remember me + forgot password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "var(--gold)" }}
                />
                <span className="text-xs" style={{ color: "var(--t2)" }}>
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-xs hover:underline"
                style={{ color: "var(--t2)" }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl border-none py-3.5 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--gold)", color: "#0a0a0c" }}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p
            className="mt-4 text-center text-xs"
            style={{ color: "var(--t3)" }}
          >
            By logging in you agree to our{" "}
            <a
              href="#"
              className="hover:underline"
              style={{ color: "var(--gold)" }}
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="hover:underline"
              style={{ color: "var(--gold)" }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
