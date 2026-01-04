/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#dc2626',      // 金鼎紅色
        secondary: '#991b1b',    // 深紅色
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}