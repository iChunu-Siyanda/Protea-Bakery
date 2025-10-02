/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.{html,js}", // Flask templates
    "./static/**/*.{js,css}"      // static files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
