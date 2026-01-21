/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'breathe-in': 'breatheIn 4s ease-in-out infinite',
        'breathe-hold': 'breatheHold 4s ease-in-out infinite',
        'breathe-out': 'breatheOut 4s ease-in-out infinite',
      },
      keyframes: {
        breatheIn: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.5)', opacity: '1' },
        },
        breatheHold: {
          '0%, 100%': { transform: 'scale(1.5)', opacity: '1' },
        },
        breatheOut: {
          '0%': { transform: 'scale(1.5)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
