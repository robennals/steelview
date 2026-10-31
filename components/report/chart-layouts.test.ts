import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OPEN_TAIL, crossesNull, estimateScale, whiskerSpan } from './estimate-layout';
import { BarChart } from './bar-chart';
import { EstimateRange } from './estimate-range';
import { PairedBarChart } from './paired-bar-chart';
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
  assert.match(html, /<span class="sv-estimates__value">at most 0\.25<\/span>/);
  assert.match(html, /<dt>As published<\/dt><dd>probably less than one week<\/dd>/);
  assert.match(html, /<th scope="col" class="sv-data__th-text">Estimate<\/th>/);
  assert.doesNotMatch(html, />Study</);
  assert.match(renderToStaticMarkup(createElement(EstimateRange, { ...props, itemLabel: 'Study' })), /<th scope="col" class="sv-data__th-text">Study<\/th>/);
});

test('an estimate row prints one name and one figure; everything else opens under it', () => {
  const html = renderToStaticMarkup(createElement(EstimateRange, {
    valueLabel: 'Effect',
    format: { unit: 'number', decimals: 1, fixed: true },
    estimates: [
      { label: 'Panel', year: '2008–2018', estimate: -0.1, low: -2.3, high: 2.1, note: 'All states.', asPublished: 'about zero', sources: [{ label: 'NBER', href: '#source-x-27', number: 27 }] },
      { label: 'GAO', low: -2.2, high: -1.9, sources: [{ label: 'GAO', href: '#source-x-28', number: 28 }] },
      { label: 'Bare', estimate: 1 },
    ],
  }));
  const [, summary] = html.match(/<summary[^>]*>(.*?)<\/summary>/) ?? [];
  assert.match(summary, /<span class="sv-estimates__label">Panel<\/span><span class="sv-estimates__value">−0\.1<span/);
  assert.doesNotMatch(summary, /<a |2008|All states|about zero/);
  assert.match(html, /<dt>Year<\/dt><dd>2008–2018<\/dd><dt>Interval<\/dt><dd>−2\.3 to \+2\.1<\/dd><dt>As published<\/dt><dd>about zero<\/dd><dt>Note<\/dt><dd>All states\.<\/dd><dt>Source<\/dt><dd>.*?NBER \[27\]/);
  // Range only: the range is the row's figure, so the disclosure does not repeat it.
  assert.match(html, /<span class="sv-estimates__value">−2\.2 to −1\.9<span/);
  assert.equal(html.match(/<dt>Interval<\/dt>/g)?.length, 1);
  // A row with nothing to open stays a plain row, and the hint is said once.
  assert.match(html, /<li class="sv-estimates__row" data-row="Bare"><span class="sv-estimates__label">Bare/);
  assert.equal(html.match(/sv-row-detail__hint/g)?.length, 1);
  // The table keeps the note, so nothing is only behind a disclosure.
  assert.match(html, /<th scope="col" class="sv-data__th-text">Note<\/th>/);
  assert.match(html, /<td class="sv-data__td-text sv-data__td-long">All states\.<\/td>/);
});

test('no estimate shows a disclosure or a hint in a preview', () => {
  const html = renderToStaticMarkup(createElement(EstimateRange, { valueLabel: 'Effect', preview: { href: '#x' }, estimates: [{ label: 'A', estimate: 1, note: 'Note words', year: 2020 }, { label: 'B', estimate: 2 }] }));
  assert.doesNotMatch(html, /<details|sv-row-detail|Note words|2020/);
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

const hours = {
  valueLabel: 'Hours',
  series: [{ key: 'a', label: '2020' }, { key: 'b', label: '2024' }],
  items: [
    { label: 'Arizona', values: { a: 73, b: 147 } },
    { label: 'Georgia', values: { a: { value: 18, qualifier: 'at least' as const }, b: null } },
  ],
};

test('a bar row with detail opens under itself, and its neighbours stay plain rows', () => {
  const props = { valueLabel: 'Share', items: [{ label: 'Greater Manchester', value: 54, highlight: true, detail: '243 suspects; none unrecorded' }, { label: 'West Yorkshire', value: 35 }] };
  const html = renderToStaticMarkup(createElement(BarChart, props));
  assert.match(html, /<li data-row="Greater Manchester"><details class="sv-row-detail"><summary class="sv-bars__row" data-highlight="true"><span class="sv-bars__label">Greater Manchester<\/span>/);
  assert.match(html, /<div class="sv-row-detail__body">243 suspects; none unrecorded<\/div>/);
  assert.match(html, /<li class="sv-bars__row" data-row="West Yorkshire"><span class="sv-bars__label">West Yorkshire/);
  assert.equal(html.match(/Select a row for its details/g)?.length, 1);
});

test('the table prints every row\'s detail, and a chart with none has no Detail column or hint', () => {
  const items = [{ label: 'A', value: 1, detail: 'A words' }, { label: 'B', value: 2 }];
  const table = renderToStaticMarkup(createElement(BarChart, { valueLabel: 'Share', items })).split('<noscript>')[1];
  assert.match(table, /<th scope="col" class="sv-data__th-text">Detail<\/th>/);
  assert.match(table, /<td class="sv-data__td-text sv-data__td-long">A words<\/td>/);
  assert.match(table, /<td class="sv-data__td-text sv-data__td-long">—<\/td>/);
  const bare = renderToStaticMarkup(createElement(BarChart, { valueLabel: 'Share', items: [{ label: 'A', value: 1 }] }));
  assert.doesNotMatch(bare, /Detail|<details class="sv-row-detail|sv-row-detail__hint/);
});

test('a bar preview shows only the title of a row with detail', () => {
  const html = renderToStaticMarkup(createElement(BarChart, { valueLabel: 'Share', preview: { href: '#x' }, items: [{ label: 'A', value: 1, detail: 'A words' }, { label: 'B', value: 2 }] }));
  assert.match(html, /<li class="sv-bars__row" data-row="A"><span class="sv-bars__label">A<\/span>/);
  assert.doesNotMatch(html, /<details|sv-row-detail|A words/);
});

test('a paired row carries its detail to the row and the table', () => {
  const html = renderToStaticMarkup(createElement(PairedBarChart, {
    valueLabel: 'Share',
    series: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    items: [{ label: 'Row', values: { a: 1, b: 2 }, detail: 'Row words' }, { label: 'Other', values: { a: 3, b: 4 } }],
  }));
  assert.match(html, /<summary class="sv-bars__row"><span class="sv-bars__label">Row<\/span>/);
  assert.match(html.split('<noscript>')[1], /<td class="sv-data__td-text sv-data__td-long">Row words<\/td>/);
});

test('paired bars draw one bar per measure from zero, each marked by its series slot, never stacked', () => {
  const html = renderToStaticMarkup(createElement(PairedBarChart, hours));
  assert.match(html, /data-layout="grouped"/);
  assert.equal(html.match(/class="sv-bars__bar"[^>]*data-slot="2"/g)?.length, 1, 'Georgia has no 2024 bar');
  assert.match(html, /class="sv-bars__bar" data-qualification="lower-bound" data-slot="1" style="left:0%;width:/);
  // Each figure on its own line, named for a screen reader; the missing one reads "—".
  assert.match(html, /<span class="sv-visually-hidden">2020: <\/span>73<\/span>/);
  assert.match(html, /<span class="sv-visually-hidden">2024: <\/span>—<\/span>/);
  assert.match(html, /<span class="sv-visually-hidden">2020: <\/span>at least 18<\/span>/);
});

test('the paired table has one column per measure', () => {
  const html = renderToStaticMarkup(createElement(PairedBarChart, hours));
  assert.match(html, /<th scope="col" class="sv-data__th-text">Category<\/th><th scope="col">2020<\/th><th scope="col">2024<\/th>/);
  assert.match(html, /<th scope="row">Georgia<\/th><td>at least 18<\/td><td>—<\/td>/);
});

test('a dumbbell joins two dots, labels each end, and keeps the order given unless asked to rank', () => {
  const html = renderToStaticMarkup(createElement(PairedBarChart, {
    ...hours,
    style: 'dumbbell',
    format: { unit: 'number', decimals: 1 },
    items: [
      { label: 'Mississippi', values: { a: 4.4, b: 6.4 }, labels: { a: '1954', b: '1964' } },
      { label: 'Alabama', values: { a: 14.2, b: 19.4 }, labels: { a: '1958', b: '1964' } },
    ],
  }));
  assert.equal(html.match(/class="sv-bars__link"/g)?.length, 2);
  assert.equal(html.match(/class="sv-bars__dot" data-slot/g)?.length, 4);
  assert.match(html, /<span class="sv-bars__value-label">1954 <\/span>4.4/);
  assert.match(html, /<td>4.4 \(1954\)<\/td>/);
  assert.ok(html.indexOf('Mississippi') < html.indexOf('Alabama'));
});

test('a range in a dumbbell is a capsule from low to high, not a dot at its midpoint', () => {
  const html = renderToStaticMarkup(createElement(PairedBarChart, {
    ...hours,
    style: 'dumbbell',
    domainMax: 100,
    items: [{ label: 'X', values: { a: { low: 20, high: 40 }, b: 60 } }, { label: 'Y', values: { a: 10, b: 30 } }],
  }));
  assert.match(html, /class="sv-bars__dot" data-slot="1" data-qualification="range" style="left:20%;width:20%/);
  assert.match(html, /class="sv-bars__link" style="left:20%;width:40%"/);
});
