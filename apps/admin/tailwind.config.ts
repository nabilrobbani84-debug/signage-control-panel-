import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        background: '#0a0a0a',
        foreground: '#ededed',
        surface: {
          DEFAULT: '#111111',
          hover: '#1a1a1a',
          border: '#222222',
        },
        accent: {
          DEFAULT: '#ffffff',
          hover: '#e5e5e5',
          foreground: '#000000',
        },
        success: {
          DEFAULT: '#10b981',
          muted: '#064e3b',
        },
        danger: {
          DEFAULT: '#ef4444',
          muted: '#7f1d1d',
        },
        warning: {
          DEFAULT: '#f59e0b',
          muted: '#78350f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
