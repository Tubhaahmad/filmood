"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import SessionCreator from "@/components/group/SessionCreator";
import SessionJoin from "@/components/group/SessionJoin";

type Tab = "create" | "join";

const steps = [
  {
    num: "1",
    label: "Create & share",
    detail: "Start a session and send the 6-character code to your group",
    accent: "var(--teal)",
    accentSoft: "var(--teal-soft)",
  },
  {
    num: "2",
    label: "Pick moods privately",
    detail: "Each person selects how they want to feel — no groupthink",
    accent: "var(--violet)",
    accentSoft: "var(--violet-soft)",
  },
  {
    num: "3",
    label: "Swipe & match",
    detail: "Filmood builds a shared deck. Swipe together, find the film",
    accent: "var(--gold)",
    accentSoft: "var(--gold-soft)",
  },
];

function GroupPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const codeParam = searchParams.get("code");

  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === "join" ? "join" : "create",
  );

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
      {/* Ambient glow */}
      <div className="lobby-ambient" />

      <div
        className="mx-auto"
        style={{
          maxWidth: "540px",
          padding: "48px 20px 60px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: "20px" }}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Group Session" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="lobby-section-1 text-center" style={{ marginBottom: "12px" }}>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(26px, 3.5vw, 34px)",
              fontWeight: 600,
              color: "var(--t1)",
              marginBottom: "8px",
              letterSpacing: "-0.3px",
            }}
          >
            Group session
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: "14px",
              color: "var(--t2)",
              lineHeight: 1.5,
            }}
          >
            Decide what to watch together
          </p>
        </div>

        {/* How it works — 3 steps */}
        <div
          className="lobby-section-2 lobby-steps"
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "28px",
            marginTop: "24px",
          }}
        >
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                flex: 1,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r)",
                padding: "16px 14px",
                textAlign: "center",
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: step.accentSoft,
                  color: step.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  margin: "0 auto 10px",
                }}
              >
                {step.num}
              </div>

              <p
                className="font-sans"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--t1)",
                  marginBottom: "4px",
                  lineHeight: 1.3,
                }}
              >
                {step.label}
              </p>

              <p
                className="font-sans"
                style={{
                  fontSize: "10px",
                  color: "var(--t3)",
                  lineHeight: 1.4,
                }}
              >
                {step.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Tab toggle */}
        <div
          className="lobby-section-3"
          style={{
            display: "flex",
            background: "var(--surface2)",
            borderRadius: "var(--r)",
            padding: "3px",
            marginBottom: "16px",
          }}
        >
          {(["create", "join"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="cursor-pointer font-sans"
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  transition: "all 0.25s ease",
                  background: isActive ? "var(--surface)" : "transparent",
                  color: isActive ? "var(--t1)" : "var(--t3)",
                  boxShadow: isActive
                    ? "0 1px 4px rgba(0,0,0,0.15)"
                    : "none",
                }}
              >
                {tab === "create" ? "Create session" : "Join with code"}
              </button>
            );
          })}
        </div>

        {/* Content card */}
        <div
          className="lobby-section-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "4px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent top line — teal for create, gold for join */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${activeTab === "create" ? "var(--teal)" : "var(--gold)"} 30%, ${activeTab === "create" ? "var(--teal)" : "var(--gold)"} 70%, transparent 100%)`,
              opacity: 0.5,
              transition: "all 0.3s ease",
            }}
          />

          {activeTab === "create" ? (
            <SessionCreator />
          ) : (
            <SessionJoin initialCode={codeParam ?? ""} />
          )}
        </div>

        {/* Footer hint */}
        <p
          className="lobby-section-5 font-sans text-center"
          style={{
            fontSize: "11px",
            color: "var(--t3)",
            marginTop: "20px",
            lineHeight: 1.5,
          }}
        >
          Sessions expire after 4 hours. Guests can join without an account.
        </p>
      </div>
    </main>
  );
}

export default function GroupPage() {
  return (
    <Suspense>
      <GroupPageContent />
    </Suspense>
  );
}
