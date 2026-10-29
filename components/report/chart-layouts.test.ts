import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OPEN_TAIL, crossesNull, estimateScale, whiskerSpan } from './estimate-layout';
import { BarChart } from './bar-chart';
import { EstimateRange } from './estimate-range';
import { layoutPanels } from './small-multiples-layout';

test('forest plot axis always includes the no-effect value', () => {
  const scale = estimateScale([{ estimate: 0.5, low: 0.2, high: 0.8 }]);
  assert.equal(scale.ticks[0], 0);
  assert.equal(scale.zero, 0);
  assert.equal(crossesNull({ low: 0.2, high: 0.8 }), false);
  assert.equal(crossesNull({ low: -0.1, high: 0.8 }), true);
});

test('a fixed forest-plot domain clamps positions to the track', () => {
  const scale = estimateScale([{ estimate: 0, low: -2, high: 2 }], 0, [-1, 1]);
  assert.equal(scale.x(-2), 0);
  assert.equal(scale.x(2), 100);
  assert.equal(scale.zero, 50);
});

test('small multiples share one y-scale unless asked not to', () => {
  const panels = [
    { name: 'big', points: [{ period: '2021', value: 100 }, { period: '2022', value: 200 }] },
    { name: 'small', points: [{ period: '2021', value: 10 }, { period: '2022', value: 20 }] },
  ];
  const shared = layoutPanels(panels);
  assert.deepEqual(shared.panels[0].ticks, shared.panels[1].ticks);
  // The small panel's latest point sits low on the shared scale.
  assert.ok(shared.panels[1].last!.y > 80);
  const independent = layoutPanels(panels, { independentScales: true });
  assert.notDeepEqual(independent.panels[0].ticks, independent.panels[1].ticks);
  assert.equal(independent.panels[1].last!.y, 0);
  assert.deepEqual(shared.periods, ['2021', '2022']);
});

test('a lone bound is drawn as a short open tail from it, never as a measured run to the axis edge', () => {
  const scale = estimateScale([{ low: 0, high: 100 }], null, [0, 100]);
  assert.deepEqual(whiskerSpan({ low: 25 }, scale), { left: 25, right: 25 + OPEN_TAIL, start: undefined, end: 'open' });
  assert.deepEqual(whiskerSpan({ high: 35 }, scale), { left: 35 - OPEN_TAIL, right: 35, start: 'open', end: undefined });
  // Near the edge the tail stops at the axis.
  assert.deepEqual(whiskerSpan({ high: 2 }, scale), { left: 0, right: 2, start: 'open', end: undefined });
  assert.deepEqual(whiskerSpan({ low: 25, high: 35 }, scale), { left: 25, right: 35, start: undefined, end: undefined });
  assert.equal(whiskerSpan({ estimate: 38 }, scale), undefined);
  // With a central estimate, the tail runs on past the dot.
  assert.deepEqual(whiskerSpan({ estimate: 31, high: 35 }, scale), { left: 31 - OPEN_TAIL / 2, right: 35, start: 'open', end: undefined });
});

test('without a fixed domain, the axis leaves a lone bound room for its tail, but never crosses zero for it', () => {
  // "At least 30" is the largest value: the axis runs on past it.
  const scale = estimateScale([{ estimate: 0.25 }, { low: 3, high: 6 }, { low: 30 }], null);
  assert.ok(scale.x(30) <= 100 - OPEN_TAIL, `30 sits at ${scale.x(30)}%`);
  // "Less than 0.25" near zero does not drag the axis negative.
  assert.equal(scale.ticks[0], 0);
  assert.equal(estimateScale([{ high: 0.25 }, { estimate: 24 }], null).ticks[0], 0);
});

test('an interval beyond a fixed axis is clipped at it, and the clipped end says so', () => {
  const scale = estimateScale([{ low: -2, high: 2 }], 0, [-1, 1]);
  assert.deepEqual(whiskerSpan({ low: -2, high: 0.5 }, scale), { left: 0, right: 75, start: 'clipped', end: undefined });
  assert.deepEqual(whiskerSpan({ low: 0, high: 2 }, scale), { left: 50, right: 100, start: undefined, end: 'clipped' });
  assert.equal(scale.beyond(2), 'end');
  assert.equal(scale.beyond(-2), 'start');
  assert.equal(scale.beyond(0.5), undefined);
});

test('a lone bound says whether it includes no effect only when the bound itself settles it', () => {
  assert.equal(crossesNull({ low: 1 }), false);
  assert.equal(crossesNull({ high: -1 }), false);
  // The other end was not published, so whether it reaches zero is unknown.
  assert.equal(crossesNull({ low: -1 }), undefined);
  assert.equal(crossesNull({ estimate: 0.1, high: 0.3 }), undefined);
  assert.equal(crossesNull({ estimate: 3 }), undefined);
  assert.equal(crossesNull({ low: -1, high: 1 }, null), undefined);
});

test('a null no-effect value adds nothing to the axis and draws no reference', () => {
  const scale = estimateScale([{ low: 25, high: 35 }, { estimate: 43.6 }], null);
  assert.ok(scale.ticks[0] > 0, `axis starts at ${scale.ticks[0]}`);
  assert.equal(scale.zero, undefined);
  assert.equal(estimateScale([{ estimate: 40, low: 34, high: 42 }]).ticks[0], 0);
});

test('estimates read "at least", "at most" and range only, with sources and published wording', () => {
  const html = renderToStaticMarkup(createElement(EstimateRange, {
    valueLabel: 'Cost, US$ billion',
    format: { unit: 'number', decimals: 1 },
    nullValue: null,
    estimates: [
      { label: 'AEI', low: 25, high: 35, sources: [{ label: 'AEI', href: '#source-x-14', number: 14 }] },
      { label: 'Floor', low: 30 },
      { label: 'Ceiling', high: 50 },
      { label: 'CBO', estimate: 38, asPublished: '$38 billion' },
    ],
  }));
  assert.match(html, /25 to 35/);
  assert.match(html, /at least 30/);
  assert.match(html, /at most 50/);
  assert.match(html, /Range only/);
  assert.match(html, /<a href="#source-x-14">AEI \[14\]<\/a>/);
  assert.match(html, /<td>\$38 billion<\/td>/);
  assert.doesNotMatch(html, /Includes/);
  assert.doesNotMatch(html, /sv-estimates__null/);
  assert.doesNotMatch(html, /\+25/);
  // Only CBO gives a central estimate, so one dot.
  assert.equal(html.match(/class="sv-estimates__dot"/g)?.length, 1);
});

test('with a no-effect value, values are signed and the includes column stays', () => {
  const html = renderToStaticMarkup(createElement(EstimateRange, {
    valueLabel: 'Effect',
    estimates: [{ label: 'Study', estimate: 0.5, low: 0.2, high: 0.8 }],
  }));
  assert.match(html, /\+0\.5/);
  assert.match(html, /Includes no effect\?/);
  assert.match(html, /sv-estimates__null/);
});

test('a qualified central estimate is placed at its number and read with its word', () => {
  const html = renderToStaticMarkup(createElement(EstimateRange, {
    valueLabel: 'Cost, US$ billion',
    nullValue: null,
    format: { unit: 'number', decimals: 0 },
    estimates: [{ label: 'CBO', estimate: { value: 38, qualifier: 'about', asPublished: 'about $38 billion' } }, { label: 'DoD', estimate: 43 }],
  }));
  assert.match(html, />about 38</);
  assert.match(html, /<td>about \$38 billion<\/td>/);
  assert.equal(html.match(/sv-estimates__dot/g)?.length, 2);
});

test('a qualified bar carries its mark, prints its words, and the key names only the marks drawn', () => {
  const html = renderToStaticMarkup(createElement(BarChart, {
    valueLabel: 'Deaths',
    items: [
      { label: 'North', value: { value: 159, qualifier: 'at least', asPublished: 'At least 159' } },
      { label: 'East', value: { low: 60, high: 80 } },
      { label: 'Capital', value: 120 },
    ],
  }));
  assert.match(html, /<span class="sv-bars__value">at least 159<\/span>/);
  assert.match(html, /<span class="sv-bars__value">60–80<\/span>/);
  assert.match(html, /class="sv-bars__bar" data-qualification="lower-bound"/);
  assert.match(html, /class="sv-bars__bar" data-qualification="range"[^>]*><\/span><span class="sv-bars__whisker"/);
  assert.match(html, /At least this value: the source gives a lower bound/);
  assert.match(html, /A range: the source gives a low and a high/);
  assert.doesNotMatch(html, /Approximate:/);
  // The table view reads the source's words.
  assert.match(html, /<td>At least 159<\/td>/);
  // Largest first by the number given, a range by its midpoint.
  assert.ok(html.indexOf('North') < html.indexOf('Capital') && html.indexOf('Capital') < html.indexOf('East'));
});

test('an upper bound alone is not reported as including no effect, and is drawn dashed and open', () => {
  const html = renderToStaticMarkup(createElement(EstimateRange, {
    valueLabel: 'Effect',
    estimates: [
      { label: 'Texas at 65', estimate: 0.02, high: 0.26 },
      { label: 'Universal mail', low: 2.1, high: 2.2 },
    ],
  }));
  const rows = [...html.matchAll(/<tr><th scope="row">([^<]*)[\s\S]*?<\/tr>/g)].map(m => m[0]);
  assert.match(rows[0], /<td class="sv-data__td-text">—<\/td>/);
  assert.match(rows[1], /<td class="sv-data__td-text">No<\/td>/);
  assert.match(html, /class="sv-estimates__whisker" data-start="open"/);
  assert.doesNotMatch(html, /interval includes no effect/);
  assert.match(html, /Dashed: only this bound was published/);
});

test('the graph reads in the source’s own words where given, and the item column is configurable', () => {
  const props = {
    valueLabel: 'Months',
    nullValue: null,
    estimates: [{ label: 'DIA', high: 0.25, asPublished: 'probably less than one week' }, { label: 'Pentagon', estimate: 24 }],
  };
  const html = renderToStaticMarkup(createElement(EstimateRange, props));
  assert.match(html, /<span class="sv-estimates__value">probably less than one week<\/span>/);
  assert.match(html, /<th scope="col" class="sv-data__th-text">Estimate<\/th>/);
  assert.doesNotMatch(html, />Study</);
  assert.match(renderToStaticMarkup(createElement(EstimateRange, { ...props, itemLabel: 'Study' })), /<th scope="col" class="sv-data__th-text">Study<\/th>/);
});

test('a central estimate beyond a fixed axis sits at the edge with an arrow', () => {
  const html = renderToStaticMarkup(createElement(EstimateRange, {
    valueLabel: 'Effect',
    domain: [-1, 1],
    estimates: [{ label: 'Outlier', estimate: 3, low: 0.5, high: 5 }, { label: 'Inside', estimate: 0.2 }],
  }));
  assert.match(html, /class="sv-estimates__dot" data-beyond="end" style="left:100%"/);
  assert.match(html, /class="sv-estimates__whisker" data-end="clipped"/);
  assert.match(html, /Arrow: continues beyond the axis/);
});
