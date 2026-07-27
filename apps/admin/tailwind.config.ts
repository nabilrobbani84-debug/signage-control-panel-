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
        // Slate-based dark theme tokens
        surface: {
          DEFAULT: 'hsl(222, 47%, 6%)',
          50: 'hsl(222, 47%, 8%)',
          100: 'hsl(222, 47%, 11%)',
          200: 'hsl(222, 47%, 14%)',
          300: 'hsl(222, 47%, 18%)',
          400: 'hsl(222, 47%, 24%)',
        },
        accent: {
          DEFAULT: 'hsl(217, 91%, 60%)',
          hover: 'hsl(217, 91%, 55%)',
          muted: 'hsl(217, 91%, 40%)',
          glow: 'hsl(217, 91%, 60%, 0.3)',
        },
        success: {
          DEFAULT: 'hsl(142, 71%, 45%)',
          muted: 'hsl(142, 71%, 20%)',
        },
        danger: {
          DEFAULT: 'hsl(0, 84%, 60%)',
          muted: 'hsl(0, 84%, 20%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          muted: 'hsl(38, 92%, 20%)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':
          'radial-gradient(at 40% 20%, hsl(217, 91%, 20%) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(189, 100%, 15%) 0px, transparent 50%), radial-gradient(at 0% 50%, hsl(355, 100%, 15%) 0px, transparent 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px hsl(142, 71%, 45%, 0.4)' },
          '50%': { boxShadow: '0 0 20px hsl(142, 71%, 45%, 0.8), 0 0 40px hsl(142, 71%, 45%, 0.4)' },
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px hsl(217, 91%, 60%, 0.3)',
        'glow-success': '0 0 12px hsl(142, 71%, 45%, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
