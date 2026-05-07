import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07130f",
        moss: "#12372e",
        ivory: "#f7f2ea",
        paper: "#fffcf6",
        gold: "#b48948",
        burgundy: "#541f22",
        jade: "#7d9a8c",
        smoke: "#d8d1c5"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "Arial", "sans-serif"]
      },
      boxShadow: {
        velvet: "0 24px 70px rgba(0, 0, 0, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
