import Link from 'next/link';
import type { Fact, SourceStance } from '@/lib/content/types';
import { factPath, topicPath } from '@/lib/content/types';
import { Prose } from './prose';
import { SeriesChart } from './series-chart';
import { StatusBadge } from './status-badge';
import { Glyph, type GlyphShape } from './glyph';

const STANCE_HEADINGS: Record<SourceStance, string> = {
  supports: 'Supporting',
  contests: 'Contesting',
  complicates: 'Complicating',
};

// The same glyph family as the fact statuses, so a reader learns one alphabet.
const STANCE_SHAPES: Record<SourceStance, GlyphShape> = {
  supports: 'solid',
  contests: 'split',
  complicates: 'quartered',
};

const STANCE_ORDER: SourceStance[] = ['supports', 'contests', 'complicates'];

/** A fact and its rendered markdown body, paired because the page renders bodies up front. */
export type BodiedFact = { fact: Fact; bodyHtml: string };

function Sources({ fact }: { fact: Fact }) {
  return (
    <>
      {STANCE_ORDER.map((stance) => {
        const sources = fact.sources.filter((s) => s.stance === stance);
        if (sources.length === 0) return null;
        return (
          <section key={stance} className="sv-stance">
            <h4 className="sv-stance__head">
              <Glyph shape={STANCE_SHAPES[stance]} />
              {STANCE_HEADINGS[stance]}
            </h4>
            {sources.map((source, i) => (
              <figure key={`${stance}-${i}`} className="sv-source">
                <blockquote cite={source.url}>{source.quote}</blockquote>
                <figcaption>
                  <a href={source.url} target="_blank" rel="noreferrer noopener">
                    {source.title}
                  </a>
                  , {source.publisher}, {source.date}
                </figcaption>
              </figure>
            ))}
          </section>
        );
      })}
    </>
  );
}

/**
 * Everything a reader sees of one fact once it is open: its context, its
 * series, then its sources. The same element in every place a fact is read —
 * its own page, the modal over the topic, and nested under the headline claim
 * it is evidence for.
 */
function FactBody({ fact, bodyHtml }: BodiedFact) {
  return (
    <>
      <Prose html={bodyHtml} />
      {/*
       * The series sits between the body and the sources: the body says what
       * the number measures, the chart says what it has done over the whole
       * range the source publishes, and the quotes then back both. A chart
       * placed after the sources would be read as an appendix, when it is the
       * answer to "compared to what?" that the claim above it invites.
       */}
      {fact.series && <SeriesChart factId={fact.id} series={fact.series} />}
      <Sources fact={fact} />
    </>
  );
}

/**
 * A supporting fact shown inside the headline claim it is evidence for.
 *
 * Collapsed by default and a native `<details>`, for the same reason every
 * collapse on this site is one: it opens with JavaScript off, prints open, and
 * comes with keyboard, find-in-page and screen-reader behaviour already
 * correct. Its claim links to its own page, because it has one — but the
 * evidence is right here, so reading it is not a round trip.
 */
function SupportingFact({ slug, fact, bodyHtml }: BodiedFact & { slug: string }) {
  return (
    <details className="sv-item sv-subfact" data-status={fact.status}>
      <summary className="sv-item__summary">
        <span className="sv-item__claim">{fact.claim}</span> <StatusBadge status={fact.status} />
      </summary>
      <div className="sv-item__body">
        <FactBody fact={fact} bodyHtml={bodyHtml} />
        <p className="sv-permalink">
          {/* A plain anchor, not a <Link>: this says "on its own page", so it
              must load that page rather than be intercepted into a modal. */}
          <a href={factPath(slug, fact.id)} data-fact-expand>Open this fact on its own page</a>
        </p>
      </div>
    </details>
  );
}

/**
 * Where the reader is: the topic, then this fact. Sits outside the article so
 * the status rule down the fact's left edge starts at the fact, not above it.
 */
export function FactCrumbs({ slug, topicTitle }: { slug: string; topicTitle: string }) {
  return (
    <nav className="sv-crumbs" aria-label="Breadcrumb">
      <Link href={topicPath(slug)}>{topicTitle}</Link>
      <span aria-hidden="true">/</span>
      <span>Fact</span>
    </nav>
  );
}

/**
 * One fact, whole: the same article on its own page and inside the modal over
 * its topic.
 *
 * The two variants differ only in what the claim is — the page's `<h1>`, or
 * the modal's labelled heading. Everything under it is byte-identical, so a
 * fact read in the modal and a fact read at its URL cannot drift apart.
 */
export function FactArticle({
  slug,
  fact,
  bodyHtml,
  supporting = [],
  parent,
  variant,
  headingId,
}: {
  slug: string;
  fact: Fact;
  bodyHtml: string;
  /** The facts that are evidence for this one. Empty for a supporting fact. */
  supporting?: BodiedFact[];
  /** The headline claim this fact is evidence for, when it is a supporting fact. */
  parent?: Fact;
  variant: 'page' | 'modal';
  /** Id put on the claim so a dialog can be `aria-labelledby` it. */
  headingId?: string;
}) {
  const Claim = variant === 'page' ? 'h1' : 'h2';
  return (
    <article className="sv-factpage" data-status={fact.status} data-variant={variant}>
      {/*
       * A supporting fact is evidence for a larger claim and says little
       * standing alone — the out-of-context number this whole site exists to
       * prevent. So the claim it supports is stated *above* it, before the
       * reader has read a word of the detail, and links to where that claim is
       * argued.
       */}
      {parent && (
        <div className="sv-parentnote">
          <p className="sv-parentnote__label">Evidence for</p>
          <Link className="sv-parentnote__claim" href={factPath(slug, parent.id)}>
            {parent.claim}
          </Link>
        </div>
      )}

      <header className="sv-factpage__head">
        <Claim className="sv-factpage__claim" id={headingId}>
          {fact.claim}
        </Claim>
        <StatusBadge status={fact.status} />
      </header>

      <div className="sv-factpage__body">
        <FactBody fact={fact} bodyHtml={bodyHtml} />

        {supporting.length > 0 && (
          /*
           * Supporting facts stay nested here rather than being listed beside
           * the claim: a contract overrun or a grant-rate movement is evidence
           * for a larger claim, and the nesting is what says so.
           */
          <section className="sv-supporting">
            <h3 className="sv-supporting__head">
              Supporting {supporting.length === 1 ? 'fact' : 'facts'}
            </h3>
            {supporting.map(({ fact: child, bodyHtml: childBody }) => (
              <SupportingFact key={child.id} slug={slug} fact={child} bodyHtml={childBody} />
            ))}
          </section>
        )}

        {variant === 'modal' && (
          <p className="sv-permalink">
            <a href={factPath(slug, fact.id)} data-fact-expand>Open this fact on its own page</a>
          </p>
        )}
      </div>
    </article>
  );
}
