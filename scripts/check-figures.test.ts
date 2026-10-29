import { test } from 'node:test';
import assert from 'node:assert/strict';
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
