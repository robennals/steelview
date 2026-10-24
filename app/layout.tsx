import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "./fonts";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // Every canonical and Open Graph URL on the site is resolved against this,
  // so a fact's address is absolute wherever it is quoted.
  metadataBase: new URL(SITE_URL),
  title: { default: 'Steelview', template: '%s — Steelview' },
  description: 'The strongest version of every side of an argument, and the data underneath it.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Steelview',
    title: 'Steelview',
    description:
      'The strongest version of every side of an argument, and the data underneath it.',
    url: '/',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
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
