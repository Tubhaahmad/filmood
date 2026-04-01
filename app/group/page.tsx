"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SessionCreator from "@/components/group/SessionCreator";
import SessionJoin from "@/components/group/SessionJoin";

type Tab = "create" | "join";

function GroupPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const codeParam = searchParams.get("code");

  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === "join" ? "join" : "create",
  );

  return (
    <main
      className="min-h-screen font-sans"
      style={{ background: "var(--bg)", color: "var(--t1)" }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "520px", padding: "48px 20px" }}
      >
        {/* Heading */}
        <h1
          className="font-serif text-center"
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: 600,
            color: "var(--t1)",
            marginBottom: "6px",
          }}
        >
          Group session
        </h1>
        <p
          className="text-center"
          style={{
            fontSize: "14px",
            color: "var(--t2)",
            marginBottom: "32px",
          }}
        >
          Decide what to watch together
        </p>

        {/* Tab toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--surface2)",
            borderRadius: "10px",
            padding: "3px",
            marginBottom: "24px",
          }}
        >
          {(["create", "join"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="cursor-pointer font-sans"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "capitalize",
                transition: "all 0.2s",
                background:
                  activeTab === tab ? "var(--surface)" : "transparent",
                color: activeTab === tab ? "var(--t1)" : "var(--t3)",
                boxShadow:
                  activeTab === tab
                    ? "0 1px 3px rgba(0,0,0,0.2)"
                    : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "8px 20px",
            animation: "fadeUp 0.4s ease both",
          }}
        >
          {activeTab === "create" ? (
            <SessionCreator />
          ) : (
            <SessionJoin initialCode={codeParam ?? ""} />
          )}
        </div>
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
