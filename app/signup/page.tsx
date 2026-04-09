"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { signupSchema, type SignupFormData } from "@/lib/validations";

function useDynamicBackdrop() {
  const [backdrops, setBackdrops] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [fading, setFading] = useState(false);

  // Fetch trending movie backdrops on mount
  useEffect(() => {
    fetch("/api/movies/trending")
      .then((r) => r.json())
      .then((data) => {
        console.log("trending data:", data);
        console.log("first film:", data.films[0]);
        const urls: string[] = (data.results ?? data.films ?? data ?? [])
          .filter((m: { backdrop_path?: string }) => m.backdrop_path)
          .slice(0, 10)
          .map(
            (m: { backdrop_path: string }) =>
              `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
          );
        console.log("backdrop urls:", urls);
        if (urls.length > 0) setBackdrops(urls);
      })
      .catch(() => {}); // silently fall back to static image
  }, []);

  useEffect(() => {
    if (backdrops.length < 2) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % backdrops.length);
        setNextIndex((prev) => (prev + 1) % backdrops.length);
        setFading(false);
      }, 800); // fade duration
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

//signup form//

export default function SignupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { current, next, fading } = useDynamicBackdrop();

  useEffect(() => {
    if (!authLoading && user) router.push("/");
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string[]>>
  >({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [navHeight, setNavHeight] = useState(64);

  useEffect(() => {
    const updateNavHeight = () => {
      const nav = document.querySelector("nav");
      if (nav instanceof HTMLElement) {
        setNavHeight(nav.offsetHeight);
      }
    };

    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);
    return () => window.removeEventListener("resize", updateNavHeight);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: { data: { name: result.data.name } },
    });

    setLoading(false);

    if (error) {
      setGeneralError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
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
      {/* ── Left: cinematic panel ── */}
      <div className="hidden lg:flex flex-col justify-end flex-1 relative overflow-hidden p-12">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-800"
          style={{
            backgroundImage: `url('${current}')`,
            opacity: fading ? 0 : 1,
          }}
        />

        {/* Next backdrop (pre-loaded underneath) */}
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

      {/* ── Right: form panel ── */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-12 lg:px-12">
        <div className="w-full max-w-100">
          {/* Header */}
          <div className="mb-7">
            <h1
              className="font-serif mb-2 text-[28px] font-semibold leading-[1.2]"
              style={{ color: "var(--t1)" }}
            >
              Create your account
            </h1>
            <p className="text-sm" style={{ color: "var(--t2)" }}>
              Already have one?{" "}
              <Link
                href="/login"
                className="font-medium no-underline hover:underline"
                style={{ color: "var(--gold)" }}
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Success */}
          {success && (
            <div
              className="mb-5 rounded-xl border px-4 py-3 text-sm text-center"
              style={{
                background: "var(--teal-soft)",
                borderColor: "rgba(90,170,143,0.2)",
                color: "var(--teal)",
              }}
            >
              Account created! Check your email to confirm — redirecting…
            </div>
          )}

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
            {/* Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "var(--t2)" }}
              >
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your name"
                className={inputClass(!!fieldErrors.name)}
                style={{ background: "var(--surface)", color: "var(--t1)" }}
              />
              {fieldErrors.name && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--rose)" }}
                >
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "var(--t2)" }}
              >
                Email address
              </label>
              <input
                id="signup-email"
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
                htmlFor="signup-password"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "var(--t2)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="At least 6 characters"
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

            {/* Confirm password */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "var(--t2)" }}
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Re-enter your password"
                  className={inputClass(!!fieldErrors.confirmPassword)}
                  style={{ background: "var(--surface)", color: "var(--t1)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent text-sm"
                  style={{ color: "var(--t3)" }}
                >
                  {showConfirm ? "🔒" : "👁"}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--rose)" }}
                >
                  {fieldErrors.confirmPassword[0]}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full cursor-pointer rounded-xl border-none py-3.5 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--gold)", color: "#0a0a0c" }}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p
            className="mt-4 text-center text-xs"
            style={{ color: "var(--t3)" }}
          >
            By signing up you agree to our{" "}
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
