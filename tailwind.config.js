/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        panel: {
          bg: '#0f1117',
          card: '#1a1d2e',
          border: '#2a2d3e',
          hover: '#252840',
        },
        metric: {
          cpu: '#60a5fa',
          battery: '#4ade80',
          sensor: '#f59e0b',
          bandwidth: '#a78bfa',
          temp: '#f87171',
        },
        risk: {
          none: '#4ade80',
          info: '#60a5fa',
          warning: '#f59e0b',
          caution: '#f87171',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        'touch': '2.75rem',
      },
    },
  },
  plugins: [],
}
