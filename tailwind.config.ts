import type { Config } from "tailwindcss";

// Tugether palette: warm white/cream base, gold as the single primary.
// Derived from the app icon (white piggy jar, gold heart-coins).
// Avoid blue/purple (reads as crypto). See DESIGN_SYSTEM.md.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FBFAF7",
        surface: "#FFFFFF",
        gold: {
          DEFAULT: "#F4B740",
          deep: "#E09A1E",
          soft: "#FDF3DC",
        },
        ink: {
          DEFAULT: "#2B2622",
          soft: "#8A8178",
        },
        line: "#ECE7DE",
        success: "#3FB984",
        blush: "#F6B6A0",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.5rem", // 24px
        btn: "1rem", // 16px
        chip: "0.75rem", // 12px
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        // Soft, warm, diffuse. Objects feel "holdable".
        soft: "0 1px 2px rgba(43,38,34,0.04), 0 16px 36px -18px rgba(224,154,30,0.28)",
        jar: "0 10px 40px -12px rgba(224,154,30,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
