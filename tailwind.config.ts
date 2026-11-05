import type { Config } from 'tailwindcss';

// One type scale: 12 / 14 / 17 / 22 / 32 / 52 / 84 px, in rem so the
// utility bar's text-size control scales the whole page.
const rem = (px: number) => `${px / 16}rem`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
    },
    fontSize: {
      12: [rem(12), { lineHeight: '1.4' }],
      14: [rem(14), { lineHeight: '1.5' }],
      17: [rem(17), { lineHeight: '1.6' }],
      22: [rem(22), { lineHeight: '1.4' }],
      32: [rem(32), { lineHeight: '1.15' }],
      52: [rem(52), { lineHeight: '1.05' }],
      84: [rem(84), { lineHeight: '0.98' }],
    },
    extend: {
      colors: {
        ink: '#050E2B',
        'off-white': '#F4F1EA',
        'srm-blue': '#1B3FA0',
        amber: '#FFB81C',
        teal: '#16A6A1',
        // Emergency actions only.
        danger: '#B3261E',
        // Home only, from the recording.
        night: '#060F24',
        royal: '#1B4DB1',
      },
    },
  },
} satisfies Config;
