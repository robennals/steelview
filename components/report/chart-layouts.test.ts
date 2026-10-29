import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { crossesNull, estimateScale, whiskerSpan } from './estimate-layout';
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

test('a lone low runs to the axis end, a lone high from its start, each open at that end', () => {
  const x = (v: number) => v;
  assert.deepEqual(whiskerSpan({ low: 25 }, x), { left: 25, right: 100, openStart: false, openEnd: true });
  assert.deepEqual(whiskerSpan({ high: 35 }, x), { left: 0, right: 35, openStart: true, openEnd: false });
  assert.deepEqual(whiskerSpan({ low: 25, high: 35 }, x), { left: 25, right: 35, openStart: false, openEnd: false });
  assert.equal(whiskerSpan({ estimate: 38 }, x), undefined);
});

test('an open bound counts as running on for whether it includes no effect', () => {
  assert.equal(crossesNull({ low: -1 }), true);
  assert.equal(crossesNull({ low: 1 }), false);
  assert.equal(crossesNull({ high: -1 }), false);
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
      { label: 'AEI', low: 25, high: 35, source: { label: 'AEI', href: '#source-x-14', number: 14 } },
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
