// TrailerEmbed.tsx
// Embeds a YouTube trailer using the TrailerData type

import type { TrailerData } from "@/lib/types";

interface TrailerEmbedProps {
  trailer: TrailerData | null;
}

export default function TrailerEmbed({ trailer }: TrailerEmbedProps) {
  if (!trailer || trailer.site !== "YouTube") {
    return (
      <div className="w-full aspect-video flex items-center justify-center rounded-lg" style={{ background: "var(--surface2)" }}>
        <span style={{ color: "var(--t3)" }}>No trailer available</span>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
      <iframe
        src={`https://www.youtube.com/embed/${trailer.key}`}
        title={trailer.name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}
