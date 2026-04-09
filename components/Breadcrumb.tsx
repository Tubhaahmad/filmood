"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Breadcrumb renders a trail: Home / Section / Current.
 * The last item is the current page. All preceding items are links.
 */
export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0",
        fontSize: "14px",
        fontWeight: 600,
        letterSpacing: "0.01em",
        padding: "6px 4px",
        borderRadius: "8px",
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const isHome = i === 0 && item.href === "/";

        return (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0",
            }}
          >
            {/* Chevron separator */}
            {i > 0 && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  color: "var(--t2)",
                  flexShrink: 0,
                  margin: "0 3px",
                }}
              >
                <path
                  d="M6 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {isLast || !item.href ? (
              /* Current page — no link */
              <span
                style={{
                  color: "var(--t1)",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  background: "var(--tag-bg)",
                  border: "1px solid var(--tag-border)",
                  maxWidth: "260px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            ) : (
              /* Clickable link */
              <Link
                href={item.href}
                style={{
                  color: "var(--t1)",
                  textDecoration: "none",
                  transition: "color 0.15s, background 0.15s",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--tag-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Home icon for the first "/" link */}
                {isHome && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, marginTop: "-1px" }}
                  >
                    <path d="M2.5 6.5L8 2l5.5 4.5" />
                    <path d="M4 8v5a1 1 0 001 1h2v-3h2v3h2a1 1 0 001-1V8" />
                  </svg>
                )}
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
