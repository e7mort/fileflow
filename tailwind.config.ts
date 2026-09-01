import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070b14",
          900: "#0b1220",
          800: "#121c31",
          700: "#1a2740",
        },
        foam: "#e8f4f2",
        mint: "#3dffe0",
        signal: "#ff6b4a",
        gold: "#f0c75e",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "card-haze":
          "radial-gradient(ellipse 80% 60% at 70% 10%, rgba(61,255,224,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(240,199,94,0.12), transparent 50%), linear-gradient(165deg, #070b14 0%, #0f1a2e 45%, #0b1220 100%)",
        "grid-faint":
          "linear-gradient(rgba(232,244,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,244,242,0.04) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(61,255,224,0.15)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
      },
      animation: {
        rise: "rise 0.7s ease-out both",
        shimmer: "shimmer 6s linear infinite",
        floaty: "floaty 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
