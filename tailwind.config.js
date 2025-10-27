/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'audio-dark': '#0D1117',
        'audio-mid': '#161B22',
        'audio-light': '#21262D',
        'audio-border': '#30363D',
        'audio-accent': '#2F81F7',
        'audio-cyan': '#39D3F7',
        'audio-red': '#DA3633',
        'audio-active-red': '#f87171',
        'audio-green': '#238636',
        'audio-yellow': '#D29922',
        'audio-pink': '#db2777',
        'audio-text-light': '#E6EDF3',
        'audio-text-dark': '#8B949E',
        'audio-text-disabled': '#6E7681',
      },
    },
  },
  plugins: [],
}
