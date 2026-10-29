import { Inter, Inter_Tight, Source_Serif_4 } from 'next/font/google';

// Inter Tight carries headings: a modern grotesque set tight, so titles read
// as a current publication rather than a period piece.
const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
});

// Inter is the interface voice — labels, captions, controls, chart text.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Source Serif 4 carries the reading: a screen-first text serif for the
// arguments and findings themselves.
const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
});

/** Class names that define the font variables; shared by the site and Storybook. */
export const fontVariables = `${interTight.variable} ${inter.variable} ${sourceSerif.variable}`;
