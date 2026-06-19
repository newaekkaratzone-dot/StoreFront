/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        background: '#f5f5f7',
        surface: '#ffffff',
        primary: '#6b46c1',
        secondary: '#1d1d1f',
        accent: '#2563eb',
        muted: '#86868b',
        border: '#d2d2d7',
        'dark-bg': '#1a202c',
        'dark-surface': '#2d3748',
        'dark-text': '#e2e8f0',
        'dark-muted': '#a0aec0',
        'dark-border': '#4a5568',
      },
      boxShadow: {
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      }
    },
  },
  plugins: [],
}
