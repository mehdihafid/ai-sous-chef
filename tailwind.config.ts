import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef9ee",
          100: "#fdf0d5",
          200: "#f9de9f",
          300: "#f5c85e",
          400: "#f0ae30",
          500: "#e8941a",
          600: "#d07010",
          700: "#ac5210",
          800: "#8a4015",
          900: "#723615",
        },
      },
    },
  },
  plugins: [],
};

export default config;
