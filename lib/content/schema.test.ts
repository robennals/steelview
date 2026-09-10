import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  factFrontmatterSchema,
  viewpointFrontmatterSchema,
  principleFrontmatterSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
} from './schema';

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
  });
  assert.equal(parsed.lastUpdated, '2026-08-18');
});

test('a viewpoint defaults all four reference lists to empty arrays', () => {
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

test('a principle requires at least one holder', () => {
  assert.equal(principleFrontmatterSchema.safeParse({ name: 'Fairness', heldBy: [] }).success, false);
  assert.equal(principleFrontmatterSchema.safeParse({ name: 'Fairness', heldBy: ['one'] }).success, true);
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
  const base = { title: 'Immigration', subtitle: 'What is actually being argued about.' };
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, lastUpdated: '2026-08-18' }).success, true);
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, lastUpdated: 'August 2026' }).success, false);
});
