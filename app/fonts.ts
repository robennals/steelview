import { IBM_Plex_Sans, Newsreader } from 'next/font/google';

// Newsreader carries the reading: a screen-first text serif with enough
// character to read as a publication rather than as a document viewer.
const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
});

// Plex Sans is the apparatus voice — section labels, status labels, captions.
// Kept small and letterspaced so it never competes with the argument.
const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
});

/** Class names that define the two font variables; shared by the site and Storybook. */
export const fontVariables = `${newsreader.variable} ${plexSans.variable}`;
