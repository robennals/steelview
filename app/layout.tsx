import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

// Newsreader carries the reading: a screen-first text serif with enough
// character to read as a publication rather than as a document viewer.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

// Plex Sans is the apparatus voice — section labels, status labels, captions.
// Kept small and letterspaced so it never competes with the argument.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: 'Steelview', template: '%s — Steelview' },
  description: 'The strongest version of every side of an argument, and the facts underneath it.',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="sv-masthead">
          <div className="sv-wrap sv-masthead__inner">
            <Link href="/" className="sv-wordmark">
              Steelview
            </Link>
          </div>
        </div>
        <div className="flex-1">{children}</div>
        <div className="sv-footer">
          <div className="sv-wrap sv-footer__inner">
            <span className="sv-meta">Steelview</span>
          </div>
        </div>
      </body>
    </html>
  );
}
