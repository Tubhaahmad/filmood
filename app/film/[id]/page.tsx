import type { FilmDetail, Provider, TrailerData } from "@/lib/types";
import TrailerEmbed from "@/components/film/TrailerEmbed";
import WatchProviders from "@/components/film/WatchProviders";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "1.8px",
        textTransform: "uppercase",
        color: "var(--t3)",
        marginBottom: "10px",
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
        /* ── Breadcrumb ── */
        .fd-breadcrumb {
          padding: 14px 28px 0;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--t3);
        }

        /* ── Backdrop ── */
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

        /* ── Outer wrapper ── */
        .fd-outer {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 28px 60px;
          position: relative;
          z-index: 2;
        }
        .fd-outer.has-backdrop { margin-top: -300px; }
        .fd-outer.no-backdrop  { margin-top: 32px; }

        /* ── Two-col layout (desktop) ── */
        .fd-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 36px;
          align-items: start;
        }

        /* ── Sticky sidebar ── */
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

        .fd-actions {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fd-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          background: none;
          color: var(--t2);
          border: 1px solid var(--border);
          cursor: pointer;
          width: 100%;
          transition: border-color 0.2s, color 0.2s;
        }
        .fd-btn:hover { border-color: var(--border-h); color: var(--t1); }

        /* ── Info column ── */
        .fd-info { min-width: 0; }

        /* ── TABLET (≤ 860px): poster + title side by side, content below ── */
        @media (max-width: 860px) {
          .fd-breadcrumb { padding: 12px 16px 0; }
          .fd-backdrop   { height: 260px; }
          .fd-outer      { padding: 0 16px 40px; }
          .fd-outer.has-backdrop { margin-top: -110px; }

          .fd-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          /* On tablet/mobile the sidebar becomes a horizontal header row */
          .fd-sidebar {
            position: relative;
            top: auto;
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 16px;
            align-items: end;
            margin-bottom: 24px;
          }

          .fd-actions {
            margin-top: 0;
            flex-direction: row;
            flex-wrap: wrap;
          }
          .fd-btn { width: auto; flex: 1; min-width: 120px; }
        }

        /* ── MOBILE (≤ 500px) ── */
        @media (max-width: 500px) {
          .fd-breadcrumb { padding: 10px 12px 0; }
          .fd-backdrop   { height: 200px; }
          .fd-outer      { padding: 0 12px 32px; }
          .fd-outer.has-backdrop { margin-top: -80px; }

          .fd-sidebar {
            grid-template-columns: 110px 1fr;
            gap: 12px;
          }

          .fd-actions { flex-direction: column; }
          .fd-btn     { width: 100%; }
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
          <div className="fd-grid"></div>
          <div className="fd-backdrop-overlay" />
          <div
            className="fd-breadcrumb"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
            }}
          >
            <Link href="/" className="fd-breadcrumb-link">
              Home
            </Link>
            <span className="fd-breadcrumb-sep">/</span>
            <Link href="/results" className="fd-breadcrumb-link">
              Results
            </Link>
            <span className="fd-breadcrumb-sep">/</span>
            <span className="fd-breadcrumb-current">{detail.title}</span>
          </div>
        </div>
      ) : (
        <div className="fd-breadcrumb">
          <Link href="/" style={{ color: "var(--t3)", textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ fontSize: "10px" }}>/</span>
          <Link
            href="/results"
            style={{ color: "var(--t3)", textDecoration: "none" }}
          >
            Results
          </Link>
          <span style={{ fontSize: "10px" }}>/</span>
          <span
            style={{
              color: "var(--t2)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {detail.title}
          </span>
        </div>
      )}

      {/* ── Main content ── */}

      <div
        className={`fd-outer ${backdropUrl ? "has-backdrop" : "no-backdrop"}`}
      >
        <div className="fd-grid"></div>
        <div className="fd-grid">
          {/* ── Sidebar ── */}
          <div className="fd-sidebar">
            {/* Poster */}
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

            {/* On tablet/mobile: title + actions sit beside poster */}
            <div className="fd-sidebar-meta">
              {/* Title shown only on tablet/mobile (hidden on desktop via CSS) */}
              <div className="fd-mobile-title">
                <h1
                  className="font-serif"
                  style={{
                    fontSize: "clamp(20px, 5vw, 28px)",
                    fontWeight: 600,
                    color: "var(--t1)",
                    lineHeight: 1.15,
                    margin: "0 0 8px",
                  }}
                >
                  {detail.title}
                </h1>
                {/* Rating + year */}
                <div
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
                      border: "1px solid rgba(196,163,90,0.2)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--gold)",
                    }}
                  >
                    ★ {detail.vote_average?.toFixed(1)}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--t2)" }}>
                    {year}
                  </span>
                  {detail.runtime && (
                    <span style={{ fontSize: "12px", color: "var(--t2)" }}>
                      {detail.runtime} min
                    </span>
                  )}
                </div>
              </div>
              <div className="fd-actions">
                <button className="fd-btn">♡ Watchlist</button>
                <button className="fd-btn">↗ Share</button>
              </div>
            </div>
          </div>

          {/* ── Info column ── */}
          <div className="fd-info">
            {/* Title — desktop only */}
            <div className="fd-desktop-title" style={{ marginBottom: "8px" }}>
              <h1
                className="font-serif"
                style={{
                  fontSize: "clamp(26px, 3vw, 38px)",
                  fontWeight: 600,
                  color: "var(--t1)",
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                {detail.title}
              </h1>
            </div>

            {/* Meta row — desktop only */}
            <div
              className="fd-desktop-meta"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "var(--gold-soft)",
                  border: "1px solid rgba(196,163,90,0.2)",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--gold)",
                }}
              >
                <span style={{ fontSize: "11px" }}>★</span>
                {detail.vote_average?.toFixed(1)}
              </span>
              <span
                style={{
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "var(--t3)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--t2)",
                }}
              >
                {year}
              </span>
              {detail.runtime && (
                <>
                  <span
                    style={{
                      width: "3px",
                      height: "3px",
                      borderRadius: "50%",
                      background: "var(--t3)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--t2)",
                    }}
                  >
                    {detail.runtime} min
                  </span>
                </>
              )}
            </div>

            {/* Genre tags */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {detail.genres?.map((g) => (
                <span
                  key={g.id}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "100px",
                    fontSize: "11px",
                    fontWeight: 500,
                    background: "var(--tag-bg)",
                    border: "1px solid var(--tag-border)",
                    color: "var(--t2)",
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <SectionLabel>Synopsis</SectionLabel>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                color: "var(--t1)",
                marginBottom: "28px",
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
                        color: "var(--t3)",
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

      {/* Hide/show title between breakpoints */}
      <style>{`
        /* Desktop: show desktop title, hide mobile title */
        .fd-desktop-title,
        .fd-desktop-meta { display: block; }
        .fd-mobile-title  { display: none; }
        .fd-sidebar-meta  { display: none; }

        @media (max-width: 860px) {
          .fd-desktop-title,
          .fd-desktop-meta { display: none; }
          .fd-mobile-title  { display: block; }
          .fd-sidebar-meta  { display: flex; flex-direction: column; justify-content: flex-end; }
        }
      `}</style>
    </main>
  );
}
