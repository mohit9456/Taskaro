/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // use .dark class for dark mode
  theme: {
    extend: {
      colors: {
        // Light/Dark mode handled via CSS variables
        bg: 'var(--color-bg)',
        cardBg: 'var(--card-bg)',
        text: 'var(--color-text)',
        content: 'var(--color-content)',
        desc: 'var(--color-desc)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        // Inter + fallback stack
        body: 'var(--font-inter)',
        sans: 'var(--font-inter)',
      },
    },
  },
  plugins: [],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
