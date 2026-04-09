"use client";

interface ExploreBoxProps {
  onExpand: () => void;
  isExpanded: boolean;
}

const exploreItems = [
  {
    icon: "👥",
    iconBg: "var(--gold-soft)",
    title: "Group session",
    sub: "Pick moods together, swipe to match",
    active: true,
  },
  {
    icon: "🎬",
    iconBg: "var(--teal-soft)",
    title: "Now playing",
    sub: "In cinemas & streaming in Norway",
    active: false,
  },
  {
    icon: "🏆",
    iconBg: "var(--violet-soft)",
    title: "Award season",
    sub: "Oscar nominees & winners 2025",
    active: false,
  },
];

export default function ExploreBox({ onExpand, isExpanded }: ExploreBoxProps) {
  return (
    <section
      role="button"
      tabIndex={0}
      onClick={onExpand}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onExpand(); } }}
      aria-expanded={isExpanded}
      aria-label="Discover together — group sessions and curated picks"
      className="relative overflow-hidden cursor-pointer"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isExpanded ? "var(--teal)" : "var(--border)"}`,
        borderRadius: "16px",
        padding: "22px",
        transition: "border-color var(--t-slow), box-shadow var(--t-slow)",
        boxShadow: isExpanded
          ? "0 0 0 1px var(--teal), 0 0 16px var(--teal-glow)"
          : "none",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.8px",
          color: "var(--teal)",
          marginBottom: "12px",
        }}
      >
        Explore
      </div>

      {/* Heading */}
      <h2
        className="font-serif"
        style={{
          fontSize: "clamp(20px, 2.2vw, 26px)",
          fontWeight: 600,
          color: "var(--t1)",
          lineHeight: 1.2,
          marginBottom: "6px",
        }}
      >
        Discover together
      </h2>

      {/* Subtext */}
      <p
        style={{
          fontSize: "13px",
          color: "var(--t2)",
          lineHeight: 1.5,
          marginBottom: "16px",
        }}
      >
        Group sessions, what&apos;s trending, and curated picks.
      </p>

      {/* Explore items */}
      <div
        className="flex flex-col gap-2 mb-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {exploreItems.map((item) => (
          <button
            key={item.title}
            onClick={onExpand}
            className="group cursor-pointer"
            disabled={!item.active}
            aria-disabled={!item.active}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              padding: "10px 12px",
              borderRadius: "11px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              transition: "all var(--t-base)",
              opacity: item.active ? 1 : 0.45,
              textAlign: "left",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                background: item.iconBg,
              }}
            >
              {item.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "var(--t1)",
                  marginBottom: "2px",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "var(--t3)",
                }}
              >
                {item.active ? item.sub : "Coming soon"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* See more button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className="btn-panel-outline flex w-full items-center justify-center gap-1.5 cursor-pointer"
        style={{
          padding: "9px",
          borderRadius: "10px",
          background: "var(--teal-soft)",
          border: "1px solid rgba(90, 170, 143, 0.2)",
          color: "var(--teal)",
          fontSize: "12px",
          fontWeight: 600,
          transition: "all var(--t-base)",
        }}
      >
        <span>Start or join a session</span>
        <span
          style={{
            fontSize: "11px",
            transition: "transform var(--t-slow)",
            transform: isExpanded ? "rotate(180deg)" : "none",
            display: "inline-block",
          }}
        >
          ↓
        </span>
      </button>
    </section>
  );
}
