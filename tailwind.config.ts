import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Fonts ──────────────────────────────────────────────────────────────
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },

      // ── Type scale ─────────────────────────────────────────────────────────
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4", letterSpacing: "0.04em" }],
        xs: ["11px", { lineHeight: "1.4", letterSpacing: "0.14em" }],
        sm: ["12px", { lineHeight: "1.5", letterSpacing: "0" }],
        base: ["14px", { lineHeight: "1.6", letterSpacing: "0" }],
        md: ["15px", { lineHeight: "1.75", letterSpacing: "0" }],
        lg: ["17px", { lineHeight: "1.75", letterSpacing: "0" }],
        xl: ["20px", { lineHeight: "1.4", letterSpacing: "0" }],
        "2xl": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "3xl": ["28px", { lineHeight: "1.3", letterSpacing: "0" }],
        "4xl": ["36px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "5xl": ["48px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "6xl": ["58px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "7xl": ["72px", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
        "8xl": ["84px", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
        hero: [
          "clamp(52px,8vw,94px)",
          { lineHeight: "1.0", letterSpacing: "-0.03em" },
        ],
        "10xl": ["96px", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
      },

      // ── Spacing (4px base) ─────────────────────────────────────────────────
      spacing: {
        px: "1px",
        0: "0px",
        0.5: "2px",
        1: "4px", // --space-1
        2: "8px", // --space-2
        3: "12px", // --space-3
        4: "16px", // --space-4
        5: "20px", // --space-5
        6: "24px", // --space-6
        7: "28px",
        8: "32px", // --space-8
        9: "36px",
        10: "40px", // --space-10
        11: "44px",
        12: "48px", // --space-12
        14: "56px",
        15: "60px", // nav height
        16: "64px", // --space-16
        18: "72px",
        20: "80px",
        24: "96px", // --space-24
        28: "112px",
        30: "120px", // --space-30
        32: "128px",
        36: "144px",
        40: "160px",
        48: "192px",
        56: "224px",
        64: "256px",
        72: "288px",
        80: "320px",
        96: "384px",
      },

      // ── Border radius ──────────────────────────────────────────────────────
      borderRadius: {
        none: "0",
        sm: "6px",
        DEFAULT: "12px", // --r  buttons / inputs
        md: "16px",
        lg: "20px", // --r-lg  cards / modals
        xl: "24px",
        "2xl": "32px",
        full: "9999px", // pill – badges / toasts
      },

      // ── Colours (all reference CSS variables) ─────────────────────────────
      colors: {
        filmood: {
          canvas: "var(--bg)",
          deep: "var(--bg2)",
          bg3: "var(--bg3)",
          surface: "var(--surface)",
          surface2: "var(--surface2)",
        },
        red: {
          DEFAULT: "var(--red)",
          soft: "var(--red-soft)",
          dim: "var(--red-dim)",
          glow: "var(--red-glow)",
          glow2: "var(--red-glow2)",
        },
        content: {
          primary: "var(--text)",
          secondary: "var(--text2)",
          tertiary: "var(--text3)",
        },
        line: {
          subtle: "var(--border)",
          emphasis: "var(--border2)",
          active: "var(--red)",
        },
        status: {
          green: "#4ADE80",
          alert: "#EF4444",
        },
      },

      // ── Box shadows ────────────────────────────────────────────────────────
      boxShadow: {
        "btn-idle":
          "0 0 28px rgba(217,79,58,0.32), 0 4px 14px rgba(0,0,0,0.40)",
        "btn-hover":
          "0 0 44px rgba(217,79,58,0.48), 0 6px 22px rgba(0,0,0,0.50)",
        "card-hover":
          "0 16px 40px rgba(0,0,0,0.50), 0 0 18px rgba(217,79,58,0.16)",
        "mood-sel": "0 0 22px rgba(217,79,58,0.16)",
        "focus-red": "0 0 0 3px rgba(217,79,58,0.16)",
        avatar: "0 0 24px rgba(217,79,58,0.16)",
        trailer: "0 0 32px rgba(217,79,58,0.40)",
        perfect: "0 0 60px rgba(217,79,58,0.24), 0 24px 48px rgba(0,0,0,0.60)",
      },

      // ── Animations / keyframes ─────────────────────────────────────────────
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.38" },
          "50%": { opacity: "0.65" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(100px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(100px)" },
        },
      },
      animation: {
        // Staggered fade-up (d1–d5) — apply to individual elements
        "fade-up-d1": "fadeUp 550ms ease both 80ms",
        "fade-up-d2": "fadeUp 550ms ease both 180ms",
        "fade-up-d3": "fadeUp 550ms ease both 280ms",
        "fade-up-d4": "fadeUp 550ms ease both 380ms",
        "fade-up-d5": "fadeUp 550ms ease both 480ms",
        // Ambient orb
        "ambient-pulse": "pulse 4.5s ease-in-out infinite",
        // Scanline
        scanline: "scanline 6s linear infinite",
        // Toast
        "slide-up": "slideUp 0.3s ease forwards",
        "slide-down": "slideDown 0.3s ease forwards",
      },

      // ── Max widths ─────────────────────────────────────────────────────────
      maxWidth: {
        content: "1200px",
        landing: "960px",
        focus: "680px",
        swipe: "560px",
        auth: "420px",
      },
    },
  },
  plugins: [],
};

export default config;
