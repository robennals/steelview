import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { figureExamplesFact, figureExamplesTopic } from '@/lib/content/__fixtures__/figure-examples';
import { areaMapProps, figureContext, figureDomId } from '@/lib/content/figure-props';
import { loadTopic } from '@/lib/content/load';
import { factSlides } from '@/lib/content/preview';
import { isComponentFigure, type Fact } from '@/lib/content/types';
import { renderDataWalkthroughs, viewpointWalkthrough } from '@/lib/content/walkthrough';
import { ChartThumb } from './chart-thumb';
import { FactFigures, PanelChart, vizDomId } from './fact-figures';
import { ObservationStep } from './observation-bar';
import { SlideChart } from './slide-chart';

const fact = figureExamplesFact();

function thumb(chart: string, of: Fact = fact): string {
  return renderToStaticMarkup(createElement(ChartThumb, { fact: of, chart }));
}

/** Every silhouette is decoration: one hidden SVG, no text. */
function assertDecorative(html: string) {
  assert.match(html, /^<svg class="sv-thumb"[^>]*aria-hidden="true"/);
  assert.doesNotMatch(html, /<text|<title/);
}

test('a series thumbnail draws its first reading as decorative lines', () => {
  const html = thumb('series');
  assertDecorative(html);
  assert.ok((html.match(/<path /g)?.length ?? 0) >= 1);
});

test('a comparison thumbnail draws one column per item, marking the highlighted one', () => {
  const items = Array.from({ length: 12 }, (_, i) => ({ label: `Country ${i}`, value: 12 - i, highlight: i === 4 || undefined }));
  const withComparison: Fact = { ...fact, comparisons: [{ id: 'per-head', title: 'Per head', description: 'd', unit: 'count', valueLabel: 'v', sources: [1], items }] };
  const html = thumb('per-head', withComparison);
  assertDecorative(html);
  assert.equal(html.match(/class="sv-thumb__column"/g)?.length, 12);
  assert.equal(html.match(/data-highlight="true"/g)?.length, 1);
});

test('a bar chart thumbnail draws one bar per item', () => {
  const html = thumb('wa-by-race');
  assertDecorative(html);
  assert.equal(html.match(/class="sv-thumb__column"/g)?.length, 5);
});

test('a qualified bar chart thumbnail draws a published range as a bar and a whisker', () => {
  const html = thumb('deaths-by-region');
  assertDecorative(html);
  assert.equal(html.match(/class="sv-thumb__column"/g)?.length, 5);
  assert.equal(html.match(/class="sv-thumb__whisker"/g)?.length, 1);
});

test('a paired bar chart thumbnail draws every measure of every row, and a dumbbell two dots joined', () => {
  const paired = thumb('hours-to-count');
  assertDecorative(paired);
  assert.equal(paired.match(/<rect /g)?.length, 8);
  const dumbbell = thumb('pre-vra-registration');
  assertDecorative(dumbbell);
  assert.equal(dumbbell.match(/class="sv-thumb__dot"/g)?.length, 6);
  assert.equal(dumbbell.match(/class="sv-thumb__rule"/g)?.length, 3);
});

test('a slice explorer thumbnail draws its opening cut, every non-empty part of every bar', () => {
  const html = thumb('war-powers-votes');
  assertDecorative(html);
  // The House vote, by party and split by position: Democrats 213 yes, Republicans 7 yes and 203 no.
  assert.equal(html.match(/<rect /g)?.length, 3);
});

test('a small multiples thumbnail draws every panel\'s line, the highlighted one in the accent', () => {
  const html = thumb('chokepoint-traffic');
  assertDecorative(html);
  assert.equal(html.match(/<path /g)?.length, 5);
  assert.equal(html.match(/stroke="var\(--accent\)"/g)?.length, 1);
});

test('a composition thumbnail draws every part of every row', () => {
  const html = thumb('deaths-by-counter');
  assertDecorative(html);
  // HRANA has three parts, Hengaw two.
  assert.equal(html.match(/<rect /g)?.length, 5);
});

test('an estimate range thumbnail draws an interval or a dot for every estimate', () => {
  const html = thumb('cost-estimates');
  assertDecorative(html);
  // Three estimators publish a central value, two a range.
  assert.equal(html.match(/class="sv-thumb__dot"/g)?.length, 3);
  assert.equal(html.match(/<line x1=/g)?.length, 2);
});

test('an estimate range thumbnail dashes a lone bound\'s open tail', () => {
  const lone: Fact = { ...fact, figures: fact.figures!.map(f => (f.kind === 'estimateRange' && f.id === 'cost-estimates' ? { ...f, estimates: [{ label: 'Upper bound only', high: 20, sources: [14] }, { label: 'Both', low: 5, high: 15, sources: [15] }] } : f)) };
  const html = thumb('cost-estimates', lone);
  assert.equal(html.match(/stroke-dasharray="3 2"/g)?.length, 1);
});

test('a scatter thumbnail draws one dot per point', () => {
  const html = thumb('count-speed');
  assertDecorative(html);
  assert.equal(html.match(/class="sv-thumb__dot"/g)?.length, 5);
});

test('a tile map thumbnail draws every tile, keeping its shape, with no data marked', () => {
  const html = thumb('rejection-by-state');
  assertDecorative(html);
  assert.match(html, /preserveAspectRatio="xMidYMid meet"/);
  assert.equal(html.match(/class="sv-thumb__area"/g)?.length, 51);
  // Six states have data; the other 45 read "No data".
  assert.equal(html.match(/data-missing="true"/g)?.length, 45);
});

test('a geo map thumbnail draws every region of its outline set', () => {
  const html = thumb('postal-voting');
  assertDecorative(html);
  assert.ok((html.match(/class="sv-thumb__area"/g)?.length ?? 0) > 100);
  // Thinned to the thumbnail's scale, so it is small enough to sit in a collapsed row's markup.
  assert.ok(html.length < 40_000, `${html.length} characters`);
});

test('a map thumbnail draws its default view, and leaves out the areas the map draws as dots', () => {
  const tiles = thumb('asylum-per-head');
  assert.match(tiles, /<rect class="sv-thumb__area"/);
  const world = fact.figures!.find(f => f.kind === 'map' && f.id === 'postal-voting');
  assert.ok(world && world.kind === 'map');
  const html = thumb('postal-voting');
  const { regions } = areaMapProps(world, figureContext(fact));
  const outlined = regions.filter(region => !region.point && region.coordinates.length > 0).length;
  assert.ok((html.match(/class="sv-thumb__area"/g)?.length ?? 0) <= outlined);
  assert.ok(regions.some(region => region.point), 'the world preset has dot areas');
});

test('timeline thumbnails mark every event, and every period of every row', () => {
  const events = thumb('court-record');
  assertDecorative(events);
  assert.equal(events.match(/<line x1=/g)?.length, 5);
  const periods = thumb('war-periods');
  assertDecorative(periods);
  assert.equal(periods.match(/<rect /g)?.length, 5);
});

test('a kind with no silhouette of its own draws plain rows, and an unknown chart draws nothing', () => {
  assert.equal(thumb('audit-recheck').match(/class="sv-thumb__column"/g)?.length, 4);
  assert.equal(thumb('federal-laws').match(/class="sv-thumb__column"/g)?.length, 4);
  assert.equal(renderToStaticMarkup(createElement(ChartThumb, { fact, chart: 'no-such-chart' })), '');
});

test('a walkthrough slide draws a library figure only when given its page', async () => {
  const topic = await loadTopic('uk-asylum');
  const fact = topic.facts.find(f => f.id === 'asylum-law-and-the-echr')!;
  const slide = { fact, chart: 'article-31', label: 'Article 31', href: '/x' };
  const page = { slug: 'uk-asylum', asOf: topic.lastUpdated, facts: topic.facts };
  assert.match(renderToStaticMarkup(createElement(SlideChart, { slide, page })), /sv-slide__figure[\s\S]*sv-cards__list/);
  assert.equal(renderToStaticMarkup(createElement(SlideChart, { slide })), '');
});

test('a walkthrough slide draws a graph-like figure compactly, and a text figure only when given its page', () => {
  const topic = figureExamplesTopic();
  const page = { slug: topic.slug, asOf: topic.lastUpdated, facts: topic.facts };
  const slideOf = (chart: string) => ({ fact, chart, label: chart, href: '/x' });
  assert.match(renderToStaticMarkup(createElement(SlideChart, { slide: slideOf('wa-by-race'), fit: 'tall', page })), /<figure[^>]*data-preview[\s\S]*sv-chart__preview/);
  assert.match(renderToStaticMarkup(createElement(SlideChart, { slide: slideOf('federal-laws'), page })), /sv-slide__figure[\s\S]*<table/);
  assert.equal(renderToStaticMarkup(createElement(SlideChart, { slide: slideOf('federal-laws') })), '');
  assert.equal(renderToStaticMarkup(createElement(SlideChart, { slide: slideOf('no-such-chart'), page })), '');
});

/** Every library figure in the fixture, which holds an example of every kind. */
const libraryFigures = figureExamplesFact().figures!.filter(isComponentFigure);

/** The fixture with an observation attached to every figure, cited as `seen-<id>`. */
function observedFact(): Fact {
  const groups = libraryFigures.map(({ id }) => `## Observations {#${fact.id}--observations-${id}}\n\n### Seen in ${id} {#${fact.id}--seen-${id}}\n\nWhat ${id} shows.`);
  return { ...fact, body: [fact.body, ...groups].join('\n\n') };
}

const observedTopic = figureExamplesTopic(observedFact());
const observedPage = { slug: observedTopic.slug, asOf: observedTopic.lastUpdated, facts: observedTopic.facts };
const observed = observedTopic.facts[0];

for (const figure of libraryFigures) {
  const { id, kind } = figure;

  test(`a ${kind} (${id}) is a walkthrough step: a slide, a thumbnail and a chart drawn`, () => {
    const slide = factSlides(observedTopic.slug, observed).find(s => s.chart === id);
    assert.ok(slide, 'it has a slide');
    assert.ok(slide.label.length > 0);
    assert.equal(slide.href, `/topics/${observedTopic.slug}/facts/${observed.id}#${figureDomId(observed, id)}`);
    assert.match(renderToStaticMarkup(createElement(ChartThumb, { fact: observed, chart: id })), /^<svg class="sv-thumb"/);
    assert.match(renderToStaticMarkup(createElement(SlideChart, { slide, fit: 'tall', page: observedPage })), /<figure/);
  });

  test(`a viewpoint step citing an observation on a ${kind} (${id}) shows it`, () => {
    const steps = (citation: string) => viewpointWalkthrough(observedTopic, { ...observedTopic.viewpoints[0], body: `### A step\n\n[It](#fact-${observed.id}/${citation})` }).steps;
    assert.equal(steps(`seen-${id}`)[0].chart?.chart, id);
    assert.equal(steps(`chart-${id}`)[0].chart?.chart, id);
  });

  test(`a ${kind} (${id}) is a visualization on its fact's page, with the id its links name`, () => {
    const html = renderToStaticMarkup(createElement(FactFigures, { fact: observed, observations: {}, subtleties: {}, sections: {}, featured: [], page: observedPage }));
    assert.match(html, new RegExp(`id="${vizDomId(observed, id)}" data-viz="[^"]`));
    assert.equal(html.split(`id="${figureDomId(observed, id)}"`).length, 2, 'its chart id appears once');
  });
}

/** The kinds an observation can pick rows out of, each of which must draw them. */
const ROW_KINDS = new Set(['barChart', 'compositionBar', 'estimateRange', 'smallMultiples', 'timeline', 'periodTimeline', 'quotes', 'map', 'dataTable']);

test('every figure in a data panel shows the observation being stepped through', () => {
  const observations = [{ id: 'seen', heading: 'Seen here', html: '<p>Why.</p>', subtlety: false, href: '#seen', label: 'Seen here' }];
  for (const slide of factSlides(observedTopic.slug, observed).filter(s => libraryFigures.some(f => f.id === s.chart))) {
    const html = renderToStaticMarkup(createElement(ObservationStep, { observations }, createElement(PanelChart, { slide, page: observedPage })));
    assert.match(html, /sv-observe__claim[^>]*>Seen here/, slide.chart);
    const figure = libraryFigures.find(f => f.id === slide.chart)!;
    if (ROW_KINDS.has(figure.kind)) assert.match(html, /data-row="/, slide.chart);
  }
});

test('a data row shows each figure beside its own observations', async () => {
  const steps = (await renderDataWalkthroughs(observedTopic, [observed])).get(observed.id)!;
  for (const { id } of libraryFigures) {
    assert.ok(steps.find(s => s.chart.chart === id)?.observations.some(o => o.heading === `Seen in ${id}`), id);
  }
});
