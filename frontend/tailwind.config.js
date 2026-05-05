/** @type {import('tailwindcss').Config} */
export default {
 content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold-premium': '#f59e0b', // Dorado H&H (amber-500)
        'gold-dark': '#d97706',    // Dorado para botones (amber-600)
      }
    },
  },
  plugins: [],
}

