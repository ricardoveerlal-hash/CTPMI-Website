import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#050d1a",
          800: "#0a1830",
          700: "#0f2140",
        },
        teal: {
          DEFAULT: "#1d9c90",
          light: "#39b8ac",
        },
        gold: {
          600: "#b9832a",
          400: "#d9a94e",
        },
        paper: "#f3f7f6",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
