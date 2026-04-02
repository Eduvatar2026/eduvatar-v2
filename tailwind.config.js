/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc5fc',
          400: '#36a8f8',
          500: '#0c8de9',
          600: '#0070c7',
          700: '#0159a1',
          800: '#064c85',
          900: '#0b406e',
          950: '#072849',
        },
        sand: {
          50: '#fdf8ef',
          100: '#f9edd4',
          200: '#f2d8a8',
          300: '#eabd71',
          400: '#e3a043',
          500: '#db8628',
          600: '#c46b1e',
          700: '#a3511b',
          800: '#84411d',
          900: '#6c361b',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e3eae2',
          200: '#c7d5c5',
          300: '#a1b89e',
          400: '#799776',
          500: '#5a7a57',
          600: '#456143',
          700: '#384e37',
          800: '#2e3f2d',
          900: '#263426',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
