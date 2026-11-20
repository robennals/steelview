import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What information Steelview collects, and what it does with it.',
  alternates: { canonical: '/privacy' },
};

// Accurate for a site with no accounts, no analytics and no cookies. Revisit
// before adding any of those.
export default function PrivacyPage() {
  return (
    <main className="sv-wrap">
      <header className="sv-pagehead">
        <h1 className="sv-title">Privacy</h1>
        <p className="sv-meta sv-pagehead__meta">Last updated 20 November 2026</p>
      </header>
      <div className="prose-body">
        <p>
          Steelview is run by Rob Ennals. You can read it without an account, it shows no advertising, it sets
          no cookies, and it does not track you across other sites. This page explains the little information
          it does handle.
        </p>

        <h2>When you read the site</h2>
        <p>
          Steelview is hosted by Vercel. Like any web host, Vercel’s servers record basic details of each
          request — your IP address, your browser, the page you asked for and the time — so the site can be
          delivered, kept secure and protected from abuse. These logs are kept for a short time under{' '}
          <a href="https://vercel.com/legal/privacy-policy">Vercel’s privacy policy</a>. Steelview does not use
          them to identify you.
        </p>

        <h2>When you send feedback</h2>
        <p>
          When you use the <Link href="/feedback">feedback form</Link>, your message, your email address, your
          name if you give it, and the page you came from are sent by email to Rob, with a copy to you. The
          email is delivered by an email delivery service acting for Steelview; nothing you send is stored on
          the website itself. Steelview uses these details only to read and reply to your message and to
          improve the site.
        </p>

        <h2>What Steelview does not do</h2>
        <ul>
          <li>It does not sell or rent information about you to anyone.</li>
          <li>It does not use advertising or tracking cookies.</li>
          <li>
            It does not share information about you, except with the services that host the site and deliver
            its email, or where the law requires it.
          </li>
        </ul>

        <h2>Your choices</h2>
        <p>
          You can ask what information Steelview holds about you, ask for it to be corrected, or ask for it to
          be deleted, through the <Link href="/feedback">feedback form</Link>. Steelview is not
          directed at children under 13.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If what Steelview collects changes — for example, if it adds accounts or comments — this page will be
          updated first, and the date at the top will change.
        </p>
      </div>
    </main>
  );
}
