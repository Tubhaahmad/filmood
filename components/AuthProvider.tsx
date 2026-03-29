"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// The shape of what every component gets access to via useAuth()
interface AuthContextType {
  user: User | null;
  session: Session | null; // session.access_token is what the API routes need
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the context with safe defaults (no user, still loading)
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

// Custom hook — components call useAuth() instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires for every auth event:
    // INITIAL_SESSION (on mount), SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED
    // This single listener handles all of them.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // State clears automatically — onAuthStateChange fires SIGNED_OUT
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
