"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Wrap any page that requires a logged-in user.
// Loading → shows a loading message (no flash of protected content).
// Not logged in → redirects to /login.
// Logged in → renders the page normally.
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Still checking session — don't show anything yet
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-content-secondary">Loading...</p>
      </main>
    );
  }

  // Not logged in — useEffect will redirect, render nothing in the meantime
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
