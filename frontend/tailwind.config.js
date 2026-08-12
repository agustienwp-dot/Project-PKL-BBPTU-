/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f2',
          100: '#e1ede1',
          200: '#c2dac2',
          300: '#98bd98',
          400: '#699a6a',
          500: '#467948',
          600: '#345e36',
          700: '#2b4b2c',
          800: '#1E3F20', // User Specified Main Brand Color (#1E3F20)
          900: '#19331a',
          950: '#0c1a0d',
        },
        cream: {
          50: '#ffffff',
          100: '#F5F5F0', // User Specified Background Color (#F5F5F0)
          200: '#eaeae3',
          300: '#dcdcd2',
          400: '#bebeaf',
        },
      },
    },
  },
  plugins: [],
}
