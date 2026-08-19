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

test('a viewpoint defaults all four reference lists to empty arrays', () => {
  const parsed = viewpointFrontmatterSchema.parse({ name: 'Control first', summary: 'One line.' });
  assert.deepEqual(parsed.citesFacts, []);
  assert.deepEqual(parsed.acknowledges, []);
  assert.deepEqual(parsed.setsAside, []);
  assert.deepEqual(parsed.principles, []);
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
