/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdcff',
          300: '#8ec5ff',
          400: '#59a4ff',
          500: '#2f7fff',
          600: '#1661ef',
          700: '#114ecf',
          800: '#1342a6',
          900: '#143b83',
          950: '#0e2549',
        },
        ink: {
          50: '#f7f8fa',
          100: '#eef0f4',
          200: '#dadfe8',
          300: '#b8c0cf',
          400: '#8d97ad',
          500: '#6b7689',
          600: '#545d70',
          700: '#444a59',
          800: '#2f3441',
          900: '#1c1f29',
          950: '#11131a',
        },
        success: {
          500: '#16a34a',
          600: '#15803d',
        },
        warning: {
          500: '#d97706',
          600: '#b45309',
        },
        error: {
          500: '#dc2626',
          600: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 8px 25px -5px rgb(0 0 0 / 0.12), 0 4px 10px -3px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
