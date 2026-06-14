/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Figma design tokens from linksnap_all_card_templates.html ──
        pink:       '#D4537E',
        'pink-light': '#FBEAF0',
        'pink-border': '#ED93B1',
        'pink-dark':  '#72243E',
        'pink-deep':  '#4B1528',
        teal:       '#1D9E75',
        'teal-light': '#E1F5EE',
        'teal-border': '#5DCAA5',
        'teal-dark':  '#085041',
        bg:         '#12151a',
        bg2:        '#1a1f27',
        bg3:        '#222831',
        text1:      '#f0eeec',
        text2:      '#9a9794',
        text3:      '#5f5e5a',
        danger:     '#E24B4A',
        amber:      '#EF9F27',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        btn:  '9px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
