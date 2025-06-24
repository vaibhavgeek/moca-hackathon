/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eaf8fe",
          100: "#d0effb",
          500: "#31b2e1",
          600: "#31b2e1",
          700: "#2791b8",
        },
      },
    },
  },
  plugins: [],
};
