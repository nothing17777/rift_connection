import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
        russo: ["Russo One", "sans-serif"],
        chakra: ["Chakra Petch", "sans-serif"],
      },
      animation: {
        aurora: "aurora 60s linear infinite",
        spotlight: "spotlight 2s ease .75s 1 normal forwards",
        float: "float 6s ease-in-out infinite",
        glitch: "glitch 1s linear infinite alternate-reverse",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "scale(0.9) translate(-5%, -5%)" },
          "100%": { opacity: "1", transform: "scale(1) translate(0, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glitch: {
          "0%": { clipPath: "inset(40% 0 61% 0)" },
          "20%": { clipPath: "inset(92% 0 1% 0)" },
          "40%": { clipPath: "inset(25% 0 58% 0)" },
          "60%": { clipPath: "inset(75% 0 5% 0)" },
          "80%": { clipPath: "inset(54% 0 7% 0)" },
          "100%": { clipPath: "inset(12% 0 85% 0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(77, 159, 255, 0.7)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(77, 159, 255, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(77, 159, 255, 0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
