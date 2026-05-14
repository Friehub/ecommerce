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
        // Core Jumia Palette
        'jumia-orange': '#f68b1e',
        'jumia-orange-dark': '#df7d1b',
        'j-primary': '#914d00',
        'j-on-primary': '#ffffff',
        
        // Surfaces & Backgrounds
        'j-background': '#f9f9fa',
        'j-surface': '#f9f9fa',
        'j-surface-container': '#eeeeef',
        'j-surface-container-low': '#f3f3f4',
        'j-surface-container-high': '#e8e8e9',
        'j-surface-container-highest': '#e2e2e3',
        'j-surface-container-lowest': '#ffffff',
        
        // Text & Content
        'j-text': '#1a1c1d',
        'j-text-muted': '#554335',
        'j-secondary': '#5f5e5e',
        
        // Utilities
        'j-outline': '#897363',
        'j-outline-variant': '#dcc2af',
        'j-error': '#ba1a1a',
        'j-success': '#006d36', // Tertiary in Stitch
        'j-success-container': '#3abd6b',
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
