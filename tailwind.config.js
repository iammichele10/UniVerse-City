/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F6F4EC',
        'paper-raised': '#FBFAF5',
        ink: '#1E2320',
        navy: '#1F3A5F',
        brass: '#A9813F',
        rule: '#D8D4C8',
        muted: '#6B6F68',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
