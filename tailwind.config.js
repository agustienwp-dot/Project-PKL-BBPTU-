/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
          800: '#1E3F20', // Main Forest Green Color (#1E3F20)
          900: '#19331a',
          950: '#0c1a0d',
        },
        cream: {
          50: '#ffffff',
          100: '#F5F5F0', // Main Cream Background Color (#F5F5F0)
          200: '#eaeae3',
          300: '#dcdcd2',
          400: '#bebeaf',
        },
      },
    },
  },
  plugins: [],
}
