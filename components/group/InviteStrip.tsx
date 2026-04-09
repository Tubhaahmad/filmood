"use client";

import { useState } from "react";

interface InviteStripProps {
  code: string;
}

export default function InviteStrip({ code }: InviteStripProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently fail
    }
  };

  const handleCopyCode = () => copyToClipboard(code);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/group?tab=join&code=${code}`;
    copyToClipboard(url);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/group?tab=join&code=${code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Filmood session",
          text: `Join with code ${code}`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await handleCopyLink();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleCopyCode}
        aria-label="Copy session code"
        className="cursor-pointer"
        style={{
          fontFamily: "monospace",
          fontSize: "clamp(28px, 6vw, 38px)",
          fontWeight: 700,
          letterSpacing: "8px",
          color: "var(--teal)",
          background: "none",
          border: "none",
          padding: "8px 16px",
          transition: "opacity var(--t-fast)",
        }}
      >
        {code}
      </button>

      <p
        className="font-sans"
        style={{
          fontSize: "11px",
          color: copied ? "var(--teal)" : "var(--t3)",
          fontWeight: 500,
          marginBottom: "14px",
          transition: "color var(--t-fast)",
        }}
      >
        {copied ? "Copied!" : "Tap code to copy"}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="cursor-pointer font-sans"
          style={{
            padding: "8px 16px",
            borderRadius: "var(--r)",
            background: "none",
            color: "var(--t2)",
            fontSize: "12px",
            fontWeight: 500,
            border: "1px solid var(--border)",
            transition: "all var(--t-fast)",
          }}
        >
          Copy link
        </button>
        <button
          onClick={handleShare}
          className="cursor-pointer font-sans"
          style={{
            padding: "8px 16px",
            borderRadius: "var(--r)",
            background: "none",
            color: "var(--t2)",
            fontSize: "12px",
            fontWeight: 500,
            border: "1px solid var(--border)",
            transition: "all var(--t-fast)",
          }}
        >
          Share invite
        </button>
      </div>
    </div>
  );
}
