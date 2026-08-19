import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from './markdown';

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

test('raw HTML in content is escaped, not passed through', async () => {
  const html = await renderMarkdown('<script>alert(1)</script>');
  assert.doesNotMatch(html, /<script>/);
});
