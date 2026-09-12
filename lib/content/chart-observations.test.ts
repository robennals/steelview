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
