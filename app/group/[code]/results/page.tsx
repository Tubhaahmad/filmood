"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/components/AuthProvider";
import { useParticipantId } from "@/lib/useParticipantId";
import { getAuthHeaders } from "@/lib/getAuthToken";
import TopPickCard from "@/components/group/TopPickCard";
import TierSection from "@/components/group/TierSection";
import type { GroupResultsPayload, Provider } from "@/lib/types";

export default function GroupResultsPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const [data, setData] = useState<GroupResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { participantId, ready: participantIdReady } = useParticipantId();

  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [providersLoading, setProvidersLoading] = useState(false);

  // Load the results payload
  const fetchResults = useCallback(async () => {
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const isGuest = !headers.Authorization;
      const pidParam =
        isGuest && participantId
          ? `?participantId=${participantId}`
          : "";

      const res = await fetch(`/api/group/${code}/results${pidParam}`, {
        headers,
      });

      if (!res.ok) {
        const body = await res.json();
        // If the session isn't done yet, kick the user back to the correct phase
        if (body.error === "Results are not ready yet") {
          const lobbyRes = await fetch(`/api/group/${code}`);
          const lobbyData = await lobbyRes.json();
          const status = lobbyData.session?.status;
          if (status === "lobby") router.replace(`/group/${code}`);
          else if (status === "mood") router.replace(`/group/${code}/mood`);
          else if (status === "swiping") router.replace(`/group/${code}/swipe`);
          return;
        }
        setError(body.error || "Failed to load results");
        return;
      }

      const payload: GroupResultsPayload = await res.json();
      setData(payload);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [code, router, participantId]);

  useEffect(() => {
    // Wait until both auth has resolved AND we've tried to read participantId
    // from localStorage. Otherwise guests fire a fetch without any credentials.
    if (!authLoading && participantIdReady) fetchResults();
  }, [authLoading, participantIdReady, fetchResults]);

  // Secondary fetch: streaming providers for the top pick
  useEffect(() => {
    const topId = data?.topPick?.movie.id;
    if (!topId) return;

    let cancelled = false;
    setProvidersLoading(true);

    fetch(`/api/movies/${topId}/providers`)
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        setProviders(body.providers ?? []);
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      })
      .finally(() => {
        if (!cancelled) setProvidersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [data?.topPick?.movie.id]);

  // Web Share API with clipboard fallback
  const handleShare = async () => {
    if (!data?.topPick) return;
    const title = data.topPick.movie.title;
    const shareText = `Our group picked ${title} on Filmood`;
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/film/${data.topPick.movie.id}`
        : "";

    if (navigator.share) {
      try {
        await navigator.share({ title: "Filmood", text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled - fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} — ${shareUrl}`);
    } catch {
      // Best-effort; ignore
    }
  };

  // ───── Loading ─────
  if (loading || authLoading) {
    return (
      <main
        className="lobby-grain min-h-screen font-sans"
        style={{ background: "var(--bg)", color: "var(--t1)" }}
      >
        <div
          className="flex flex-col items-center justify-center gap-3"
          style={{ minHeight: "60vh" }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--gold)",
              animation: "breathe 2s ease-in-out infinite",
            }}
          />
          <p style={{ fontSize: "13px", color: "var(--t3)", fontWeight: 500 }}>
            Tallying the votes...
          </p>
        </div>
      </main>
    );
  }

  // ───── Error ─────
  if (error || !data) {
    return (
      <main
        className="lobby-grain min-h-screen font-sans"
        style={{ background: "var(--bg)", color: "var(--t1)" }}
      >
        <div
          className="flex flex-col items-center justify-center gap-4"
          style={{ minHeight: "60vh" }}
        >
          <p style={{ fontSize: "14px", color: "var(--rose)" }}>
            {error || "No results available"}
          </p>
          <button
            onClick={() => router.push(`/group/${code}`)}
            className="cursor-pointer font-sans"
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "none",
              color: "var(--t2)",
              fontSize: "13px",
              fontWeight: 500,
              border: "1px solid var(--border)",
            }}
          >
            Back to lobby
          </button>
        </div>
      </main>
    );
  }

  const { topPick, perfect, strong, miss, participantCount } = data;

  // The top pick is already rendered as the hero card, so drop it from the
  // "perfect" list to avoid showing it twice.
  const extraPerfect = topPick
    ? perfect.filter((r) => r.movie.id !== topPick.movie.id)
    : perfect;
  const strongDeduped = topPick
    ? strong.filter((r) => r.movie.id !== topPick.movie.id)
    : strong;

  return (
    <main
      className="lobby-grain min-h-screen font-sans"
      style={{
        background: "var(--bg)",
        color: "var(--t1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gold ambient glow — results phase signature */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, var(--gold-glow) 0%, transparent 70%)",
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 0,
          animation: "ambientDrift 12s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "900px",
          margin: "0 auto",
          padding: "60px 20px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: "24px", width: "100%" }}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Group", href: "/group" },
              { label: "Results" },
            ]}
          />
        </div>

        {/* ───── Hero ───── */}
        <div
          className="lobby-section-1"
          style={{
            textAlign: "center",
            marginBottom: "36px",
            width: "100%",
          }}
        >
          <div
            className="font-sans"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2.2px",
              color: "var(--gold)",
              marginBottom: "12px",
            }}
          >
            Group Results · {participantCount} {participantCount === 1 ? "viewer" : "viewers"}
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(30px, 5vw, 44px)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.6px",
              color: "var(--t1)",
              marginBottom: "10px",
            }}
          >
            {topPick ? "Your group picked" : "No perfect match tonight"}
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: "13px",
              color: "var(--t2)",
              lineHeight: 1.6,
              maxWidth: "460px",
              margin: "0 auto",
            }}
          >
            {topPick
              ? "One film everyone agreed on. The rest are saved below."
              : "The group couldn't agree on a winner — but there are still some strong contenders to consider."}
          </p>
        </div>

        {/* ───── Top pick ───── */}
        {topPick && (
          <div
            className="lobby-section-2"
            style={{ width: "100%", marginBottom: "12px" }}
          >
            <TopPickCard
              result={topPick}
              providers={providers}
              providersLoading={providersLoading}
            />
          </div>
        )}

        {/* ───── Empty state: no top pick, show strongs directly ───── */}
        {!topPick && strong.length === 0 && miss.length > 0 && (
          <div
            className="lobby-section-2"
            style={{
              width: "100%",
              maxWidth: "560px",
              textAlign: "center",
              padding: "32px 24px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
            }}
          >
            <p
              className="font-sans"
              style={{
                fontSize: "13px",
                color: "var(--t2)",
                lineHeight: 1.6,
              }}
            >
              Every film got at least one &ldquo;no&rdquo;. Scroll down to review
              what you voted on — maybe next session.
            </p>
          </div>
        )}

        {/* ───── More perfect matches ───── */}
        <div className="lobby-section-3" style={{ width: "100%" }}>
          <TierSection
            label="More perfect matches"
            subLabel="Everyone said yes"
            results={extraPerfect}
            accent="gold"
          />
        </div>

        {/* ───── Strong contenders ───── */}
        <div className="lobby-section-3" style={{ width: "100%" }}>
          <TierSection
            label="Strong contenders"
            subLabel="Majority yes, no vetoes"
            results={strongDeduped}
            accent="teal"
          />
        </div>

        {/* ───── Not tonight (collapsible) ───── */}
        <div className="lobby-section-4" style={{ width: "100%" }}>
          <TierSection
            label="Not tonight"
            subLabel="Someone said no"
            results={miss}
            accent="rose"
            collapsible
            dimmed
          />
        </div>

        {/* ───── Footer actions ───── */}
        <div
          className="lobby-section-4"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            marginTop: "56px",
            paddingTop: "28px",
            borderTop: "1px solid var(--border)",
            width: "100%",
          }}
        >
          <Link
            href="/group"
            className="font-sans"
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              background: "var(--gold)",
              color: "#0a0a0c",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.1)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            New session
          </Link>
          {topPick && (
            <button
              type="button"
              onClick={handleShare}
              className="font-sans cursor-pointer"
              style={{
                padding: "12px 28px",
                borderRadius: "10px",
                background: "none",
                color: "var(--t1)",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                border: "1px solid var(--border-h)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-active)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-h)";
              }}
            >
              Share pick
            </button>
          )}
        </div>

        {/* Session code footer — matches lobby/mood/swipe pages */}
        <p
          className="font-sans text-center"
          style={{
            fontSize: "11px",
            color: "var(--t3)",
            marginTop: "32px",
          }}
        >
          Session {code}
        </p>
      </div>
    </main>
  );
}
