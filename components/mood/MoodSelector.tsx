// =============================================
// MOODSELECTOR COMPONENT
// =============================================
// This is the parent component that:
// 1. Loads all 10 moods from moodMap.ts
// 2. Renders a MoodCard for each one
// 3. Tracks which mood is currently selected (useState)
// 4. When "Find My Film" is clicked, navigates to /results?mood=laugh
//
// "use client" — needed for useState and useRouter (browser-only features)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { allMoods } from "@/lib/moodMap";
import MoodCard from "./MoodCard";

export default function MoodSelector() {
  // Track which mood is selected (null = nothing selected yet)
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // useRouter lets us navigate programmatically (instead of a <Link>)
  const router = useRouter();

  // When user clicks "Find My Film"
  const handleSubmit = () => {
    if (selectedMood) {
      // Navigate to the results page with the mood as a query parameter
      // e.g. /results?mood=laugh
      router.push(`/results?mood=${selectedMood}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ---------- Mood Cards Grid ---------- */}
      {/* 1 column on mobile, 2 columns on sm+ screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Loop over all 10 moods from moodMap.ts */}
        {allMoods.map((mood) => (
          <MoodCard
            key={mood.key}
            moodKey={mood.key}
            label={mood.label}
            description={mood.description}
            isSelected={selectedMood === mood.key} // true only for the selected card
            onSelect={setSelectedMood} // when clicked, updates selectedMood state
          />
        ))}
      </div>

      {/* ---------- Submit Button ---------- */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedMood} // disabled until a mood is picked
          className={`px-8 py-3 rounded-full text-lg font-semibold transition-all
            ${
              selectedMood
                ? "bg-white text-black hover:bg-white/90 cursor-pointer"
                : "bg-white/20 text-white/40 cursor-not-allowed"
            }`}
        >
          Find My Film
        </button>
      </div>
    </div>
  );
}
