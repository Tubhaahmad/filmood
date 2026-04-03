"use client";

import { useState } from "react";

interface InviteStripProps {
  code: string;
}

export default function InviteStrip({ code }: InviteStripProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const lobbyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/group/${code}`
    : "";

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code.toUpperCase());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(lobbyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Filmood session",
          text: `Join my movie night! Code: ${code.toUpperCase()}`,
          url: lobbyUrl,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      className="flex flex-col items-center"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* Decorative top edge — thin teal accent line */}
      <div
        style={{
          width: "100%",
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, var(--teal) 30%, var(--teal) 70%, transparent 100%)",
          opacity: 0.5,
        }}
      />

      <div
        className="flex flex-col items-center gap-4"
        style={{ padding: "28px 24px 24px" }}
      >
        {/* Label */}
        <span
          className="font-sans"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "2.5px",
            color: "var(--t3)",
          }}
        >
          Session code
        </span>

        {/* Large code — cinema marquee style */}
        <div style={{ position: "relative" }}>
          <button
            onClick={handleCopyCode}
            className="cursor-pointer"
            style={{
              fontFamily: "monospace",
              fontSize: "clamp(30px, 6vw, 42px)",
              fontWeight: 700,
              letterSpacing: "8px",
              color: "var(--teal)",
              background: "var(--surface2)",
              border: `1px solid ${copiedCode ? "var(--teal)" : "var(--border)"}`,
              borderRadius: "var(--r)",
              padding: "18px 32px",
              transition: "all var(--t-base)",
              animation: copiedCode ? "none" : "glowPulse 4s ease-in-out infinite",
              boxShadow: copiedCode
                ? "0 0 30px var(--teal-glow), inset 0 0 20px var(--teal-glow)"
                : undefined,
              position: "relative",
              zIndex: 1,
            }}
          >
            {code.toUpperCase()}
          </button>

          {/* Ambient glow behind the code */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "120%",
              height: "160%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, var(--teal-glow) 0%, transparent 70%)",
              opacity: 0.6,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        </div>

        <p
          className="font-sans"
          style={{
            fontSize: "11px",
            color: copiedCode ? "var(--teal)" : "var(--t3)",
            transition: "color var(--t-fast)",
            fontWeight: 500,
          }}
        >
          {copiedCode ? "Copied to clipboard" : "Tap code to copy"}
        </p>

        {/* Dashed divider — ticket tear line */}
        <div
          style={{
            width: "100%",
            borderTop: "1px dashed var(--border-h)",
            margin: "4px 0",
          }}
        />

        {/* Share actions */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={handleCopyLink}
            className="cursor-pointer font-sans"
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              background: copiedLink ? "var(--teal-soft)" : "var(--surface2)",
              color: copiedLink ? "var(--teal)" : "var(--t2)",
              fontSize: "12px",
              fontWeight: 600,
              border: `1px solid ${copiedLink ? "var(--teal)" : "var(--border)"}`,
              transition: "all var(--t-fast)",
            }}
          >
            {copiedLink ? "Link copied!" : "Copy invite link"}
          </button>

          {canShare && (
            <button
              onClick={handleShare}
              className="cursor-pointer font-sans"
              style={{
                padding: "9px 18px",
                borderRadius: "10px",
                background: "var(--surface2)",
                color: "var(--t2)",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid var(--border)",
                transition: "all var(--t-fast)",
              }}
            >
              Share invite
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
