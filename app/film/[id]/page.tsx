import type { FilmDetail, Provider, TrailerData } from "@/lib/types";
import TrailerEmbed from "@/components/film/TrailerEmbed";
import WatchProviders from "@/components/film/WatchProviders";
import Image from "next/image";
import { headers } from "next/headers";

export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Build absolute URL for API fetches
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host && host.startsWith("localhost") ? "http" : "https";
  const baseUrl = host ? `${protocol}://${host}` : "";

  // Fetch movie detail
  const detailRes = await fetch(`${baseUrl}/api/movies/${id}`);
  const detail: FilmDetail = await detailRes.json();

  // Fetch providers
  const providersRes = await fetch(`${baseUrl}/api/movies/${id}/providers`);
  const providersData = await providersRes.json();
  const providers: Provider[] = providersData.providers || [];

  // Fetch trailer
  const trailerRes = await fetch(`${baseUrl}/api/movies/${id}/trailer`);
  const trailerData = await trailerRes.json();
  const trailer: TrailerData | null = trailerData.trailer || null;

  return (
    <main className="flex min-h-screen flex-col items-center px-4 bg-black py-8">
      <div className="w-full max-w-4xl mx-auto bg-white/5 rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="flex-shrink-0 w-full md:w-64 flex justify-center items-start">
          {detail.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${detail.poster_path}`}
              alt={detail.title}
              width={320}
              height={480}
              className="rounded-lg object-cover shadow"
              priority
            />
          ) : (
            <div className="w-48 h-72 bg-gray-800 rounded flex items-center justify-center text-white/30">
              No Poster
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white mb-1">{detail.title}</h1>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <span>{detail.release_date?.slice(0, 4)}</span>
            <span>•</span>
            <span>{detail.runtime ? `${detail.runtime} min` : "N/A"}</span>
            <span>•</span>
            <span className="text-yellow-400">
              ★ {detail.vote_average?.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {detail.genres.map((g) => (
              <span
                key={g.id}
                className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded"
              >
                {g.name}
              </span>
            ))}
          </div>
          <p className="text-white/90 mt-2 leading-relaxed">
            {detail.overview}
          </p>

          {/* Cast */}
          <div>
            <h2 className="text-white font-semibold mt-4 mb-2">Main Cast</h2>
            <div className="flex flex-wrap gap-3">
              {detail.credits.cast.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center gap-2 bg-white/10 rounded px-2 py-1"
                >
                  {actor.profile_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-white/40">
                      ?
                    </div>
                  )}
                  <span className="text-white/90 text-xs font-medium">
                    {actor.name}
                  </span>
                  <span className="text-white/50 text-xs">
                    as {actor.character}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Providers */}
          <div className="mt-6">
            <h2 className="text-white font-semibold mb-2">
              Where to Watch (Norway)
            </h2>
            <WatchProviders providers={providers} />
          </div>

          {/* Trailer */}
          <div className="mt-6">
            <h2 className="text-white font-semibold mb-2">Trailer</h2>
            <TrailerEmbed trailer={trailer} />
          </div>
        </div>
      </div>
    </main>
  );
}
