import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  factFrontmatterSchema,
  viewpointFrontmatterSchema,
  principleFrontmatterSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
  seriesLineSchema,
} from './schema';
import { figureExamplesFrontmatter } from './__fixtures__/figure-examples';

const source = {
  stance: 'supports',
  quote: 'Long-term net migration was estimated at 728,000.',
  title: 'Long-term international migration estimates',
  url: 'https://www.ons.gov.uk/example',
  publisher: 'Office for National Statistics',
  date: '2024-11',
};

test('a fact parses and defaults sources to an empty array', () => {
  const parsed = factFrontmatterSchema.parse({ claim: 'A claim', status: 'unknown' });
  assert.deepEqual(parsed.sources, []);
});

test('a fact accepts sources', () => {
  const parsed = factFrontmatterSchema.parse({ claim: 'A claim', status: 'well-supported', sources: [source] });
  assert.equal(parsed.sources[0].publisher, 'Office for National Statistics');
});

test('an unknown fact status is rejected', () => {
  const result = factFrontmatterSchema.safeParse({ claim: 'A claim', status: 'mostly-true' });
  assert.equal(result.success, false);
});

test('a source url must be http or https', () => {
  const result = factFrontmatterSchema.safeParse({
    claim: 'A claim',
    status: 'well-supported',
    sources: [{ ...source, url: 'ons.gov.uk/example' }],
  });
  assert.equal(result.success, false);
});

test('a source date accepts YYYY, YYYY-MM and YYYY-MM-DD but not prose', () => {
  for (const date of ['2024', '2024-11', '2024-11-28']) {
    assert.equal(
      factFrontmatterSchema.safeParse({ claim: 'c', status: 'well-supported', sources: [{ ...source, date }] }).success,
      true,
      date
    );
  }
  assert.equal(
    factFrontmatterSchema.safeParse({ claim: 'c', status: 'well-supported', sources: [{ ...source, date: 'Nov 2024' }] })
      .success,
    false
  );
});

test('a source date given as a JS Date (YAML-coerced) normalizes to YYYY-MM-DD', () => {
  const parsed = factFrontmatterSchema.parse({
    claim: 'c',
    status: 'well-supported',
    sources: [{ ...source, date: new Date('2024-11-28T00:00:00.000Z') }],
  });
  assert.equal(parsed.sources[0].date, '2024-11-28');
});

test('a source date given as the number 2024 (YAML-coerced) normalizes to "2024"', () => {
  const parsed = factFrontmatterSchema.parse({
    claim: 'c',
    status: 'well-supported',
    sources: [{ ...source, date: 2024 }],
  });
  assert.equal(parsed.sources[0].date, '2024');
});

test('a date regex checks month and day ranges, not just digit positions', () => {
  for (const date of ['2024-13-01', '2024-00-01', '2024-01-32', '2024-01-00', '2024-13']) {
    assert.equal(
      factFrontmatterSchema.safeParse({ claim: 'c', status: 'well-supported', sources: [{ ...source, date }] })
        .success,
      false,
      date
    );
  }
});

test('lastUpdated also checks month and day ranges, not just digit positions', () => {
  const base = { title: 'Immigration', subtitle: 'What is actually being argued about.' };
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, lastUpdated: '2026-13-45' }).success, false);
});

test('a genuinely malformed date is still rejected after normalization', () => {
  const result = factFrontmatterSchema.safeParse({
    claim: 'c',
    status: 'well-supported',
    sources: [{ ...source, date: 'Nov 2024' }],
  });
  assert.equal(result.success, false);
});

test('lastUpdated given as a JS Date (YAML-coerced) normalizes to YYYY-MM-DD', () => {
  const parsed = topicFrontmatterSchema.parse({
    title: 'Immigration',
    subtitle: 'What is actually being argued about.',
    lastUpdated: new Date('2026-08-18T00:00:00.000Z'),
    tags: ['UK'],
    previewCharts: [{ fact: 'a', chart: 'series' }],
  });
  assert.equal(parsed.lastUpdated, '2026-08-18');
});

test.skip('a viewpoint defaults all four reference lists to empty arrays', () => {
  const parsed = viewpointFrontmatterSchema.parse({
    name: 'Control first',
    summary: 'One line.',
    order: 1,
  });
  assert.deepEqual(parsed.citesFacts, []);
  assert.deepEqual(parsed.acknowledges, []);
  assert.deepEqual(parsed.setsAside, []);
  assert.deepEqual(parsed.principles, []);
});

test('a viewpoint without an explicit order is rejected', () => {
  // Sorting viewpoints by id let a retitle silently reorder the sides; the
  // position each viewpoint holds in the section is now an editorial choice
  // that has to be written down.
  const parsed = viewpointFrontmatterSchema.safeParse({ name: 'Control first', summary: 'One line.' });
  assert.equal(parsed.success, false);
});

test('a fact may not carry an order — the field was removed, not renamed', () => {
  const parsed = factFrontmatterSchema.parse({
    claim: 'A claim',
    status: 'well-supported',
    order: 1,
    sources: [],
  });
  assert.equal('order' in parsed, false);
});

test('a fact carries an optional supports pointing at the fact it is evidence for', () => {
  const headline = factFrontmatterSchema.parse({ claim: 'A claim', status: 'well-supported' });
  assert.equal(headline.supports, undefined);
  const supporting = factFrontmatterSchema.parse({
    claim: 'A detail',
    status: 'well-supported',
    supports: 'a-headline-fact',
  });
  assert.equal(supporting.supports, 'a-headline-fact');
});

test('an empty supports is rejected rather than read as "no parent"', () => {
  assert.equal(
    factFrontmatterSchema.safeParse({ claim: 'A claim', status: 'well-supported', supports: '' })
      .success,
    false
  );
});

test('a shared principle has no topic-specific holders', () => {
  assert.equal(principleFrontmatterSchema.safeParse({ name: 'Fairness' }).success, true);
  assert.equal(principleFrontmatterSchema.safeParse({ name: 'Fairness', heldBy: ['one'] }).success, false);
});

test('topic principle references default to empty and reject duplicates or empty IDs', () => {
  const topic = { title: 'Example', subtitle: 's', lastUpdated: '2026-08-18', tags: ['UK'], previewCharts: [{ fact: 'a', chart: 'series' }] };
  assert.deepEqual(topicFrontmatterSchema.parse(topic).principles, []);
  assert.equal(topicFrontmatterSchema.safeParse({ ...topic, principles: ['p', 'p'] }).success, false);
  assert.equal(topicFrontmatterSchema.safeParse({ ...topic, principles: [''] }).success, false);
});

test('a crux requires a known kind, two viewpoints and two positions', () => {
  const valid = {
    question: 'Will integration keep pace?',
    kind: 'prediction',
    divides: ['one', 'two'],
    positions: [
      { viewpoint: 'one', holds: 'It will not.' },
      { viewpoint: 'two', holds: 'It will.' },
    ],
  };
  assert.equal(cruxFrontmatterSchema.safeParse(valid).success, true);
  assert.equal(cruxFrontmatterSchema.safeParse({ ...valid, kind: 'vibes' }).success, false);
  assert.equal(cruxFrontmatterSchema.safeParse({ ...valid, divides: ['one'] }).success, false);
});

test('a topic requires an ISO lastUpdated date', () => {
  const base = { title: 'Immigration', subtitle: 'What is actually being argued about.', tags: ['UK'], previewCharts: [{ fact: 'a', chart: 'series' }] };
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, lastUpdated: '2026-08-18' }).success, true);
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, lastUpdated: 'August 2026' }).success, false);
});

/* ----------------------------------------------------------------- figures */

test('every worked example of the visualization spec parses as a fact', () => {
  const parsed = factFrontmatterSchema.parse(figureExamplesFrontmatter());
  assert.deepEqual(parsed.figures?.map(f => f.kind), [
    'series', 'comparison', 'dataTable', 'section', 'keyFigures', 'timeline', 'periodTimeline', 'tileMap',
    'barChart', 'compositionBar', 'estimateRange', 'quoteComparison', 'pullQuote', 'claimCheck', 'caveatList',
    'tileMap', 'geoMap', 'scatterPlot',
  ]);
});

/** The fixture with figure `index` replaced, parsed; returns the paths of the issues. */
function figureIssuePaths(index: number, change: (figure: Record<string, unknown>) => Record<string, unknown>) {
  const data = figureExamplesFrontmatter();
  const figures = [...(data.figures as Record<string, unknown>[])];
  figures[index] = change(figures[index]);
  const result = factFrontmatterSchema.safeParse({ ...data, figures });
  if (result.success) assert.fail('expected the figure to fail to parse');
  return result.error.issues.map(issue => issue.path.join('.'));
}

test('a figure of unknown kind fails with a path naming the figure', () => {
  assert.deepEqual(figureIssuePaths(4, f => ({ ...f, kind: 'pieChart' })), ['figures.4.kind']);
});

test('a figure id must be lower-case letters, digits and hyphens', () => {
  assert.deepEqual(figureIssuePaths(4, f => ({ ...f, id: 'Audit Recheck' })), ['figures.4.id']);
});

test('a currency is given with unit "currency", and only then', () => {
  assert.ok(figureIssuePaths(8, f => ({ ...f, format: { unit: 'percent', currency: 'USD' } })).every(p => p.startsWith('figures.8.format')));
  assert.ok(figureIssuePaths(8, f => ({ ...f, format: { unit: 'currency' } })).every(p => p.startsWith('figures.8.format')));
});

test('a data table needs at least two columns', () => {
  assert.deepEqual(figureIssuePaths(2, f => ({ ...f, columns: (f.columns as unknown[]).slice(0, 1) })), ['figures.2.columns']);
});

// zod 4 keeps a refined object usable as a discriminated-union option, so
// the tile map's "data and valueLabel" rule lives in the schema.
test('a tile map without data or a value label fails in the schema', () => {
  assert.deepEqual(figureIssuePaths(7, f => ({ ...f, data: undefined })), ['figures.7']);
  assert.deepEqual(figureIssuePaths(7, f => ({ ...f, valueLabel: undefined })), ['figures.7']);
});

/** The index of the fixture's figure with this id. */
function figureIndex(id: string) {
  return (figureExamplesFrontmatter().figures as Array<{ id?: string }>).findIndex(f => f.id === id);
}

test('a map is shaded by a number or by a category, never both', () => {
  const categorical = figureIndex('voter-id-rules');
  assert.deepEqual(figureIssuePaths(categorical, f => ({ ...f, valueLabel: 'Rule' })), [`figures.${categorical}`]);
  assert.deepEqual(figureIssuePaths(categorical, f => ({ ...f, scale: 'diverging' })), [`figures.${categorical}`]);
  const geo = figureIndex('postal-voting');
  assert.deepEqual(figureIssuePaths(geo, f => ({ ...f, data: { US: 1 } })), [`figures.${geo}`]);
});

test('a categorical map needs its label, categories and areas', () => {
  const index = figureIndex('voter-id-rules');
  for (const key of ['categoryLabel', 'areas']) {
    assert.deepEqual(figureIssuePaths(index, f => ({ ...f, [key]: undefined })), [`figures.${index}`], key);
  }
  // Without categories it is neither encoding complete.
  assert.deepEqual(figureIssuePaths(index, f => ({ ...f, categories: undefined })), [`figures.${index}`]);
});

test('a map has two to six categories, each with a one-to-three-character mark', () => {
  const index = figureIndex('voter-id-rules');
  const category = (i: number, mark = `M${i}`) => ({ id: `c${i}`, label: `C${i}`, mark });
  assert.deepEqual(figureIssuePaths(index, f => ({ ...f, categories: [category(1)] })), [`figures.${index}.categories`]);
  assert.deepEqual(figureIssuePaths(index, f => ({ ...f, categories: Array.from({ length: 7 }, (_, i) => category(i)) })), [`figures.${index}.categories`]);
  assert.deepEqual(figureIssuePaths(index, f => ({ ...f, categories: [category(1, 'LONG'), category(2)] })), [`figures.${index}.categories.0.mark`]);
});

test('a geo map names one of the three outline presets', () => {
  const index = figureIndex('postal-voting');
  assert.deepEqual(figureIssuePaths(index, f => ({ ...f, regions: 'us-states' })), [`figures.${index}.regions`]);
});

test('a scatter plot has at least three points, each labelled in one to four characters', () => {
  const index = figureIndex('count-speed');
  assert.deepEqual(figureIssuePaths(index, f => ({ ...f, points: (f.points as unknown[]).slice(0, 2) })), [`figures.${index}.points`]);
  assert.deepEqual(
    figureIssuePaths(index, f => ({ ...f, points: (f.points as Record<string, unknown>[]).map((p, i) => (i === 0 ? { ...p, label: 'ARIZ.' } : p)) })),
    [`figures.${index}.points.0.label`],
  );
});

test('readings and comparisons may name the table their values come from', () => {
  const data = figureExamplesFrontmatter();
  const parsed = factFrontmatterSchema.parse({
    ...data,
    comparisons: (data.comparisons as Record<string, unknown>[]).map(c => ({ ...c, valuesFrom: 'Senate roll call 4' })),
  });
  assert.equal(parsed.comparisons?.[0].valuesFrom, 'Senate roll call 4');
});

test('a topic needs at least one tag, with no repeats, and at least one preview chart', () => {
  const base = { title: 'T', subtitle: 'S', lastUpdated: '2026-08-18' };
  const preview = [{ fact: 'alpha', chart: 'series' }];
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, tags: ['UK'], previewCharts: preview }).success, true);
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, tags: [], previewCharts: preview }).success, false);
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, tags: ['UK', 'UK'], previewCharts: preview }).success, false);
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, tags: ['UK'], previewCharts: [] }).success, false);
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, tags: ['UK'], previewCharts: [{ fact: 'alpha', chart: '' }] }).success, false);
});

test('a series line may name a glossary entry, which must exist', () => {
  const points = [{ period: '2020', value: 1 }, { period: '2021', value: 2 }];
  assert.equal(seriesLineSchema.parse({ name: 'Net migration', glossary: 'net-migration', points }).glossary, 'net-migration');
  const unknown = seriesLineSchema.safeParse({ name: 'Net migration', glossary: 'no-such-term', points });
  assert.equal(unknown.success, false);
  assert.equal(unknown.error?.issues[0].message, 'unknown glossary term "no-such-term"');
});
