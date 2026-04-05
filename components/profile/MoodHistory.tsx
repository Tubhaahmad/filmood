"use client";

// Shows a bar chart of the user's most-used moods.
// Currently shows placeholder data — bars and labels are static.
//
//TO HOOK UP BACKEND:
//1. Create a `mood_history` table in Supabase:
//        id         uuid default gen_random_uuid() primary key
//        user_id    uuid references auth.users(id)
//        mood       text
//        created_at timestamp default now()
//
// 2. Record a mood pick when the user gets results:
//        await supabase.from("mood_history").insert({ user_id: user.id, mood: selectedMood })
//
//3. Load and count moods here:
//        const { data } = await supabase
//          .from("mood_history")
//          .select("mood")
//          .eq("user_id", user.id)
//        // count frequency of each mood, sort by highest, build bars array

// Replace this with real data from Supabase (see above).
// Each entry: mood label, bar fill percentage (0–100), and accent colour.
const PLACEHOLDER_MOODS = [
  { mood: "Escape", pct: 85, color: "var(--blue)" },
  { mood: "Wonder", pct: 65, color: "var(--violet)" },
  { mood: "Comfort", pct: 50, color: "var(--teal)" },
  { mood: "Laugh", pct: 30, color: "var(--gold)" },
  { mood: "Thrilling", pct: 15, color: "var(--ember)" },
];

export default function MoodHistory() {
  return (
    <div className="mb-4 rounded-2xl border border-(--border) bg-(--surface) p-5.5">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[1.8px] text-(--t3)">
        Mood history
      </div>

      <div className="flex flex-col gap-2.5">
        {PLACEHOLDER_MOODS.map(({ mood, pct, color }) => (
          <div key={mood} className="flex items-center gap-2.5">
            {/* Mood label */}
            <span className="w-22.5 shrink-0 text-xs font-medium text-(--t2)">
              {mood}
            </span>

            {/* Bar track */}
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--surface2)">
              {/* Replace pct with real percentage calculated from Supabase data */}
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>

            {/* Count — replace "—" with real count from Supabase */}
            <span className="w-7 text-right text-[11px] font-medium text-(--t3)">
              —
            </span>
          </div>
        ))}
      </div>

      {/* Placeholder note — remove this once real data is connected */}
      <p className="mt-3.5 text-[11px] text-(--t3)">
        Mood history will populate as you use Filmood.
      </p>
    </div>
  );
}
