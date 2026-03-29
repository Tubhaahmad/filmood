"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // If the user is already logged in, redirect to mood page
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/mood");
    }
  }, [user, authLoading, router]);

  //  State
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // Field-level errors from Zod validation
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string[]>>
  >({});

  // General error from Supabase (e.g. "Invalid login credentials")
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // ---------- Form Submit Handler ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({});
    setGeneralError(null);

    //  Validate with Zod
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    //  Call Supabase to sign in
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    setLoading(false);

    if (error) {
      // Supabase returned an error (e.g. wrong password, user not found)
      setGeneralError(error.message);
      return;
    }

    // Success — redirect to mood page
    router.push("/mood");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-black">
      <div className="w-full max-w-md">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-white/50 text-center mb-8">
          Log in to find your next film
        </p>

        {/*  General Error */}
        {generalError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-400">{generalError}</p>
          </div>
        )}

        {/*  Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm text-white/70 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-sm mt-1">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-white/70 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
              placeholder="Your password"
            />
            {fieldErrors.password && (
              <p className="text-red-400 text-sm mt-1">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-lg font-semibold transition-all
              ${
                loading
                  ? "bg-white/20 text-white/40 cursor-not-allowed"
                  : "bg-white text-black hover:bg-white/90 cursor-pointer"
              }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Link to Signup */}
        <p className="text-white/40 text-sm text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
