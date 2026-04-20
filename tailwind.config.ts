import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0b10",
          elevated: "#10121a",
        },
        surface: {
          DEFAULT: "rgba(20,22,32,0.55)",
          strong: "rgba(26,28,40,0.72)",
          mute: "rgba(255,255,255,0.04)",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.10)",
        },
        text: {
          DEFAULT: "#e7e8ee",
          mute: "#9aa0b4",
          faint: "#6b7088",
        },
        accent: {
          DEFAULT: "#7c8cff",
          soft: "rgba(124,140,255,0.18)",
          glow: "rgba(124,140,255,0.35)",
        },
        success: "#4ade80",
        danger: "#ff6b6b",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        xxs: ["11px", "14px"],
        xs: ["13px", "18px"],
        sm: ["15px", "22px"],
        base: ["17px", "26px"],
        lg: ["22px", "30px"],
        xl: ["28px", "36px"],
      },
      borderRadius: {
        lg: "14px",
        xl: "18px",
        "2xl": "22px",
        "3xl": "28px",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        glow: "0 0 24px rgba(124,140,255,0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bubble-in": {
          "0%": { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "bubble-in": "bubble-in 180ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
