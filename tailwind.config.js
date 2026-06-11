/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0A1628',
          bg2: '#0F1E36',
          panel: 'rgba(15, 30, 54, 0.75)',
          border: 'rgba(0, 229, 255, 0.25)',
          accent: '#00E5FF',
          accent2: '#7B61FF',
          success: '#00E676',
          warning: '#FFB020',
          danger: '#FF3D57',
          text: '#E6F4FF',
          muted: '#7A8BA3',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 229, 255, 0.35)',
        'glow-sm': '0 0 10px rgba(0, 229, 255, 0.25)',
        'glow-danger': '0 0 20px rgba(255, 61, 87, 0.5)',
        'glow-warning': '0 0 15px rgba(255, 176, 32, 0.4)',
        'glow-success': '0 0 15px rgba(0, 230, 118, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
