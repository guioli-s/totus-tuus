/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0f0f1a',
        surface: '#1a1a2e',
        surfaceLight: '#252540',
        accent: '#c9a84c',
        accentLight: '#dfc06a',
        textPrimary: '#e8e6e3',
        textSecondary: '#9a9a9a',
        textMuted: '#6b6b6b',
      },
    },
  },
  plugins: [],
};
