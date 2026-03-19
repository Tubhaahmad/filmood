"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { signupSchema, type SignupFormData } from "@/lib/validations";

export default function SignupPage() {
  // Form fields: what the user has typed so far
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Field-level errors from Zod validation
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string[]>>
  >({});

  // General error from Supabase (e.g. "User already exists")
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Success message (shown after signup, before redirect)
  const [success, setSuccess] = useState(false);

  // Loading state — prevents double-clicking the submit button
  const [loading, setLoading] = useState(false);

  // Router for navigation after successful signup
  const router = useRouter();

  // ---------- Form Submit Handler ----------
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the browser from reloading the page (default form behavior)
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({});
    setGeneralError(null);

    //  Validate with Zod
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return; // Stop here — don't call Supabase
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          name: result.data.name, // Stored in Supabase user metadata
        },
      },
    });

    setLoading(false);

    if (error) {
      // Supabase returned an error (e.g. email already taken)
      setGeneralError(error.message);
      return;
    }

    // Success! Show message and redirect
    setSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-black">
      <div className="w-full max-w-md">
        {/* ---------- Header ---------- */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>
        <p className="text-white/50 text-center mb-8">
          Join Filmood to save your favorite films
        </p>

        {/* ---------- Success Message ---------- */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-green-400">
              Account created! Check your email to confirm, then you&apos;ll be
              redirected...
            </p>
          </div>
        )}

        {/* ---------- General Error ---------- */}
        {generalError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-400">{generalError}</p>
          </div>
        )}

        {/* ---------- Form ---------- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm text-white/70 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
              placeholder="Your name"
            />
            {/* Show Zod validation error for name */}
            {fieldErrors.name && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

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
            {/* Show Zod validation error for email */}
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
              placeholder="At least 6 characters"
            />
            {/* Show Zod validation error for password */}
            {fieldErrors.password && (
              <p className="text-red-400 text-sm mt-1">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-white/70 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
              placeholder="Re-enter your password"
            />
            {/* Show Zod validation error for confirmPassword */}
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-3 rounded-lg text-lg font-semibold transition-all
              ${
                loading || success
                  ? "bg-white/20 text-white/40 cursor-not-allowed"
                  : "bg-white text-black hover:bg-white/90 cursor-pointer"
              }`}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* ---------- Link to Login ---------- */}
        <p className="text-white/40 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
