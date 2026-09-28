/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Inter is loaded in index.html, this makes it the default everywhere
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        // emerald accent, used for primary actions and highlights (ties to the "reduce waste" theme)
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b"
        },
        // dark neutral used for the sidebar, separate from the light content area grays
        ink: {
          800: "#1f2430",
          900: "#171b24",
          950: "#101319"
        }
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)"
      }
    }
  },
  plugins: []
};
