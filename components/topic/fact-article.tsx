import Link from 'next/link';
import type { ReactNode } from 'react';
import { factSlides } from '@/lib/content/preview';
import { factSources } from '@/lib/content/sources';
import type { Fact, Topic } from '@/lib/content/types';
import { anchorFor, factPath, topicPath } from '@/lib/content/types';
import { UNKNOWNS_LABEL, factCitations } from '@/lib/content/walkthrough';
import { DataStillNeededList } from './data-still-needed';
import { Prose } from './prose';
import { FactCharts, FactFigures, FeaturedCharts, chartGroups, figureGroups, type BodiedFact, type FigurePage } from './fact-figures';
import { EvidenceNavigation } from './evidence-navigation';
import { SheetTitle } from './sheet-title';
import { VizTabs } from './viz-tabs';

export type { BodiedFact } from './fact-figures';

/** In a sheet, every source a chart lists, by its number. A source no chart lists is not shown anywhere. */
function Sources({ slug, facts }: { slug: string; facts: Fact[] }) {
  return <details className="sv-references">
    <summary>Sources</summary>
    {facts.map(fact => {
      const listed = new Set(factCitations(fact, factSlides(slug, fact)).flat());
      return <div key={fact.id} className="sv-reference-group">
        {facts.length > 1 && <p className="sv-reference-group__title">{fact.title ?? fact.claim}</p>}
        <ol>{factSources(fact).map((source, i) => listed.has(i + 1) && <li id={`source-${fact.id}-${i + 1}`} key={i} value={i + 1} className="sv-source">
          <a href={source.url} target="_blank" rel="noreferrer noopener">{source.title}</a>
          <p>{source.publisher}, {source.date} · {source.stance}</p>
          <details className="sv-source-quote">
            <summary>
              <span className="sv-source-quote__preview">“{source.quote}”</span>
              <span className="sv-source-quote__expanded">Hide quote</span>
            </summary>
            <blockquote cite={source.url}>{source.quote}</blockquote>
          </details>
        </li>)}</ol>
      </div>;
    })}
  </details>;
}

/** The last slide's list, in a sheet. */
function DataStillNeeded({ fact }: { fact: Fact }) {
  if (!fact.dataStillNeeded?.length) return null;
  return (
    <section className="sv-data-needed" aria-labelledby={`${fact.id}--data-still-needed`}>
      <h3 id={`${fact.id}--data-still-needed`}>{UNKNOWNS_LABEL}</h3>
      <DataStillNeededList fact={fact} />
    </section>
  );
}

function Finding({ fact }: { fact: Fact }) {
  return <p className="sv-finding" id={`${fact.id}--finding`}>
    {fact.claim}{' '}
    {(fact.claimSources ?? [1]).map(n => <a key={n} className="sv-footnote" href={`#source-${fact.id}-${n}`} aria-label={`Source ${n}`}>[{n}]</a>)}
  </p>;
}

function FactBody({ fact, bodyHtml, featured = [], hideCharts = false, page }: BodiedFact & { featured?: BodiedFact[]; hideCharts?: boolean; page: FigurePage }) {
  // A fact with `figures` sets its own reading order; even with its charts
  // shown elsewhere (featured in its parent) the groups and sections those
  // charts carry are lifted out of its body, as they are without `figures`.
  if (fact.figures) {
    const groups = figureGroups(fact, bodyHtml);
    return <>
      <Finding fact={fact} />
      {!hideCharts && <FactFigures fact={fact} observations={groups.observations} subtleties={groups.subtleties} sections={groups.sections} featured={featured} page={page} />}
      <Prose html={groups.bodyHtml} />
    </>;
  }
  const grouped = chartGroups(fact, bodyHtml);
  return <>
    <Finding fact={fact} />
    {!hideCharts && <FactCharts fact={fact} observations={grouped.observations} subtleties={grouped.subtleties} afterSeries={featured.map(child => <FeaturedCharts key={child.fact.id} child={child} page={page} />)} />}
    <Prose html={grouped.bodyHtml} />
  </>;
}

/**
 * The reports related to this one, on its own page: a link to each, whose whole
 * text is at the far end of it. `#evidence-<fact>` lands on its line.
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
 * A supporting fact shown inside the headline claim it is evidence for.
 *
 * Collapsed by default and a native `<details>`, for the same reason every
 * collapse on this site is one: it opens with JavaScript off, prints open, and
 * comes with keyboard, find-in-page and screen-reader behaviour already
 * correct. Its claim links to its own page, because it has one — but the
 * evidence is right here, so reading it is not a round trip.
 */
function SupportingFact({ slug, fact, bodyHtml, hideCharts, page }: BodiedFact & { slug: string; hideCharts?: boolean; page: FigurePage }) {
  return (
    <details id={`evidence-${fact.id}`} className="sv-item sv-subfact">
      <summary className="sv-item__summary">
        <span className="sv-item__claim">{fact.title ?? fact.claim}</span>
      </summary>
      <div className="sv-item__body">
        <FactBody fact={fact} bodyHtml={bodyHtml} hideCharts={hideCharts} page={page} />
        <p className="sv-permalink">
          {/* A plain anchor, not a <Link>: this says "on its own page", so it
              must load that page rather than be intercepted into a modal. */}
          <a href={factPath(slug, fact.id)} data-fact-expand>Open this data collection on its own page</a>
        </p>
      </div>
    </details>
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

/**
 * One fact, whole: as its own page, and inside the sheet over its topic.
 *
 * In the sheet the article draws its charts, which `VizTabs` steps through, and
 * their prose, sources and what is still unknown follow. On its own page `panel`
 * holds all of that, the same data panel a topic page has, and the article is
 * what surrounds it: the title and claim above, and links to related reports
 * below. Everything in the panel comes from the same fact, so the two cannot
 * read differently.
 */
export function FactArticle({
  slug,
  fact,
  bodyHtml,
  supporting = [],
  parent,
  variant,
  panel,
  headingId,
  topic,
}: {
  slug: string;
  fact: Fact;
  bodyHtml: string;
  /** The facts that are evidence for this one. Empty for a supporting fact. */
  supporting?: BodiedFact[];
  /** The headline claim this fact is evidence for, when it is a supporting fact. */
  parent?: Fact;
  variant: 'page' | 'modal';
  /** The fact's data panel on its own page. */
  panel?: ReactNode;
  /** Id put on the claim so a dialog can be `aria-labelledby` it. */
  headingId?: string;
  /**
   * The fact's topic, for figures: `lastUpdated` ends a period still in force,
   * and the topic's facts resolve a claim check's evidence link. Without it
   * only the facts on this page are known.
   */
  topic?: Pick<Topic, 'lastUpdated' | 'facts'>;
}) {
  const page: FigurePage = {
    slug,
    asOf: topic?.lastUpdated,
    facts: topic?.facts ?? [fact, ...supporting.map(({ fact: child }) => child), ...(parent ? [parent] : [])],
  };
  const report = (
    <>
      {/*
       * A supporting fact is evidence for a larger claim and says little
       * standing alone — the out-of-context number this whole site exists to
       * prevent. So the claim it supports is stated *above* it, before the
       * reader has read a word of the detail, and links to where that claim is
       * argued.
       */}
      {parent && (
        <div className="sv-parentnote">
          <p className="sv-parentnote__label">Related to</p>
          {/* Inside the sheet this replaces the open fact rather than stacking
              history, so Close still returns to the topic in one step, and the
              sheet manages its own scroll. */}
          <Link className="sv-parentnote__claim" href={factPath(slug, parent.id)}
            replace={variant === 'modal'} scroll={variant === 'page'}>
            {parent.title ?? parent.claim}
          </Link>
        </div>
      )}

      {/* In a sheet the title sits in the sheet's bar, saving the room for the data. */}
      {variant === 'modal' && headingId && <SheetTitle id={headingId}>{fact.title ?? fact.claim}</SheetTitle>}
      {(variant === 'page' || fact.assessedClaim) && (
        <header className="sv-factpage__head">
          {variant === 'page' && <h1 className="sv-factpage__claim">{fact.title ?? fact.claim}</h1>}
          {variant === 'page' && <Finding fact={fact} />}
          {fact.assessedClaim && <p className="sv-assessed">Claim assessed: “{fact.assessedClaim}”</p>}
        </header>
      )}

      {variant === 'modal' && <VizTabs />}
      {panel}

      <div className="sv-factpage__body">
        {variant === 'page' ? <RelatedReports slug={slug} facts={supporting.map(({ fact: child }) => child)} /> : <>
          <FactBody fact={fact} bodyHtml={bodyHtml} featured={supporting.filter(({ fact: child }) => fact.featuredCharts?.includes(child.id))} page={page} />

          {supporting.length > 0 && (
            /*
             * Supporting facts stay nested here rather than being listed beside
             * the claim: a contract overrun or a grant-rate movement is evidence
             * for a larger claim, and the nesting is what says so.
             */
            <section className="sv-supporting">
              <h3 className="sv-supporting__head">
                Related Data
              </h3>
              {supporting.map(({ fact: child, bodyHtml: childBody }) => (
                <SupportingFact key={child.id} slug={slug} fact={child} bodyHtml={childBody} hideCharts={fact.featuredCharts?.includes(child.id)} page={page} />
              ))}
            </section>
          )}

          <DataStillNeeded fact={fact} />
          <Sources slug={slug} facts={[fact, ...supporting.map(({ fact: child }) => child)]} />

          <p className="sv-permalink">
            <a href={factPath(slug, fact.id)} data-fact-expand>Open this data collection on its own page</a>
          </p>
        </>}
      </div>
    </>
  );
  return (
    <article className="sv-factpage" data-variant={variant}>
      {variant === 'page' ? <EvidenceNavigation>{report}</EvidenceNavigation> : report}
    </article>
  );
}
