/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./templates/**/*.{html,js}", // Flask templates
      "./static/**/*.{js,css}"   // static files
    ],
    theme: {
      extend: {},
    },
    plugins: [],
    extend: {
      keyframes: {
          fadeIn: {
              '0%': { opacity: 0, transform: 'scale(0.95)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
          },
      },
      animation: {
          fadeIn: 'fadeIn 0.3s ease-out',
      },
}
}
