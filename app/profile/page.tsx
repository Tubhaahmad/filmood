"use client";

// Currently shows placeholder data — no Supabase queries yet.
// TO HOOK UP BACKEND:
// 1. Create a `group_sessions` table in Supabase:
//        id            uuid default gen_random_uuid() primary key
//        created_by    uuid references auth.users(id)
//        film_id       integer
//        film_title    text
//        poster_path   text
//        result        text  -- e.g. "Perfect match" | "Close call"
//        created_at    timestamp default now()
//
//2. Create a `session_participants` table:
//        session_id    uuid references group_sessions(id)
//        user_id       uuid references auth.users(id)
//        initial       text  -- first letter of participant's name
//        color         text  -- accent colour for their avatar
//
//3. Fetch sessions here:
//        const { data } = await supabase
//          .from("group_sessions")
//          .select("*, session_participants(*)")
//          .eq("created_by", user.id)
//          .order("created_at", { ascending: false })
//          .limit(3)
//        setSessions(data ?? [])

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import { useEffect } from "react";
import ProfileHero from "@/components/profile/ProfileHero";
import AccountSettings from "@/components/profile/AccountSettings";
import StreamingPreferences from "@/components/profile/StreamingPreferences";
import MoodHistory from "@/components/profile/MoodHistory";
import WatchlistPreview from "@/components/profile/WatchlistPreview";
import DangerZone from "@/components/profile/DangerZone";
import RecentGroupSessions from "@/components/profile/RecentGroupSessions";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-(--bg) flex items-center justify-center">
        <p className="text-[14px] text-(--t3)">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--bg)">
      <div className="mx-auto max-w-275 px-7 pt-8 pb-16 md:px-3.5 md:pt-5 md:pb-12">
        <div style={{ marginBottom: "16px" }}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Profile" },
            ]}
          />
        </div>
        <ProfileHero user={user} />

        <div className="mt-5 grid grid-cols-1 gap-5 items-start lg:grid-cols-[340px_1fr]">
          <div>
            <AccountSettings user={user} />
            <StreamingPreferences />
            <DangerZone />
          </div>
          <div>
            <MoodHistory />
            <WatchlistPreview />
            <RecentGroupSessions />
          </div>
        </div>
      </div>
    </main>
  );
}
