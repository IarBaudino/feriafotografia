/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "text-primary": "#1f1e21",
        "bg-primary": "#f4f3ee",
        "bg-secondary": "#3757b1",
        "accent-blue": "#b2bcdb",
        "accent-green": "#33774f",
      },
      fontFamily: {
        bevietnam: ["var(--font-bevietnam)"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#1f1e21",
            h1: {
              color: "#3757b1",
              fontFamily: 'var(--font-bevietnam)',
              fontWeight: '700',
            },
            h2: {
              color: "#3757b1",
              fontFamily: 'var(--font-bevietnam)',
              fontWeight: '700',
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
