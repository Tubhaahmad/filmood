import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Fonts ──────────────────────────────────────────────────────────────
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
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
        hero: [
          "clamp(52px,8vw,94px)",
          { lineHeight: "1.0", letterSpacing: "-0.03em" },
        ],
      },

      // ── Spacing (4px base) ─────────────────────────────────────────────────
      spacing: {
        px: "1px",
        0: "0px",
        0.5: "2px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
        11: "44px",
        12: "48px",
        14: "56px",
        15: "60px",
        16: "64px",
        18: "72px",
        20: "80px",
        24: "96px",
        28: "112px",
        30: "120px",
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
        DEFAULT: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "32px",
        full: "9999px",
      },

      // ── Colours (CSS variable references) ─────────────────────────────────
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          surface: "var(--surface)",
          surface2: "var(--surface2)",
          surface3: "var(--surface3)",
        },
        t: {
          1: "var(--t1)",
          2: "var(--t2)",
          3: "var(--t3)",
        },
        line: {
          DEFAULT: "var(--border)",
          hover: "var(--border-h)",
          active: "var(--border-active)",
        },
        tag: {
          bg: "var(--tag-bg)",
          border: "var(--tag-border)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          soft: "var(--gold-soft)",
          glow: "var(--gold-glow)",
        },
        blue: {
          DEFAULT: "var(--blue)",
          soft: "var(--blue-soft)",
          glow: "var(--blue-glow)",
        },
        rose: {
          DEFAULT: "var(--rose)",
          soft: "var(--rose-soft)",
          glow: "var(--rose-glow)",
        },
        violet: {
          DEFAULT: "var(--violet)",
          soft: "var(--violet-soft)",
          glow: "var(--violet-glow)",
        },
        teal: {
          DEFAULT: "var(--teal)",
          soft: "var(--teal-soft)",
          glow: "var(--teal-glow)",
        },
        ember: {
          DEFAULT: "var(--ember)",
          soft: "var(--ember-soft)",
          glow: "var(--ember-glow)",
        },
      },

      // ── Box shadows ────────────────────────────────────────────────────────
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.12)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.20)",
        btn: "0 2px 8px rgba(0, 0, 0, 0.16)",
        focus: "0 0 0 3px var(--border-active)",
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
          "0%": { maxHeight: "0", opacity: "0" },
          "100%": { maxHeight: "1200px", opacity: "1" },
        },
      },
      animation: {
        "fade-up-d1": "fadeUp 550ms ease both 80ms",
        "fade-up-d2": "fadeUp 550ms ease both 180ms",
        "fade-up-d3": "fadeUp 550ms ease both 280ms",
        "fade-up-d4": "fadeUp 550ms ease both 380ms",
        "fade-up-d5": "fadeUp 550ms ease both 480ms",
        "ambient-pulse": "pulse 4.5s ease-in-out infinite",
        scanline: "scanline 6s linear infinite",
        "slide-up": "slideUp 0.3s ease forwards",
        "slide-down": "slideDown 0.4s ease forwards",
      },

      // ── Max widths ─────────────────────────────────────────────────────────
      maxWidth: {
        content: "1200px",
        landing: "960px",
        focus: "680px",
        auth: "420px",
      },
    },
  },
  plugins: [],
};

export default config;
