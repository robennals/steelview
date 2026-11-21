import localFont from 'next/font/local';

// The fonts are served from our own build, not fetched from Google Fonts:
// next/font/google downloads them whenever the dev server or a build starts,
// and a failed download leaves Turbopack's cache broken ("Can't resolve
// '@vercel/turbopack-next/internal/font/google/font'") until `.next` is
// cleared. The files come from the Fontsource packages — the same Google
// fonts, under the SIL Open Font License — pinned in the lockfile. Each is
// the variable-weight Latin subset, as `subsets: ['latin']` gave before.

// Inter Tight carries headings: a modern grotesque set tight, so titles read
// as a current publication rather than a period piece.
const interTight = localFont({
  variable: '--font-inter-tight',
  display: 'swap',
  src: [{ path: '../node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2', weight: '500 700', style: 'normal' }],
});

// Inter is the interface voice — labels, captions, controls, chart text.
const inter = localFont({
  variable: '--font-inter',
  display: 'swap',
  src: [{ path: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', weight: '100 900', style: 'normal' }],
});

// Source Serif 4 carries the reading: a screen-first text serif for the
// arguments and findings themselves.
const sourceSerif = localFont({
  variable: '--font-source-serif',
  display: 'swap',
  src: [
    { path: '../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2', weight: '200 900', style: 'normal' },
    { path: '../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2', weight: '200 900', style: 'italic' },
  ],
});

/** Class names that define the font variables; shared by the site and Storybook. */
export const fontVariables = `${interTight.variable} ${inter.variable} ${sourceSerif.variable}`;
