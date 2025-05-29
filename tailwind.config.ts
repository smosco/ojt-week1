import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
        gmarket: ['GmarketSans', 'sans-serif'],
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: 0, transform: 'translateY(-80px) scale(0.95)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.4s ease-out',
      },
    },
  },
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [],
};

export default config;
