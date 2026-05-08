/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'jumia-orange': '#f68b1e',
        "primary": "#914d00",
        "primary-container": "#f68b1e",
        "surface": "#fff8f5",
        "on-surface": "#231a12",
        "on-background": "#231a12",
        "background": "#fff8f5",
        "surface-dim": "#e9d6cb",
        "surface-variant": "#f2dfd3",
        "outline": "#897363",
        "outline-variant": "#dcc2af",
        "secondary": "#5f5e5e",
        "secondary-container": "#e2dfde",
        "tertiary": "#006491",
        "tertiary-container": "#00b0fb",
        "error": "#ba1a1a",
        "primary-fixed": "#ffdcc3",
        "primary-fixed-dim": "#ffb77e",
        "surface-container": "#feeade",
        "surface-container-high": "#f8e5d8",
        "surface-container-highest": "#f2dfd3",
        "surface-container-low": "#fff1e9",
        "surface-container-lowest": "#ffffff",
      },
      spacing: {
        "stack-sm": "12px",
        "stack-md": "24px",
        "stack-lg": "48px",
        "container-max": "1280px",
        "base": "8px",
        "gutter": "24px",
        "margin": "32px"
      },
      borderRadius: {
        "lg": "0.5rem",
        "xl": "0.75rem",
      },
      fontSize: {
        "display-lg": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "900" }],
        "display-md": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "800" }],
        "title-lg": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-md": ["1rem", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "label-sm": ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.05em", fontWeight: "700" }],
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
      backdropBlur: {
        "xs": "2px",
      }
    },
  },
  plugins: [],
}
