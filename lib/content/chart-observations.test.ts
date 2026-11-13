import { test } from 'node:test';
import assert from 'node:assert/strict';

test('a not-measured band has a separate disclosure with escaped source text, and no band has none', async () => {
  const { methodChanges } = await import('./chart-observations');
  const result = methodChanges('example', 'people', { from: '1991', until: '1995', label: 'Stopped', note: 'Coverage <before> & after.', source: 2 });
  assert.match(result, /class="sv-method-changes-group"/);
  assert.doesNotMatch(result, /sv-observations-group|sv-observations-count/);
  assert.match(result, /Coverage &lt;before&gt; &amp; after/);
  assert.match(result, /href="#source-example-2"/);
  assert.equal(methodChanges('example', 'people'), '');
});

test('a "not measured since" band gets its own Method Changes entry, citing its own source', async () => {
  const { methodChanges } = await import('./chart-observations');
  const result = methodChanges('uranium', 'stock', { from: '2025-06-13', until: '2026-10-29', label: 'Not verified since IAEA access ended', note: 'Inspectors have had no access.', source: 4 });
  assert.match(result, /<summary>Method Changes<\/summary>/);
  assert.match(result, /<details class="sv-observation sv-method-observation" id="uranium--stock-not-measured"><summary>2025-06-13–2026-10-29: Not verified since IAEA access ended<\/summary>/);
  assert.match(result, /Inspectors have had no access\. <a href="#source-uranium-4">\[4\]<\/a>/);
});

