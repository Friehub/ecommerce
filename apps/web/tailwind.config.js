/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core FreshCart Palette (Mint Green)
        'jumia-orange': '#00bfa5',
        'jumia-orange-dark': '#00a892',
        'jumia-blue': '#2a5bd7',
        'jumia-red': '#e61601',
        'j-primary': '#00bfa5',
        'j-on-primary': '#ffffff',
        
        // Surfaces & Backgrounds
        'j-background': '#f1f1f2',
        'j-surface': '#ffffff',
        'j-border': '#e5e5e5',
        'j-surface-container': '#f1f1f2',
        'j-surface-container-low': '#f5f5f5',
        'j-surface-container-high': '#ebebeb',
        'j-surface-container-highest': '#e1e1e1',
        'j-surface-container-lowest': '#ffffff',
        
        // Text & Content
        'j-text': '#282828',
        'j-text-muted': '#75757a',
        'j-secondary': '#75757a',
        
        // Utilities
        'j-outline': '#e5e5e5',
        'j-outline-variant': '#f1f1f2',
        'j-error': '#f44336',
        'j-success': '#31b665',
        'j-success-container': '#e8f5e9',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },
      spacing: {
        'gutter': '16px',
        'base': '4px',
        'container-max': '1184px',
        'stack-lg': '24px',
        'stack-md': '16px',
        'stack-sm': '8px',
        'margin-desktop': '24px',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui'],
        display: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'price-lg': ['24px', { lineHeight: '24px', fontWeight: '800' }],
        'price-sm': ['16px', { lineHeight: '16px', fontWeight: '700' }],
        'label-bold': ['12px', { lineHeight: '12px', fontWeight: '700' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
