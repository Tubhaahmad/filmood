import type { FilmDetail, Provider, TrailerData } from "@/lib/types";
import TrailerEmbed from "@/components/film/TrailerEmbed";
import WatchProviders from "@/components/film/WatchProviders";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import { headers } from "next/headers";

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "1.8px",
        textTransform: "uppercase",
        color: "var(--t1)",
        marginBottom: "10px",
        transition: "color 0.2s",
      }}
    >
      {children}
    </div>
  );
}

export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host && host.startsWith("localhost") ? "http" : "https";
  const baseUrl = host ? `${protocol}://${host}` : "";

  const detailRes = await fetch(`${baseUrl}/api/movies/${id}`);
  const detail: FilmDetail = await detailRes.json();

  const providersRes = await fetch(`${baseUrl}/api/movies/${id}/providers`);
  const providersData = await providersRes.json();
  const providers: Provider[] = providersData.providers || [];

  const trailerRes = await fetch(`${baseUrl}/api/movies/${id}/trailer`);
  const trailerData = await trailerRes.json();
  const trailer: TrailerData | null = trailerData.trailer || null;

  const year = detail.release_date?.slice(0, 4);
  const cast = detail.credits?.cast?.slice(0, 8) ?? [];
  const backdropUrl = detail.backdrop_path
    ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}`
    : null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        .fd-breadcrumb-wrap {
          padding: 14px 28px 0;
          max-width: 1100px;
          margin: 0 auto;
        }
        .fd-backdrop {
          position: relative;
          width: 100%;
          height: 380px;
          background-size: cover;
          background-position: center top;
          overflow: hidden;
        }
        .fd-backdrop-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, var(--bg) 0%, rgba(10,10,12,0.45) 55%, rgba(10,10,12,0.15) 100%);
        }
        [data-theme="light"] .fd-backdrop-overlay {
          background: linear-gradient(to top, var(--bg) 0%, rgba(244,243,238,0.55) 55%, rgba(244,243,238,0.2) 100%);
        }
        .fd-outer {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 28px 60px;
          position: relative;
          z-index: 2;
        }
        .fd-outer.has-backdrop { margin-top: -300px; }
        .fd-outer.no-backdrop  { margin-top: 32px; }
        .fd-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 36px;
          align-items: start;
        }
        .fd-sidebar { position: sticky; top: 80px; }
        .fd-poster {
          width: 100%;
          aspect-ratio: 2/3;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          background: var(--surface2);
          position: relative;
        }
        .fd-info { min-width: 0; }

        /* ── Buttons — dark mode default (frosted glass over backdrop) ── */
        .fd-actions { display: flex; flex-direction: column; gap: 8px; }
        .fd-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.25);
          cursor: pointer;
          width: 100%;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .fd-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.45);
        }

        /* ── Light mode: match genre tag styling ── */
        [data-theme="light"] .fd-btn {
          background: var(--tag-bg);
          color: var(--t1);
          border: 1px solid var(--tag-border);
        }
        [data-theme="light"] .fd-btn:hover {
          background: var(--surface2);
          color: var(--t1);
          border-color: var(--border-h);
        }

        /* ── Desktop header ── */
        .fd-desktop-header { display: block; margin-bottom: 24px; }
        .fd-desktop-actions { display: flex; gap: 8px; margin-top: 16px; }
        .fd-desktop-actions .fd-btn { width: auto; flex: 1; }

        /* ── Mobile header ── */
        .fd-mobile-header { display: none; }

        /* ── Tablet (≤ 860px) ── */
        @media (max-width: 860px) {
          .fd-breadcrumb-wrap { padding: 12px 16px 0; }
          .fd-backdrop   { height: 260px; }
          .fd-outer      { padding: 0 16px 40px; }
          .fd-outer.has-backdrop { margin-top: -110px; }
          .fd-grid { grid-template-columns: 1fr; gap: 0; }
          .fd-sidebar {
            position: relative;
            top: auto;
            display: block;
            margin-bottom: 20px;
          }
          .fd-poster { width: 160px; margin: 0 auto 0 0; }
          .fd-desktop-header { display: none; }
          .fd-mobile-header  { display: block; margin-bottom: 16px; }
          .fd-btn {
            background: var(--tag-bg);
            color: var(--t1);
            border: 1px solid var(--tag-border);
          }
          .fd-btn:hover {
            background: var(--surface2);
            color: var(--t1);
            border-color: var(--border-h);
          }
        }

        /* ── Mobile (≤ 500px) ── */
        @media (max-width: 500px) {
          .fd-breadcrumb-wrap { padding: 10px 12px 0; }
          .fd-backdrop   { height: 200px; }
          .fd-outer      { padding: 0 12px 32px; }
          .fd-outer.has-backdrop { margin-top: -80px; }
          .fd-poster { width: 130px; }
        }

        /* ── Cast scroll ── */
        .fd-cast-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .fd-cast-scroll::-webkit-scrollbar       { height: 4px; }
        .fd-cast-scroll::-webkit-scrollbar-track  { background: transparent; }
        .fd-cast-scroll::-webkit-scrollbar-thumb  { background: var(--border-h); border-radius: 2px; }
      `}</style>

      {backdropUrl ? (
        <div
          className="fd-backdrop"
          style={{ backgroundImage: `url('${backdropUrl}')` }}
        >
          <div className="fd-backdrop-overlay" />
          <div
            className="fd-breadcrumb-wrap"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
            }}
          >
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Results", href: "/results" },
                { label: detail.title },
              ]}
            />
          </div>
        </div>
      ) : (
        <div className="fd-breadcrumb-wrap">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Results", href: "/results" },
              { label: detail.title },
            ]}
          />
        </div>
      )}

      <div
        className={`fd-outer ${backdropUrl ? "has-backdrop" : "no-backdrop"}`}
      >
        <div className="fd-grid">
          {/* ── Sidebar: poster only ── */}
          <div className="fd-sidebar">
            <div className="fd-poster">
              {detail.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${detail.poster_path}`}
                  alt={detail.title}
                  width={500}
                  height={750}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  priority
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--t3)",
                    fontSize: "13px",
                  }}
                >
                  No Poster
                </div>
              )}
            </div>
          </div>

          {/* ── Info column ── */}
          <div className="fd-info">
            {/* Desktop: title, meta, genres, buttons */}
            <div className="fd-desktop-header">
              <p
                role="presentation"
                className="font-serif"
                style={{
                  fontSize: "clamp(22px, 5vw, 32px)",
                  fontWeight: 600,
                  color: "var(--t1)",
                  lineHeight: 1.15,
                  margin: "0 0 10px",
                  transition: "color 0.2s",
                }}
              >
                {detail.title}
              </p>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "var(--gold-soft)",
                    border: "1px solid rgba(196,163,90,0.25)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--gold)",
                  }}
                >
                  ★ {detail.vote_average?.toFixed(1)}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--t1)",
                  }}
                >
                  {year}
                </span>
                {detail.runtime && (
                  <>
                    <span style={{ fontSize: "10px", color: "var(--t2)" }}>
                      ·
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--t1)",
                      }}
                    >
                      {detail.runtime} min
                    </span>
                  </>
                )}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                {detail.genres?.map((g) => (
                  <span
                    key={g.id}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: "var(--tag-bg)",
                      border: "1px solid var(--tag-border)",
                      color: "var(--t1)",
                    }}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <div className="fd-desktop-actions">
                <button className="fd-btn">♡ Watchlist</button>
                <button className="fd-btn">↗ Share</button>
              </div>
            </div>

            {/* Mobile/tablet: title, meta, genres, stacked buttons */}
            <div className="fd-mobile-header">
              <h1
                className="font-serif"
                style={{
                  fontSize: "clamp(20px, 5vw, 28px)",
                  fontWeight: 600,
                  color: "var(--t1)",
                  lineHeight: 1.15,
                  margin: "0 0 10px",
                  transition: "color 0.2s",
                }}
              >
                {detail.title}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "var(--gold-soft)",
                    border: "1px solid rgba(196,163,90,0.25)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--gold)",
                  }}
                >
                  ★ {detail.vote_average?.toFixed(1)}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--t1)",
                  }}
                >
                  {year}
                </span>
                {detail.runtime && (
                  <>
                    <span style={{ fontSize: "10px", color: "var(--t2)" }}>
                      ·
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--t1)",
                      }}
                    >
                      {detail.runtime} min
                    </span>
                  </>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              >
                {detail.genres?.map((g) => (
                  <span
                    key={g.id}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: "var(--tag-bg)",
                      border: "1px solid var(--tag-border)",
                      color: "var(--t1)",
                    }}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              {/* Stacked buttons */}
              <div className="fd-actions" style={{ marginBottom: "20px" }}>
                <button className="fd-btn">♡ Watchlist</button>
                <button className="fd-btn">↗ Share</button>
              </div>
            </div>

            {/* Synopsis */}
            <SectionLabel>Synopsis</SectionLabel>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                color: "var(--t1)",
                marginBottom: "28px",
                transition: "color 0.2s",
              }}
            >
              {detail.overview}
            </p>

            {/* Trailer */}
            <div style={{ marginBottom: "28px" }}>
              <SectionLabel>Trailer</SectionLabel>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "56.25%",
                  borderRadius: "14px",
                  overflow: "hidden",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ position: "absolute", inset: 0 }}>
                  <TrailerEmbed trailer={trailer} />
                </div>
              </div>
            </div>

            {/* Where to watch */}
            <div style={{ marginBottom: "28px" }}>
              <SectionLabel>Where to watch in Norway</SectionLabel>
              <WatchProviders providers={providers} />
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <SectionLabel>Cast</SectionLabel>
                <div className="fd-cast-scroll">
                  {cast.map((actor) => (
                    <div
                      key={actor.id}
                      style={{
                        flexShrink: 0,
                        width: "90px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "50%",
                          background: "var(--surface2)",
                          border: "1px solid var(--border)",
                          margin: "0 auto 8px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {actor.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            fill
                            sizes="72px"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--t3)",
                              fontSize: "16px",
                            }}
                          >
                            ?
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--t1)",
                          marginBottom: "2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          transition: "color 0.2s",
                        }}
                      >
                        {actor.name}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--t3)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {actor.character}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details table */}
            <div style={{ marginBottom: "28px" }}>
              <SectionLabel>Details</SectionLabel>
              {[
                {
                  label: "Runtime",
                  value: detail.runtime
                    ? `${detail.runtime} minutes`
                    : undefined,
                },
                { label: "Release year", value: year },
                {
                  label: "Genres",
                  value: detail.genres?.map((g) => g.name).join(", "),
                },
              ]
                .filter((r) => r.value)
                .map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "var(--t2)",
                        transition: "color 0.2s",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "var(--t1)",
                        textAlign: "right",
                        maxWidth: "60%",
                        transition: "color 0.2s",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
