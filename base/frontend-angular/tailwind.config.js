/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        admin: { 50: '#ecfdf5', 500: '#0f766e', 600: '#0b5f5a', 700: '#134e4a' },
        sidebar: '#0b1f33',
        'sidebar-hover': '#12324d'
      }
    }
  },
  plugins: []
};
