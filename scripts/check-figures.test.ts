import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { auditTopic, type AuditItem } from './check-figures';

function fact(id: string, quote: string, body = ''): AuditItem {
  return { kind: 'fact', id, data: { claim: 'A claim', sources: [{ quote }] }, body };
}

test('a figure quoted only in fact B fails in fact A, and passes in fact B', () => {
  const { unmatched } = auditTopic([
    fact('a', 'nothing numeric here', 'Rejections ran at 1.4% of ballots.'),
    fact('b', 'about 1.4% of mail ballots were rejected', 'Rejections ran at 1.4 percent.'),
  ]);
  assert.deepEqual(
    unmatched.map((f) => [f.item, f.figure, f.corpus]),
    [['fact/a', '1.4%', "not in this fact's sources"]]
  );
});

test('a viewpoint is matched against the facts it cites, not the whole topic', () => {
  const items: AuditItem[] = [
    fact('a', 'fees of $50 were charged'),
    fact('b', 'a fee of $125 applied'),
    {
      kind: 'viewpoint',
      id: 'v',
      data: { name: 'V' },
      body: 'Fees of [$50](#fact-a) and $125 are a burden.',
    },
  ];
  const { unmatched } = auditTopic(items);
  assert.deepEqual(
    unmatched.map((f) => [f.item, f.figure, f.corpus]),
    [['viewpoint/v', '$125', 'not in the sources of the fact it cites']]
  );
});

test('a viewpoint can lean on a fact through the legacy citesFacts list', () => {
  const { unmatched } = auditTopic([
    fact('b', 'a fee of $125 applied'),
    { kind: 'viewpoint', id: 'v', data: { name: 'V', citesFacts: ['b'] }, body: 'A $125 fee.' },
  ]);
  assert.deepEqual(unmatched, []);
});

test('an intro that cites no fact has no corpus to lean on', () => {
  const { unmatched } = auditTopic([
    fact('a', 'fees of $50 were charged'),
    { kind: 'topic', id: 't', data: {}, body: 'Fees reach $50.' },
  ]);
  assert.deepEqual(unmatched.map((f) => f.corpus), ['cites no fact whose sources could back it']);
});

test('a principle is still matched topic-wide', () => {
  const { unmatched } = auditTopic([
    fact('a', 'fees of $50 were charged'),
    { kind: 'principle', id: 'p', data: { name: 'P' }, body: 'Even $50 matters.' },
  ]);
  assert.deepEqual(unmatched, []);
});

/** The figure fixture's frontmatter, with its id, as a fact the audit reads. */
function figureFixture(): AuditItem {
  const { data } = matter(readFileSync(path.join(__dirname, '../lib/content/__fixtures__/figure-examples.md'), 'utf8'));
  return { kind: 'fact', id: 'figure-examples', data, body: '' };
}

test('a figure-table cell with an unquoted figure is reported against its figure; a quoted one is not', () => {
  const item = figureFixture();
  const before = auditTopic([item]).unmatched.filter((f) => f.item.includes(' figure '));
  const table = (item.data.figures as Array<{ id?: string; rows?: Array<Record<string, unknown>> }>).find((f) => f.id === 'federal-laws')!;
  table.rows![0].status = 'Passed House with 87.5% of votes';
  const after = auditTopic([item]).unmatched.filter((f) => f.item.includes(' figure '));
  assert.deepEqual(
    after.filter((f) => !before.some((b) => b.item === f.item && b.figure === f.figure)).map((f) => [f.item, f.figure]),
    [['fact/figure-examples figure federal-laws', '87.5%']]
  );

  const quoted = figureFixture();
  const quotedTable = (quoted.data.figures as Array<{ id?: string; rows?: Array<Record<string, unknown>> }>).find((f) => f.id === 'federal-laws')!;
  (quoted.data.sources as Array<{ quote: string }>)[0].quote += ' It passed with 87.5% of votes.';
  quotedTable.rows![0].status = 'Passed House with 87.5% of votes';
  assert.ok(!auditTopic([quoted]).unmatched.some((f) => f.figure === '87.5%'));
});

test('figure values reach the chart-value audit', () => {
  const values = auditTopic([figureFixture()]).values.filter((v) => v.chart === 'figure wa-by-race');
  assert.equal(values.length, 5);
});
