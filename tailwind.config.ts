import type { Config } from "tailwindcss";

// Injoyplan design tokens. Brand colors come from the logo (granate, gris) and the
// existing UI (petróleo). Do not add hues outside this palette.
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#007FA4', // petróleo: primary actions, links
          deep: '#006080',    // hover, dark surfaces
          mist: '#E0F2F7',    // tinted surfaces, selected states
          wine: '#861F21',    // logo mark: favorites, organizer band
          gray: '#8A8C8F',    // logo wordmark: secondary text
        },
        ink: {
          DEFAULT: '#212121', // primary text
          soft: '#5E6278',    // body copy on light surfaces
        },
        line: '#EDEFF5',
        canvas: '#F9FAFC',
        customText: 'rgba(134, 31, 33, 0.8)', // legacy
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Typographic scale (px): 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 60
        caption: ['0.75rem', { lineHeight: '1.1rem' }],
        label: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6rem' }],
        lead: ['1.125rem', { lineHeight: '1.75rem' }],
        h3: ['1.125rem', { lineHeight: '1.45rem', fontWeight: '700' }],
        h2: ['clamp(1.5rem, 1.1rem + 1.4vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' }],
        h1: ['clamp(2.25rem, 1.4rem + 3.4vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '800' }],
      },
      borderRadius: {
        // Hierarchy: inputs/buttons 10px, cards 14px, panels 20px, chips full
        control: '10px',
        card: '14px',
        panel: '20px',
      },
      boxShadow: {
        'custom-1': '0px 1px 6px 0px rgba(71, 89, 147, 1)', // legacy
        'custom-2': '0px 0px 8px 0px rgba(163, 171, 204, 0.4)', // legacy
        float: '0 12px 32px -12px rgba(0, 64, 82, 0.28)', // dropdowns, search panel
      },
      maxWidth: {
        page: '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config;
