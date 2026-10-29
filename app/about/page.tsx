import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'What Steelview is, and how each topic is put together.',
  alternates: { canonical: '/about' },
};

// First draft, written from the README's description of the project, for the
// owner to revise.
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
        <h2>What you should leave with</h2>
        <p>
          If you arrive holding one view, you should leave able to state the others in a form their holders
          would endorse — and knowing exactly where, and why, you still disagree.
        </p>
        <p>
          <Link href="/">Browse the topics</Link>
        </p>
      </div>
    </main>
  );
}
