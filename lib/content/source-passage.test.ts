import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliseQuote } from './validate';
import { quotedPhrases, sourcePassages } from './source-passage';
import type { Source } from './types';

const source = (quote: string): Source => ({ stance: 'supports', quote, title: 't', url: 'https://example.org', publisher: 'CRS', date: '2026' });
const credit = (n: number) => ({ label: 'CRS', number: n });
const shown = (passages: ReturnType<typeof sourcePassages>) =>
  passages.map(p => p.parts.map(part => (part.quoted ? `[${part.text}]` : part.text)).join(''));

const CRS = source(
  'Grossi told the Board of Governors in a statement on 4 March that the agency had no access. … Iran’s Foreign Minister stated on March 15, 2026, that the country’s enriched uranium is “under the rubble” created by the June 2025 attacks. Iran has “no plan” to recover this material, he added. In 2026, U.S. and Iranian officials have said that Iran has not resumed enriching uranium.',
);

test('a few quoted words are shown in whole sentences around them, at least 200 characters, marked, ignoring case and curly quotes', () => {
  assert.deepEqual(shown(sourcePassages(['Under the RUBBLE'], [1], [CRS], credit)), [
    'Iran’s Foreign Minister stated on March 15, 2026, that the country’s enriched uranium is “[under the rubble]” created by the June 2025 attacks. Iran has “no plan” to recover this material, he added. In 2026, U.S. and Iranian officials have said that Iran has not resumed enriching uranium.',
  ]);
});

test('a passage stays inside the run between omission marks in the source', () => {
  const [passage] = shown(sourcePassages(['the agency had no access'], [1], [CRS], credit));
  assert.equal(passage, 'Grossi told the Board of Governors in a statement on 4 March that [the agency had no access].');
});

test('fragments of a quote either side of "…" are each marked in one passage', () => {
  assert.deepEqual(shown(sourcePassages(['the country’s enriched … created by the June'], [1], [CRS], credit)), [
    'Iran’s Foreign Minister stated on March 15, 2026, that [the country’s enriched] uranium is “under the rubble” [created by the June] 2025 attacks. Iran has “no plan” to recover this material, he added. In 2026, U.S. and Iranian officials have said that Iran has not resumed enriching uranium.',
  ]);
});

test('a passage starting mid-sentence opens with "…"', () => {
  const s = source('said that it would “keep going” for as long as it took, the minister added.');
  assert.deepEqual(shown(sourcePassages(['keep going'], [1], [s], credit)), ['…said that it would “[keep going]” for as long as it took, the minister added.']);
});

test('a quote with nothing but a word or two around it in its run reaches across the source\'s omission mark for context', () => {
  const s = source('The site was hit hard and nothing can be recovered from it now. … So it is buried and we are watching it.');
  assert.deepEqual(shown(sourcePassages(['it is buried and we are watching it'], [1], [s], credit)), [
    'The site was hit hard and nothing can be recovered from it now. … So [it is buried and we are watching it].',
  ]);
});

test('a quote that is its source\'s whole quote, or that no cited source holds, gets none', () => {
  const s = source('It is buried and we are watching it.');
  assert.deepEqual(sourcePassages(['it is buried and we are watching it'], [1], [s], credit), []);
  assert.deepEqual(sourcePassages(['not in the source at all'], [1], [CRS], credit), []);
});

test('the first cited source that holds the words supplies the passage, credited by its number', () => {
  const other = source('Nothing relevant is said in this source about the matter at hand, at any length at all.');
  const [passage] = sourcePassages(['under the rubble'], [1, 2], [other, CRS], credit);
  assert.deepEqual(passage.source, { label: 'CRS', number: 2 });
});

test('two phrases in the same stretch of a source are one passage', () => {
  const passages = sourcePassages(['under the rubble', 'no plan'], [1], [CRS], credit);
  assert.equal(passages.length, 1);
  assert.equal(passages[0].parts.filter(p => p.quoted).length, 2);
});

test('a sentence longer than a passage is cut around the quoted words', () => {
  const long = source(`The report begins ${'with a great many words '.repeat(30)}and says it is "plainly wrong" before ${'going on at length '.repeat(30)}to the end.`);
  const [passage] = shown(sourcePassages(['plainly wrong'], [1], [long], credit));
  assert.ok(passage.startsWith('…') && passage.endsWith('…'), passage);
  assert.ok(passage.length < 600, String(passage.length));
  assert.ok(passage.includes('"[plainly wrong]"'));
});

test('quoted phrases are the words between double quotation marks, straight or curly', () => {
  assert.deepEqual(quotedPhrases('Letter: hostilities "have terminated"', 'the “60-day cut-off”, it said', undefined), ['have terminated', '60-day cut-off']);
});

test('the verbatim check compares text as before', () => {
  assert.equal(normaliseQuote('  It’s  “Under”\n the Rubble '), 'it\'s "under" the rubble');
});
