/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07040F',
        gojo: {
          deep: '#120826',
          card: '#130B24',
          border: '#321B63',
          purple: '#9333EA',
          violet: '#A855F7',
          magenta: '#D946EF',
          glow: '#C084FC',
          cyan: '#38BDF8',
        },
      },
      boxShadow: {
        hollow: '0 0 35px rgba(168, 85, 247, 0.25)',
        'hollow-strong': '0 0 45px rgba(217, 70, 239, 0.35)',
      },
    },
  },
  plugins: [],
};
