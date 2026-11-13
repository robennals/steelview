import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Fact } from '@/lib/content/types';
import { anchorFor, factPath, topicPath } from '@/lib/content/types';
import { EvidenceNavigation } from './evidence-navigation';

function Finding({ fact }: { fact: Fact }) {
  return <p className="sv-finding" id={`${fact.id}--finding`}>
    {fact.claim}{' '}
    {(fact.claimSources ?? [1]).map(n => <a key={n} className="sv-footnote" href={`#source-${fact.id}-${n}`} aria-label={`Source ${n}`}>[{n}]</a>)}
  </p>;
}

/**
 * The reports related to this one: a link to each, whose whole text is at the
 * far end of it. `#evidence-<fact>` lands on its line.
 */
function RelatedReports({ slug, facts }: { slug: string; facts: Fact[] }) {
  if (facts.length === 0) return null;
  return (
    <section className="sv-supporting">
      <h2 className="sv-supporting__head">Related Data</h2>
      <ul className="sv-related">
        {facts.map(fact => <li key={fact.id} id={`evidence-${fact.id}`}><Link href={factPath(slug, fact.id)}>{fact.title ?? fact.claim}</Link></li>)}
      </ul>
    </section>
  );
}

/**
 * The way back from a report's own page: to its topic, with the row it is read
 * in open. A supporting report has no row and is read inside its parent's.
 */
export function BackToTopic({ slug, topicTitle, fact }: { slug: string; topicTitle: string; fact: Fact }) {
  return (
    <nav className="sv-backlink" aria-label="Back to the topic">
      <Link href={`${topicPath(slug)}#${anchorFor('fact', fact.supports ?? fact.id)}`}>
        <span aria-hidden="true">←</span> {topicTitle}
      </Link>
    </nav>
  );
}

type FactArticleProps = {
  slug: string;
  fact: Fact;
  /** The facts related to this one, each linked below the panel. */
  supporting?: Fact[];
  /** The headline claim this fact is evidence for, when it is a supporting fact. */
  parent?: Fact;
  /** The fact's data panel, the same one a topic page has. */
  panel?: ReactNode;
};

/**
 * One report at its own address: what surrounds its data panel, which is the
 * title and claim above it and links to related reports below.
 */
export function FactArticle({ slug, fact, supporting = [], parent, panel }: FactArticleProps) {
  return (
    <article className="sv-factpage" data-variant="page">
      <EvidenceNavigation>
        {/*
         * A supporting fact is evidence for a larger claim and says little
         * standing alone — the out-of-context number this whole site exists to
         * prevent. So the claim it supports is stated *above* it, before the
         * reader has read a word of the detail, and links to where that claim
         * is argued.
         */}
        {parent && (
          <div className="sv-parentnote">
            <p className="sv-parentnote__label">Related to</p>
            <Link className="sv-parentnote__claim" href={factPath(slug, parent.id)}>
              {parent.title ?? parent.claim}
            </Link>
          </div>
        )}

        <header className="sv-factpage__head">
          <h1 className="sv-factpage__claim">{fact.title ?? fact.claim}</h1>
          <Finding fact={fact} />
          {fact.assessedClaim && <p className="sv-assessed">Claim assessed: “{fact.assessedClaim}”</p>}
        </header>

        {panel}

        <div className="sv-factpage__body">
          <RelatedReports slug={slug} facts={supporting} />
        </div>
      </EvidenceNavigation>
    </article>
  );
}
