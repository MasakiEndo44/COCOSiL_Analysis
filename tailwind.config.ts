import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors using CSS variables
        brand: {
          25: 'rgb(var(--brand-25) / <alpha-value>)',
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },
        accent: {
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
        },
        // Background colors
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        
        // Text colors
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--secondary-foreground) / <alpha-value>)',
        
        // Semantic colors
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        destructive: 'rgb(var(--destructive) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        'noto-sans-jp': ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        // Typography scale matching UI/UX requirements
        'h1-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'h1-desktop': ['40px', { lineHeight: '48px', fontWeight: '600' }],
        'h2-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h2-desktop': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'h3-mobile': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h3-desktop': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-l-mobile': ['18px', { lineHeight: '26px', fontWeight: '400' }],
        'body-l-desktop': ['20px', { lineHeight: '28px', fontWeight: '400' }],
        'body-m-mobile': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-m-desktop': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '8px',
        'modal': '12px',
        'hero': '24px',
      },
      boxShadow: {
        'z1': '0 1px 2px rgba(16, 24, 40, 0.10)',
        'z2': '0 6px 12px rgba(16, 24, 40, 0.12)',
        'z3': '0 12px 24px rgba(16, 24, 40, 0.16)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, rgb(var(--brand-500)), rgb(var(--accent-500)))',
        'gradient-brand-soft': 'linear-gradient(135deg, rgb(var(--brand-500) / 0.5), rgb(var(--accent-500) / 0.5))',
      },
      animation: {
        'fade-in': 'fadeIn 0.24s cubic-bezier(0.2, 0.0, 0.2, 1)',
        'slide-up': 'slideUp 0.24s cubic-bezier(0.2, 0.0, 0.2, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.2, 0.0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config

export default config