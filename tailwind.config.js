/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef6e7",
          100: "#fdecd0",
          500: "#F7AD33",
          600: "#F7AD33",
          700: "#e09c2e",
        },
        primary: "#F7AD33",
        secondary: "#15110E",
        verify: {
          50: "#e6f9f0",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
    },
  },
  plugins: [],
};
