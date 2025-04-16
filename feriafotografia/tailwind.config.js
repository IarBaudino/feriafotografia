/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'text-primary': '#1f1e21',
        'bg-primary': '#f4f3ee',
        'bg-secondary': '#3757b1',
        'accent-blue': '#b2bcdb',
        'accent-green': '#33774f',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1f1e21',
            h1: {
              color: '#3757b1',
            },
            h2: {
              color: '#3757b1',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 