"use client";

//
// TO HOOK UP BACKEND:
//1. Create a `streaming_preferences` table in Supabase:
//        user_id  uuid primary key references auth.users(id)
//        platforms text[]
//
// 2. Load saved platforms on mount:
//        const { data } = await supabase
//          .from("streaming_preferences")
//          .select("platforms")
//          .eq("user_id", user.id)
//          .single()
//        if (data?.platforms) setActive(data.platforms)
//
//3. Save on toggle:
//        await supabase
//          .from("streaming_preferences")
//          .upsert({ user_id: user.id, platforms: next }, { onConflict: "user_id" })

import { useState } from "react";

// List of available streaming platforms in Norway
const PLATFORMS = [
  "Netflix",
  "Viaplay",
  "HBO Max",
  "TV 2 Play",
  "Disney+",
  "Prime Video",
];

export default function StreamingPreferences() {
  //Replace this with data loaded from Supabase (see above)
  const [active, setActive] = useState<string[]>([]);

  function toggle(platform: string) {
    // After updating state, also save to Supabase
    setActive((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-(--border) bg-(--surface) p-5.5">
      <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[1.8px] text-(--t3)">
        Streaming in Norway
      </div>
      <p className="mb-3.5 text-xs leading-relaxed text-(--t3)">
        Select the platforms you have access to — Filmood will prioritise films
        available to you.
      </p>

      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => {
          const isActive = active.includes(platform);
          return (
            <button
              key={platform}
              onClick={() => toggle(platform)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "border-(--teal)var(--teal-soft)] text-(--teal)"
                  : "border-(--border) bg-(--surface2) text-(--t2) hover:border-(--border-h) hover:text-(--t1)"
              }`}
            >
              {/* Dot indicator */}
              <span
                className="h-2 w-2 shrink-0 rounded-full transition-colors"
                style={{
                  background: isActive ? "var(--teal)" : "var(--border-h)",
                }}
              />
              {platform}
            </button>
          );
        })}
      </div>
    </div>
  );
}
