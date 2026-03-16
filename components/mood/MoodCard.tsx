// =============================================
// MOODCARD COMPONENT
// =============================================
// A single selectable mood card.
// Shows the mood label (e.g. "Laugh until it hurts")
// and a short description below it.
//
// When clicked, it tells the parent which mood was selected.
// The parent (MoodSelector) tracks which one is currently selected.
//
// "use client" is needed because this component uses onClick (browser interaction)

"use client";

// ---------- Props ----------
interface MoodCardProps {
  moodKey: string; // The mood ID (e.g. "laugh") — passed back to parent on click
  label: string; // What the user sees (e.g. "Laugh until it hurts")
  description: string; // Short text below the label
  isSelected: boolean; // Is this card currently the selected one?
  onSelect: (key: string) => void; // Function to call when clicked
}

export default function MoodCard({
  moodKey,
  label,
  description,
  isSelected,
  onSelect,
}: MoodCardProps) {
  return (
    <button
      onClick={() => onSelect(moodKey)}
      className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? "border-white bg-white/10 scale-[1.02]" // Selected: bright border + slight zoom
            : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10" // Default
        }`}
    >
      <h3 className="text-lg font-semibold text-white mb-1">{label}</h3>
      <p className="text-sm text-white/60">{description}</p>
    </button>
  );
}
