/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        bouncingLoader: {
          to: {
            opacity: "0.1",
            transform: "translateY(-16px)",
          },
        },
      },
      animation: {
        bouncingLoader: "bouncingLoader 0.6s infinite alternate",
      },
    },
  },
  plugins: [],
};
