import { test } from 'node:test';
import assert from 'node:assert/strict';
import { citedFactIds, renderMarkdown } from './markdown';

test('renders paragraphs', async () => {
  assert.equal(await renderMarkdown('Hello there.'), '<p>Hello there.</p>');
});

test('renders emphasis and links', async () => {
  const html = await renderMarkdown('An *emphasised* [link](https://example.org).');
  assert.match(html, /<em>emphasised<\/em>/);
  assert.match(html, /<a href="https:\/\/example\.org">link<\/a>/);
});

test('renders GFM tables', async () => {
  const html = await renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |');
  assert.match(html, /<table>/);
});

test('empty input renders an empty string', async () => {
  assert.equal(await renderMarkdown(''), '');
  assert.equal(await renderMarkdown('   \n  '), '');
});

test('raw HTML in content is escaped to visible text, not executed or dropped', async () => {
  const html = await renderMarkdown('<script>alert(1)</script>');
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&#x3C;script>|&lt;script>/);
});

test('angle brackets in prose survive to the page', async () => {
  const html = await renderMarkdown('The report named the <Home Office> directly.');
  assert.match(html, /Home Office/);
});

test('a link to a fact anchor is marked as a citation', async () => {
  const html = await renderMarkdown(
    'Net migration [reached 944,000](#fact-net-migration-2024) that year.'
  );
  assert.match(html, /<a[^>]*href="#fact-net-migration-2024"/);
  assert.match(html, /class="sv-cite"/);
  assert.match(html, /data-fact-id="net-migration-2024"/);
  assert.match(html, />reached 944,000<\/a>/);
});

test('ordinary links and other in-page anchors are left alone', async () => {
  const html = await renderMarkdown(
    'See [the source](https://example.org) and [a principle](#principle-fairness).'
  );
  assert.doesNotMatch(html, /sv-cite/);
  assert.doesNotMatch(html, /data-fact-id/);
});

test('"#fact-" with no id is not a citation', async () => {
  const html = await renderMarkdown('[nothing](#fact-)');
  assert.doesNotMatch(html, /sv-cite/);
});

test('citedFactIds lists the facts a body cites, in order, with repeats', () => {
  const ids = citedFactIds(
    'One [a](#fact-alpha), two [b](#fact-beta), again [c](#fact-alpha), plus [d](#principle-p) and [e](https://example.org).'
  );
  assert.deepEqual(ids, ['alpha', 'beta', 'alpha']);
});

test('citedFactIds ignores a fact anchor that is not a link', () => {
  assert.deepEqual(citedFactIds('Write `#fact-alpha` to cite it.'), []);
  assert.deepEqual(citedFactIds('The text #fact-alpha on its own.'), []);
  assert.deepEqual(citedFactIds(''), []);
});
