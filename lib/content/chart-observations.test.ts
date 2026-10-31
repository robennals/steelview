import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chartObservations } from './chart-observations';
import { renderMarkdown } from './markdown';

test('moves only matching graph observations, preserving evidence IDs and later prose', async () => {
  const html = await renderMarkdown('## Observations {#example--observations-people}\n\n### A spike {#example--spike}\n\nExplanation.\n\n## Subtleties {#example--subtleties}\n\nOther detail.', 'topic');
  const result = chartObservations(html, 'example', ['people']);
  assert.match(result.observations.people, /<details class="sv-observations-group" id="example--observations-people">/);
  assert.match(result.observations.people, /<details id="example--spike"/);
  assert.doesNotMatch(result.bodyHtml, /example--spike/);
  assert.match(result.bodyHtml, /Other detail/);
});

test('method changes have a separate disclosure, stable links and escaped source text', async () => {
  const { methodChanges } = await import('./chart-observations');
  const result = methodChanges('example', 'people', [{ period: '1991', label: 'Method changed', note: 'Coverage <before> & after.' }], 2);
  assert.match(result, /class="sv-method-changes-group"/);
  assert.match(result, /<summary>Method Changes<\/summary>/);
  assert.doesNotMatch(result, /sv-observations-group|sv-observations-count/);
  assert.match(result, /id="example--people-method-1991"/);
  assert.match(result, /Coverage &lt;before&gt; &amp; after/);
  assert.match(result, /href="#source-example-2"/);
  assert.equal(methodChanges('example', 'people', [], 2), '');
});

test('artifact subtleties stay separate from numbered observations', async () => {
  const html = await renderMarkdown('## Subtleties {#example--subtleties-people}\n\n### A qualification {#example--qualification}\n\nWhy.', 'topic');
  const result = chartObservations(html, 'example', ['people']);
  assert.match(result.subtleties.people, /sv-subtleties-group/);
  assert.match(result.subtleties.people, /example--qualification/);
  assert.doesNotMatch(result.subtleties.people, /sv-observation-number/);
  assert.equal(result.observations.people, undefined);
  assert.equal(result.bodyHtml, '');
});

test('a chart\'s More text sits with its Subtleties in a sheet', async () => {
  const html = await renderMarkdown('## More {#example--more-people}\n\nWhat is counted.\n\n### About {#example--about}\n\nMethod.\n\n## Subtleties {#example--subtleties-people}\n\n### A catch {#example--catch}\n\nWhy.', 'topic');
  const { subtleties, bodyHtml } = chartObservations(html, 'example', ['people']);
  assert.match(subtleties.people, /id="example--more-people"><summary>More<\/summary>\s*<p>What is counted/);
  assert.match(subtleties.people, /<section id="example--about"/);
  assert.match(subtleties.people, /id="example--catch"/);
  assert.equal(bodyHtml, '');
});

test('a "not measured since" band gets its own Method Changes entry, citing its own source', async () => {
  const { methodChanges } = await import('./chart-observations');
  const result = methodChanges('uranium', 'stock', [], 2, { from: '2025-06-13', until: '2026-10-29', label: 'Not verified since IAEA access ended', note: 'Inspectors have had no access.', source: 4 });
  assert.match(result, /<summary>Method Changes<\/summary>/);
  assert.match(result, /<details class="sv-observation sv-method-observation" id="uranium--stock-not-measured"><summary>2025-06-13–2026-10-29: Not verified since IAEA access ended<\/summary>/);
  assert.match(result, /Inspectors have had no access\. <a href="#source-uranium-4">\[4\]<\/a>/);
});

test('a section may be an h2 or an h3; an h3 takes its content up to the next h2 or h3', async () => {
  const { bodySections } = await import('./chart-observations');
  const html = await renderMarkdown([
    '## Background {#example--background}', '', 'Why it matters.', '',
    '### The older law {#example--older-law}', '', 'Detail.', '', '#### A footnote heading', '', 'Still the older law.', '',
    '### The newer law {#example--newer-law}', '', 'Other detail.', '',
    '## Later {#example--later}', '', 'After.',
  ].join('\n'), 'topic');
  const { sections, bodyHtml } = bodySections(html, 'example', ['older-law', 'later']);
  assert.match(sections['older-law'], /^<section id="example--older-law" class="sv-evidence-section"><h3>The older law<\/h3>/);
  assert.match(sections['older-law'], /Still the older law/);
  assert.doesNotMatch(sections['older-law'], /newer law|Other detail/);
  assert.match(sections.later, /^<h2 id="example--later">Later<\/h2>/);
  // The h3's parent h2 stays, with its other content.
  assert.match(bodyHtml, /Why it matters[\s\S]*The newer law/);
  assert.doesNotMatch(bodyHtml, /older law|After\./);
});
