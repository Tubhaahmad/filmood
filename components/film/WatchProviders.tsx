// WatchProviders.tsx
// Shows streaming providers for a movie (e.g. Netflix, Viaplay)

import type { Provider } from "@/lib/types";

interface WatchProvidersProps {
  providers: Provider[];
}

export default function WatchProviders({ providers }: WatchProvidersProps) {
  if (!providers || providers.length === 0) {
    return (
      <div className="w-full rounded-lg p-4 flex items-center justify-center" style={{ background: "var(--surface2)" }}>
        <span style={{ color: "var(--t3)" }}>
          No streaming providers found for Norway
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {providers.map((provider) => (
        <div
          key={provider.provider_id}
          className="flex flex-col items-center w-20"
          title={provider.provider_name}
        >
          <img
            src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
            alt={provider.provider_name}
            className="w-12 h-12 object-contain rounded bg-white shadow mb-1"
            loading="lazy"
          />
          <span className="text-xs text-center truncate w-full" style={{ color: "var(--t2)" }}>
            {provider.provider_name}
          </span>
        </div>
      ))}
    </div>
  );
}
