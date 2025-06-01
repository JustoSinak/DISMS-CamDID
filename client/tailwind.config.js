/** @type {import('tailwindcss').Config} */
module.exports = {
  // Define which files Tailwind should scan for class usage
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // You can extend the default Tailwind theme here
      colors: {
        // Example: Add your project's custom colors
        'primary': '#1a202c',
        'secondary': '#2d3748',
        'accent': '#4299e1',
      },
      fontFamily: {
        // Example: Define custom fonts
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'orbit-1': {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' }
        },
        'orbit-2': {
          '0%': { transform: 'rotate(120deg) translateX(80px) rotate(-120deg)' },
          '100%': { transform: 'rotate(480deg) translateX(80px) rotate(-480deg)' }
        },
        'orbit-3': {
          '0%': { transform: 'rotate(240deg) translateX(60px) rotate(-240deg)' },
          '100%': { transform: 'rotate(600deg) translateX(60px) rotate(-600deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'orbit-1': 'orbit-1 12s linear infinite',
        'orbit-2': 'orbit-2 10s linear infinite',
        'orbit-3': 'orbit-3 8s linear infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      backdropBlur: {
        'xs': '2px'
      }
    },
  },
  plugins: [
    // You can add Tailwind plugins here
    // For example: require('@tailwindcss/forms'),
  ],
}