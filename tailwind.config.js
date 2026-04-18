/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Modern Sage Editorial Palette ---
        sage: {
          primary:   '#4a7c59',
          deep:      '#316342',
          light:     '#6a9e78',
          muted:     '#a8c5b0',
        },
        surface: {
          cream:     '#fbf9f5',
          container: '#f5f3ef',
          border:    '#e8e5de',
        },
        ink: {
          DEFAULT:   '#1b1c1a',
          secondary: '#4a4b48',
          muted:     '#7a7b78',
        },
      },
      fontFamily: {
        editorial: ['"Newsreader"', 'Georgia', 'serif'],
        ui:        ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        lg: '12px',
        xl: '16px',
      },
      letterSpacing: {
        'ui': '0.06em',
      },
    },
  },
  plugins: [],
}
