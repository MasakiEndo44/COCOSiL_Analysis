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
        // ブランドカラー (UI/UX要件定義書より)
        brand: {
          500: '#7AC5E5',
          700: '#4A9FD0',
        },
        accent: {
          500: '#C062F5',
          600: '#A54EE6', 
          700: '#8E3FDA',
        },
        // Light mode colors
        light: {
          bg: '#FFFFFF',
          'bg-subtle': '#F7F8FA',
          border: '#E5E7EB',
          fg: '#101828',
          'fg-muted': '#475467',
          primary: '#7A5AF8',
          'on-primary': '#FFFFFF',
        },
        // Dark mode colors  
        dark: {
          bg: '#0B0F1A',
          'bg-subtle': '#121826',
          border: '#233046',
          fg: '#E6E8EE',
          'fg-muted': '#9AA4B2',
          primary: '#9C8CFF',
          'on-primary': '#0B0F1A',
        },
        // Semantic colors
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#0EA5E9',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // タイポグラフィスケール (UI/UX要件定義書より)
        'h1-mobile': ['28px', '36px'],
        'h1-desktop': ['40px', '48px'],
        'h2-mobile': ['24px', '32px'],
        'h2-desktop': ['32px', '40px'],
        'h3-mobile': ['20px', '28px'],
        'h3-desktop': ['24px', '32px'],
        'body-l-mobile': ['16px', '24px'],
        'body-l-desktop': ['18px', '28px'],
        'body-m-mobile': ['14px', '22px'],
        'body-m-desktop': ['16px', '24px'],
        'caption': ['12px', '18px'],
      },
      spacing: {
        // 8pxグリッドシステム
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
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
        'gradient-brand': 'linear-gradient(135deg, #3EB1D4 0%, #C062F5 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(62, 177, 212, 0.5) 0%, rgba(192, 98, 245, 0.5) 100%)',
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