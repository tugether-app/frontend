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
        sans: ["var(--font-sans)", "Nunito", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Fredoka", "system-ui", "sans-serif"],
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
        // Chunky 3D "candy" button: solid gold-deep base + warm ambient.
        candy: "0 5px 0 #E09A1E, 0 8px 18px rgba(224,154,30,0.25)",
        "candy-sm": "0 4px 0 #E09A1E",
        "candy-active": "0 2px 0 #E09A1E",
        card: "0 10px 30px rgba(224,154,30,0.06)",
        "card-lg": "0 12px 32px rgba(224,154,30,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
