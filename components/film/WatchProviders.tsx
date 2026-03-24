// WatchProviders.tsx
// Shows streaming providers for a movie (e.g. Netflix, Viaplay)

import type { Provider } from "@/lib/types";

interface WatchProvidersProps {
  providers: Provider[];
}

export default function WatchProviders({ providers }: WatchProvidersProps) {
  if (!providers || providers.length === 0) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-4 flex items-center justify-center">
        <span className="text-gray-400">
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
          <span className="text-xs text-center text-white/80 truncate w-full">
            {provider.provider_name}
          </span>
        </div>
      ))}
    </div>
  );
}
