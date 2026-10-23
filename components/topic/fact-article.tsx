import type { ReactNode } from 'react';
import Link from 'next/link';
import { chartObservations, methodChanges } from '@/lib/content/chart-observations';
import type { Fact } from '@/lib/content/types';
import { factPath, topicPath } from '@/lib/content/types';
import { Prose } from './prose';
import { SeriesChart } from './series-chart';
import { ComparisonChart } from './comparison-chart';
import { StatusBadge } from './status-badge';
import { EvidenceNavigation } from './evidence-navigation';

/** A fact and its rendered body, shared by full pages and previews. */
export type BodiedFact = { fact: Fact; bodyHtml: string };

function allSources(fact: Fact) {
  return [...fact.sources, ...[...(fact.series ? [fact.series] : []), ...(fact.additionalSeries ?? [])].flatMap(series => [series.source, ...series.readings.flatMap(r => r.source ? [r.source] : [])])];
}

function Sources({ facts }: { facts: Fact[] }) {
  return <details className="sv-references">
    <summary>Sources</summary>
    {facts.map(fact => <div key={fact.id} className="sv-reference-group">
      {facts.length > 1 && <p className="sv-reference-group__title">{fact.title ?? fact.claim}</p>}
      <ol>{allSources(fact).map((source, i) => <li id={`source-${fact.id}-${i + 1}`} key={i} className="sv-source">
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

function FactCharts({ fact, observations = {}, subtleties = {}, afterSeries }: { fact: Fact; observations?: Record<string, string>; subtleties?: Record<string, string>; afterSeries?: ReactNode }) {
  return <>
    {fact.series && <SeriesChart factId={fact.id} series={fact.series} sourceOffset={fact.sources.length} observations={Object.fromEntries(fact.series.readings.map(reading => [reading.id, <Prose key={reading.id} html={(observations[reading.id] ?? "") + (subtleties[reading.id] ?? "") + methodChanges(fact.id, reading.id, fact.series!.breaks, fact.sources.length + 1)} className="sv-graph-observations" />]))} />}
    {fact.additionalSeries?.map((series, i) => {
      const sourceOffset = fact.sources.length + (fact.series ? 1 + fact.series.readings.filter(r => r.source).length : 0) + fact.additionalSeries!.slice(0, i).reduce((n, s) => n + 1 + s.readings.filter(r => r.source).length, 0);
      return <SeriesChart key={series.id} chartId={series.id} factId={fact.id} series={series} sourceOffset={sourceOffset} observations={Object.fromEntries(series.readings.map(reading => [reading.id, <Prose key={reading.id} html={(observations[reading.id] ?? "") + (subtleties[reading.id] ?? "") + methodChanges(fact.id, reading.id, series.breaks, sourceOffset + 1)} className="sv-graph-observations" />]))} />;
    })}
    {afterSeries}
    {fact.comparisons?.map(chart => <ComparisonChart key={chart.id} fact={fact} chart={chart} sources={allSources(fact)} observations={(observations[chart.id] || subtleties[chart.id]) && <Prose html={(observations[chart.id] ?? "") + (subtleties[chart.id] ?? "")} className="sv-graph-observations" />} />)}
  </>;
}

function FactBody({ fact, bodyHtml, featured = [], hideCharts = false }: BodiedFact & { featured?: BodiedFact[]; hideCharts?: boolean }) {
  const grouped = chartObservations(bodyHtml, fact.id, [...(fact.series?.readings.map(r => r.id) ?? []), ...(fact.additionalSeries?.flatMap(s => s.readings.map(r => r.id)) ?? []), ...(fact.comparisons?.map(c => c.id) ?? [])]);
  return <>
    <p className="sv-finding" id={`${fact.id}--finding`}>
      {fact.claim}{' '}
      {(fact.claimSources ?? [1]).map(n => <a key={n} className="sv-footnote" href={`#source-${fact.id}-${n}`} aria-label={`Source ${n}`}>[{n}]</a>)}
    </p>
    {!hideCharts && <FactCharts fact={fact} observations={grouped.observations} subtleties={grouped.subtleties} afterSeries={featured.map(child => {
      const childGroups = chartObservations(child.bodyHtml, child.fact.id, [...(child.fact.series?.readings.map(r => r.id) ?? []), ...(child.fact.comparisons?.map(c => c.id) ?? [])]);
      return <FactCharts key={child.fact.id} fact={child.fact} observations={childGroups.observations} subtleties={childGroups.subtleties} />;
    })} />}
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
function SupportingFact({ slug, fact, bodyHtml, hideCharts }: BodiedFact & { slug: string; hideCharts?: boolean }) {
  return (
    <details id={`evidence-${fact.id}`} className="sv-item sv-subfact" data-status={fact.status}>
      <summary className="sv-item__summary">
        <span className="sv-item__claim">{fact.title ?? fact.claim}</span> <StatusBadge status={fact.status} />
      </summary>
      <div className="sv-item__body">
        <FactBody fact={fact} bodyHtml={bodyHtml} hideCharts={hideCharts} />
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
 * Where the reader is: the topic, then this fact. Sits outside the article so
 * the status rule down the fact's left edge starts at the fact, not above it.
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
          <Link className="sv-parentnote__claim" href={factPath(slug, parent.id)}>
            {parent.title ?? parent.claim}
          </Link>
        </div>
      )}

      <header className="sv-factpage__head">
        <Claim className="sv-factpage__claim" id={headingId}>
          {fact.title ?? fact.claim}
        </Claim>
        {fact.assessedClaim ? <p className="sv-assessed">Claim assessed: “{fact.assessedClaim}” <StatusBadge status={fact.status} /></p> : <StatusBadge status={fact.status} />}
      </header>

      <div className="sv-factpage__body">
        <FactBody fact={fact} bodyHtml={bodyHtml} featured={supporting.filter(({ fact: child }) => fact.featuredCharts?.includes(child.id)) } />

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
              <SupportingFact key={child.id} slug={slug} fact={child} bodyHtml={childBody} hideCharts={fact.featuredCharts?.includes(child.id)} />
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
