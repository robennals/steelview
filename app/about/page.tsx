import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT_EMAIL, SOURCE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'What Steelview is, who makes it, and how it is paid for.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <main className="sv-wrap">
      <header className="sv-pagehead">
        <h1 className="sv-title">About Steelview</h1>
      </header>
      <div className="prose-body">
        <p>
          Steelview puts every side of a divisive issue on one page: the data and what it shows, the strongest
          version of each major viewpoint, the moral principles underneath them, and the specific questions on
          which the sides genuinely disagree.
        </p>
        <h2>Every side, at its strongest</h2>
        <p>
          Each viewpoint is <em>steelmanned</em> — the opposite of a straw man. It is written so that someone who
          holds it finds it better argued than the version they would have written themselves, and so that
          someone who doesn’t can recognise it rather than a caricature of it.
        </p>
        <h2>The data underneath</h2>
        <p>
          The arguments rest on the evidence, and the evidence is shown in full. Every figure is quoted from its
          source, with the source’s own caveats. Time series run across the whole range their source publishes,
          so a trend can’t be made to look different by choosing where it starts, and comparisons between
          countries use the source’s complete set rather than a convenient few.
        </p>
        <p>
          Each report is researched and written by a person and an AI working together.{' '}
          <Link href="/how-its-made">How Steelview is made</Link> explains who does what, and the checks every
          report passes before it is published.
        </p>
        <h2>What you should leave with</h2>
        <p>
          If you arrive holding one view, you should leave able to state the others in a form their holders
          would endorse — and knowing exactly where, and why, you still disagree.
        </p>

        <h2>Who makes it</h2>
        <div className="sv-author">
          <Image
            className="sv-author__photo"
            src="/images/rob-ennals.jpeg"
            alt="Rob Ennals"
            width={160}
            height={160}
          />
          <div>
            <p>
              Steelview is made by <a href="https://robennals.org">Rob Ennals</a>, who has spent much of his
              career working on how people argue and disagree online. At Intel Research he created Dispute
              Finder, one of the first tools to flag disputed claims on the web. He has since worked on Quora,
              launched information about the credibility of websites in Google Search, and worked on Integrity
              at Meta, on polarisation and misinformation.
            </p>
          </div>
        </div>

        <h2>Who pays for it</h2>
        <p>
          Steelview is paid for by Rob personally. No political party, campaign, advocacy group or advertiser
          funds it, and it carries no advertising.
        </p>
        <p>
          That may change: Rob is looking for funding so the project can grow. Neutrality is what makes the site
          worth reading, so any funding will be taken only from sources that place no conditions on what
          Steelview says, on any side of any issue, and every funder will be named on this page.
        </p>

        <h2>Open to inspection</h2>
        <p>
          Everything on the site — the code, every report, and the history of every change to them — is{' '}
          <a href={SOURCE_URL}>public on GitHub</a>. The writing is published under the Creative Commons
          Attribution licence (CC BY 4.0), so you are free to reuse it with credit.
        </p>

        <h2>Feedback and corrections</h2>
        <p>
          If you think a report gets something wrong, leaves out a viewpoint, or states one unfairly, please
          say so at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Corrections are made in the open,
          and every one can be seen in the site’s public history on GitHub.
        </p>
        <p>
          <Link href="/">Browse the topics</Link>
        </p>
      </div>
    </main>
  );
}
