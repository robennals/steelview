import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PeriodTimeline, type PeriodRow } from './period-timeline';

const render = (props: Partial<Parameters<typeof PeriodTimeline>[0]> & { rows: PeriodRow[] }) =>
  renderToStaticMarkup(createElement(PeriodTimeline, { title: 'Periods', rowLabel: 'State', ...props }));

const stages: PeriodRow[] = [
  { label: 'United States', periods: [{ from: '1939', label: 'Explore' }, { from: '1942', label: 'Pursue' }, { from: '1945', label: 'Acquire' }] },
  { label: 'South Africa', periods: [{ from: '1969', to: '1991', label: 'Explore' }] },
];

test('an open period runs to the axis end and says so, unless the axis ends on the as-of date', () => {
  const stale = render({ rows: stages, from: '1939', to: '2017-06', asOf: '2026-10-29' });
  assert.match(stale, /<td>No end by Jun 2017<\/td>/);
  assert.match(stale, /Arrowhead: no end date by Jun 2017, where the axis ends/);
  assert.doesNotMatch(stale, /still in force|Ongoing/i);
  const current = render({ rows: stages, from: '1939', to: '2026-10-29', asOf: '2026-10-29' });
  assert.match(current, /<td>Still in force<\/td>/);
  assert.match(current, /Arrowhead: no end date — still in force/);
});

test('every bar reads out its row, label and dates on hover or focus', () => {
  const html = render({ rows: stages, from: '1939', to: '2017-06' });
  assert.match(html, /role="img" tabindex="0" aria-label="United States — Explore: 1939 – no end by Jun 2017" data-region="[^"]+" data-readout="United States — Explore: 1939 – no end by Jun 2017"/);
  assert.match(html, /aria-label="South Africa — Explore: 1969 – 1991"/);
  assert.match(html, /Hover over or tab to a bar/);
});

test('a label is inside its bar, beside it, or left to the legend, readout and table — never on a line of its own', () => {
  const html = render({
    rows: [
      { label: 'Fits', periods: [{ from: '2000', to: '2020', label: 'Long enough' }] },
      { label: 'Beside', periods: [{ from: '2000', to: '2001', label: 'Short' }] },
      { label: 'Hemmed in', periods: [{ from: '2000', to: '2001', label: 'Short' }, { from: '2001', to: '2024', label: 'Next' }] },
    ],
    from: 2000,
    to: 2024,
  });
  assert.doesNotMatch(html, /outside-label/);
  assert.equal(html.match(/class="sv-periods__bar-label"/g)?.length, 2);
  assert.equal(html.match(/class="sv-periods__side-label"/g)?.length, 1);
  // The hemmed-in label is not drawn, but its table row and readout name it.
  assert.match(html, /aria-label="Hemmed in — Short: 2000 – 2001"/);
  assert.match(html, /<th scope="row">Hemmed in<\/th><td>Short<\/td>/);
});

test('a span under eighteen months gets month ticks', () => {
  const html = render({ rows: [{ label: 'Ceasefire', periods: [{ from: '2026-04-08', to: '2026-07-07', label: 'Ceasefire' }] }], from: '2026-02-28', to: '2026-10-29' });
  assert.match(html, />Mar 2026<\/span>/);
  assert.match(html, />Jul<\/span>/);
});
