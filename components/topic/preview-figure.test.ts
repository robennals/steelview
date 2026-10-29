import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { figureExamplesFact } from '@/lib/content/__fixtures__/figure-examples';
import { figureContext } from '@/lib/content/figure-props';
import { isComponentFigure, type ComponentFigure, type Fact } from '@/lib/content/types';
import { PreviewFigure } from './fact-figures';

const href = '/topics/example/facts/figure-examples';
const base = figureExamplesFact();

function figure(id: string, of: Fact = base): ComponentFigure {
  const found = of.figures!.find((f): f is ComponentFigure => isComponentFigure(f) && f.id === id);
  assert.ok(found, id);
  return found;
}

function preview(id: string, of: Fact = base): string {
  return renderToStaticMarkup(createElement(PreviewFigure, { figure: figure(id, of), context: figureContext(of, '2026-10-29'), preview: { href } }));
}

/** The fixture with figure `id` replaced by `change(figure)`, for a longer variant of a fixture figure. */
function variant(id: string, change: (f: ComponentFigure) => ComponentFigure): Fact {
  return { ...base, figures: base.figures!.map(f => (isComponentFigure(f) && f.id === id ? change(f) : f)) };
}

/**
 * What every preview is: a figure marked data-preview, its title as an h3
 * linking to the full figure, and the graph — no description, Graph/Table
 * switch, source line, Observations or About this data.
 */
function assertCompact(html: string, id: string, title: string) {
  assert.match(html, new RegExp(`^<figure class="sv-chart sv-report[^"]*" id="figure-examples--chart-${id}" data-preview="true">`));
  assert.ok(html.includes(`<h3 class="sv-graph-heading"><a href="${href}">${title}</a></h3>`), html.slice(0, 400));
  assert.doesNotMatch(html, /sv-chart__desc|sv-chart__view-controls|sv-chart__credit|sv-chart__methodology|About this data|<noscript/);
}

test('a bar chart preview is its title and every bar, with no axis', () => {
  const html = preview('wa-by-race');
  assertCompact(html, 'wa-by-race', 'Mail ballots rejected in Washington, by race, 2020');
  assert.equal(html.match(/class="sv-bars__row"/g)?.length, 5);
  assert.doesNotMatch(html, /sv-bars__axis|sv-chart__axis-label/);
  assert.doesNotMatch(html, /data-compact/);
});

test('a long bar chart preview clamps its rows, and past twelve becomes ranked columns stating the highlight\'s rank', () => {
  const nine = preview('wa-by-race', variant('wa-by-race', f => (f.kind === 'barChart' ? { ...f, items: Array.from({ length: 9 }, (_, i) => ({ label: `Group ${i}`, value: i + 1 })) } : f)));
  assert.match(nine, /class="sv-bars"[^>]*data-compact="true"/);
  assert.equal(nine.match(/class="sv-bars__row"/g)?.length, 9);
  const items = Array.from({ length: 32 }, (_, i) => ({ label: i === 16 ? 'United Kingdom' : `Country ${i}`, value: 40 - i, highlight: i === 16 || undefined }));
  const dense = preview('wa-by-race', variant('wa-by-race', f => (f.kind === 'barChart' ? { ...f, format: { unit: 'number' }, items } : f)));
  assert.equal(dense.match(/class="sv-comparison__column"/g)?.length, 32);
  assert.match(dense, /United Kingdom: 24 — 17th of 32/);
});

test('a qualified bar chart preview keeps each bar\'s end mark and printed qualifier, but not their key', () => {
  const html = preview('deaths-by-region');
  for (const qualification of ['lower-bound', 'upper-bound', 'approximate', 'range']) assert.match(html, new RegExp(`data-qualification="${qualification}"`));
  assert.match(html, /class="sv-bars__whisker"/);
  assert.match(html, /at least 159/);
  assert.doesNotMatch(html, /sv-bars__qualification-key/);
});

test('a long qualified bar chart preview stays as rows, since a column cannot carry an end mark', () => {
  const items = Array.from({ length: 14 }, (_, i) => ({ label: `Region ${i}`, value: i === 3 ? { value: 20, qualifier: 'at least' as const } : 30 - i }));
  const html = preview('deaths-by-region', variant('deaths-by-region', f => (f.kind === 'barChart' ? { ...f, items } : f)));
  assert.doesNotMatch(html, /sv-comparison__column/);
  assert.equal(html.match(/class="sv-bars__row"/g)?.length, 14);
  assert.match(html, /data-qualification="lower-bound"/);
});

test('a composition preview keeps its key and every part, but not the row sources', () => {
  const html = preview('deaths-by-counter');
  assertCompact(html, 'deaths-by-counter', 'Iranian deaths in the war, by counter and category, early April 2026');
  assert.equal(html.match(/class="sv-chart__key sv-bars__key"/g)?.length, 4);
  assert.equal(html.match(/class="sv-composition__row"/g)?.length, 2);
  assert.doesNotMatch(html, /sv-item-credit/);
});

test('a long composition preview puts each row on one line, and past twelve drops the shares a thin bar cannot hold', () => {
  const long = (length: number) => preview('deaths-by-counter', variant('deaths-by-counter', f => (f.kind === 'compositionBar' ? { ...f, rows: Array.from({ length }, (_, i) => ({ ...f.rows[0], label: `Group ${i}` })) } : f)));
  assert.doesNotMatch(preview('deaths-by-counter'), /sv-composition__rows"[^>]*data-compact/);
  const eight = long(8);
  assert.match(eight, /class="sv-composition__rows" data-compact="true" style="--sv-composition-total:6ch"/);
  assert.doesNotMatch(eight, /sv-composition__rows"[^>]*data-dense/);
  assert.equal(eight.match(/class="sv-composition__row"/g)?.length, 8);
  // The word stays in the markup, for the full figure and for a reader of the row's text.
  assert.match(eight, /class="sv-composition__total">3,636<span class="sv-composition__total-word"> total<\/span>/);
  const sixteen = long(16);
  assert.match(sixteen, /class="sv-composition__rows" data-compact="true" data-dense="true"/);
  assert.equal(sixteen.match(/class="sv-composition__row"/g)?.length, 16);
});

test('an estimate range preview draws every estimate and the axis, but not the method key or sources', () => {
  const html = preview('cost-estimates');
  assertCompact(html, 'cost-estimates', 'Estimated cost of the war to the US, by estimator, 2026');
  assert.equal(html.match(/class="sv-estimates__row"/g)?.length, 4);
  assert.match(html, /sv-estimates__axis/);
  assert.doesNotMatch(html, /sv-estimates__key|sv-item-credit/);
});

test('a scatter preview draws every point at its fit\'s shapes and the narrow plot, with both axis labels and no focus stops', () => {
  const html = preview('count-speed');
  assertCompact(html, 'count-speed', 'When mail processing may begin and how long the count took, 2024');
  assert.match(html, /data-variant="preview"/);
  assert.match(html, /data-variant="narrow"/);
  assert.doesNotMatch(html, /data-variant="wide"/);
  // Five points, drawn once in each of the three plots.
  assert.equal(html.match(/class="sv-scatter__point"/g)?.length, 15);
  assert.doesNotMatch(html, /tabindex/);
  assert.match(html, /Days before Election Day processing may begin/);
  assert.match(html, /Hours to count 95% of the vote/);
  const tall = renderToStaticMarkup(createElement(PreviewFigure, { figure: figure('count-speed'), context: figureContext(base), preview: { href: '/x', fit: 'tall' } }));
  assert.match(tall, /data-variant="preview-medium"/);
  assert.match(tall, /data-variant="preview-tall"/);
  assert.doesNotMatch(tall, /data-variant="preview"/);
});

test('a tile map preview draws every tile with its code, sized to fit, and no focus stops', () => {
  const html = preview('rejection-by-state');
  assertCompact(html, 'rejection-by-state', 'Mail ballots rejected, by state, 2024');
  assert.match(html, /class="sv-tile-map__fit"/);
  assert.equal(html.match(/class="sv-tile-map__tile/g)?.length, 51);
  assert.doesNotMatch(html, /tabindex|sv-tile-map__value/);
  assert.match(html, /sv-map-legend/);
  assert.match(html, /Every value is in the table on the full figure\./);
});

test('a geo map preview draws every region and its inset, with no focus stops', () => {
  const html = preview('postal-voting');
  assertCompact(html, 'postal-voting', 'Who may vote by post from inside the country, 2025');
  assert.match(html, /sv-geo-map__inset/);
  assert.match(html, /preserveAspectRatio="xMidYMid meet"/);
  assert.doesNotMatch(html, /tabindex/);
});

test('a timeline preview lists every event on one line, and past twelve marks each on an axis', () => {
  const html = preview('court-record');
  assertCompact(html, 'court-record', 'Court findings, convictions and designations, 1984–2026');
  assert.equal(html.match(/class="sv-timeline__line"/g)?.length, 5);
  assert.match(html, /Iran designated a state sponsor of terrorism/);
  // A decade is shown as written, not as a machine-readable date.
  assert.match(html, /<span>1980s<\/span>/);
  assert.doesNotMatch(html, /sv-control__status|sv-timeline__controls/);
  const long = preview('court-record', variant('court-record', f => (f.kind === 'timeline'
    ? { ...f, events: Array.from({ length: 15 }, (_, i) => ({ date: `${2000 + i}-06`, title: `Event ${i}`, category: 'charge', sources: [8] })) }
    : f)));
  assert.equal(long.match(/class="sv-timeline__lane-mark"/g)?.length, 15);
  assert.match(long, /Jun 2014: Event 14/);
});

test('a period timeline preview draws every period and event marker, but no event list or open-end key', () => {
  const html = preview('war-periods');
  assertCompact(html, 'war-periods', 'Ceasefire, blockade, memorandum and strike-pause periods, 2026');
  assert.equal(html.match(/class="sv-periods__bar"/g)?.length, 5);
  assert.match(html, /<span class="sv-event-strip__marker"[^>]*role="img"/);
  assert.doesNotMatch(html, /sv-event-strip__key|sv-periods__open-key|<a class="sv-event-strip__marker"/);
});

test('a key figures preview keeps every number, its label and period, but not its source mark', () => {
  const html = preview('audit-recheck');
  assertCompact(html, 'audit-recheck', 'How the State Auditor checked counties&#x27; signature decisions, 2020');
  assert.equal(html.match(/class="sv-key-figures__item"/g)?.length, 2);
  assert.doesNotMatch(html, /sv-key-figures__source/);
});

test('a kind without a preview presentation draws its linked title alone', () => {
  const html = preview('federal-laws');
  assertCompact(html, 'federal-laws', 'Federal voting laws and bills on registration and ID, 1965–2026');
  assert.doesNotMatch(html, /<table|sv-chart__preview/);
});
