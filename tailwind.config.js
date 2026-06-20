/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Navy blue from logo lettering / building
          50: '#eef3f8',
          100: '#d6e3ef',
          200: '#adc7df',
          300: '#84abcf',
          400: '#5b8fbf',
          500: '#2f6ba3',
          600: '#1c4f7f', // primary navy
          700: '#163f66', // deep navy (logo "SSP")
          800: '#11304d',
          900: '#0b2036',
          950: '#071624',
        },
        slate: {
          // Gray from compass / "ENTERPRISES" text
          50: '#f5f6f7',
          100: '#e8eaec',
          200: '#d1d5d9',
          300: '#aab1b8',
          400: '#7e8893',
          500: '#5f6b76',
          600: '#4b555f',
          700: '#3d454d',
          800: '#2d333a',
          900: '#1f2327',
        },
        accent: {
          DEFAULT: '#2f6ba3',
          light: '#5b8fbf',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px 0 rgba(11, 32, 54, 0.08)',
        'card-hover': '0 8px 24px 0 rgba(11, 32, 54, 0.14)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #163f66 0%, #1c4f7f 50%, #2f6ba3 100%)',
      },
    },
  },
  plugins: [],
};
