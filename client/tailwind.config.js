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
    },
  },
  plugins: [
    // You can add Tailwind plugins here
    // For example: require('@tailwindcss/forms'),
  ],
}