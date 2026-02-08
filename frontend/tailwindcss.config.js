/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Varela Round', 'Calibri', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        'iakoa-blue': '#2397FF',
      },
    },
  },
  plugins: [],
};
