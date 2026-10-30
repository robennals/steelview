import Link from 'next/link';
import { factSources } from '@/lib/content/sources';
import type { Fact, Topic } from '@/lib/content/types';
import { factPath, topicPath } from '@/lib/content/types';
import { Prose } from './prose';
import { FactCharts, FactFigures, FeaturedCharts, chartGroups, figureGroups, type BodiedFact, type FigurePage } from './fact-figures';
import { EvidenceNavigation } from './evidence-navigation';
import { SheetTitle } from './sheet-title';
import { VizTabs } from './viz-tabs';

export type { BodiedFact } from './fact-figures';

function Sources({ facts }: { facts: Fact[] }) {
  return <details className="sv-references">
    <summary>Sources</summary>
    {facts.map(fact => <div key={fact.id} className="sv-reference-group">
      {facts.length > 1 && <p className="sv-reference-group__title">{fact.title ?? fact.claim}</p>}
      <ol>{factSources(fact).map((source, i) => <li id={`source-${fact.id}-${i + 1}`} key={i} className="sv-source">
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
    </div>)}
  </details>;
}

/** A transparent record of the measurements that would change this report. */
function DataStillNeeded({ fact }: { fact: Fact }) {
  if (!fact.dataStillNeeded?.length) return null;
  return (
    <section className="sv-data-needed" aria-labelledby={`${fact.id}--data-still-needed`}>
      <h3 id={`${fact.id}--data-still-needed`}>Data still needed</h3>
      <ul>
        {fact.dataStillNeeded.map((item) => (
          <li key={item.measure}>
            <strong>{item.measure}</strong>
            <span>{item.why}</span>
          </li>
        ))}
      </ul>
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
 * Where the reader is: the topic, then this fact.
 */
export function FactCrumbs({ slug, topicTitle }: { slug: string; topicTitle: string }) {
  return (
    <nav className="sv-crumbs" aria-label="Breadcrumb">
      <Link href={topicPath(slug)}>{topicTitle}</Link>
      <span aria-hidden="true">/</span>
      <span>Data</span>
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
  return (
    <article className="sv-factpage" data-variant={variant}>
      <EvidenceNavigation />
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
          {fact.assessedClaim && <p className="sv-assessed">Claim assessed: “{fact.assessedClaim}”</p>}
        </header>
      )}

      <VizTabs />

      <div className="sv-factpage__body">
        <FactBody fact={fact} bodyHtml={bodyHtml} featured={supporting.filter(({ fact: child }) => fact.featuredCharts?.includes(child.id)) } page={page} />

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
        <Sources facts={[fact, ...supporting.map(({ fact: child }) => child)]} />

        {variant === 'modal' && (
          <p className="sv-permalink">
            <a href={factPath(slug, fact.id)} data-fact-expand>Open this data collection on its own page</a>
          </p>
        )}
      </div>
    </article>
  );
}
