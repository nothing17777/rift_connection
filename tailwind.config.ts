import type { Config } from "tailwindcss";
// @ts-ignore
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";


const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        gold: "var(--gold)",
        "gold-light": "var(--gold-light)",
        "blue-accent": "var(--blue-accent)",
        text: "var(--text)",
        muted: "var(--muted)",
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
      },
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
};

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

export default config;
