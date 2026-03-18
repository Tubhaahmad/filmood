// =============================================
// MOOD PAGE — /mood
// =============================================
// This is the core UX of Filmood.
// The user lands here after clicking "Start" on the home page.
// They see 10 mood cards, pick one, and click "Find My Film".
//
// This page just provides the heading — MoodSelector handles all the logic.

import MoodSelector from "@/components/mood/MoodSelector";

export default function MoodPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12 bg-black">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 text-center">
        How do you want to feel?
      </h1>
      <p className="text-white/50 mb-10 text-center">
        Pick a mood. We&apos;ll find the film.
      </p>
      <MoodSelector />
    </main>
  );
}
