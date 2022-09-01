/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        sm: '8px 8px 0px rgba(0, 0, 0, 1)',
        md: '15px 15px 0px rgba(0, 0, 0, 1)',
      },
      colors: {
        'bright-blue': '#0b01f9',
      },
    },
  },
  plugins: [],
};
