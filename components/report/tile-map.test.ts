import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GeoMap } from './geo-map';
import type { CategoryEncoding } from './geo/categorical';
import { US_STATE_TILES } from './geo/tiles';
import { UK_ITL1_REGIONS } from './geo/uk-itl1';
import { TileMap } from './tile-map';

const rules: CategoryEncoding = {
  categoryLabel: 'ID rule at the polls',
  categories: [
    { id: 'strict-photo', label: 'Strict photo ID', mark: 'SP' },
    { id: 'non-strict', label: 'Non-strict ID', mark: 'N' },
  ],
  categoryData: {
    AR: { category: 'strict-photo', note: 'Free ID card on request' },
    GA: { category: 'strict-photo' },
    AK: { category: 'non-strict' },
  },
};

const tileHtml = (html: string, id: string) => {
  const match = html.match(new RegExp(`<li[^>]*data-region="${id}"[^>]*>.*?</li>`));
  assert.ok(match, `tile ${id} is rendered`);
  return match[0];
};

test('every tile in a category carries its mark, slot and an aria-label naming the category', () => {
  const html = renderToStaticMarkup(createElement(TileMap, { tiles: US_STATE_TILES, ...rules, areaLabel: 'State' }));
  for (const [id, mark, slot] of [['AR', 'SP', '1'], ['GA', 'SP', '1'], ['AK', 'N', '2']]) {
    const tile = tileHtml(html, id);
    assert.match(tile, new RegExp(`<span class="sv-tile-map__value" aria-hidden="true">${mark}</span>`));
    assert.match(tile, new RegExp(`data-slot="${slot}"`));
  }
  assert.match(tileHtml(html, 'AR'), /aria-label="Arkansas: Strict photo ID"/);
  assert.match(tileHtml(html, 'AR'), /data-readout="Arkansas: Strict photo ID — Free ID card on request"/);
  const missing = tileHtml(html, 'WY');
  assert.match(missing, /data-missing="true"/);
  assert.match(missing, /aria-label="Wyoming: No data"/);
  assert.doesNotMatch(missing, /data-slot/);
});

test('the legend counts each category and the missing areas', () => {
  const html = renderToStaticMarkup(createElement(TileMap, { tiles: US_STATE_TILES, ...rules }));
  assert.match(html, /Strict photo ID <span class="sv-category-legend__count">\(2\)<\/span>/);
  assert.match(html, /No data <span class="sv-category-legend__count">\(48\)<\/span>/);
});

test('the table has one row group per category, then No data', () => {
  const html = renderToStaticMarkup(createElement(TileMap, { tiles: US_STATE_TILES, ...rules, areaLabel: 'State' }));
  const groups = [...html.matchAll(/<th colSpan="2" scope="rowgroup"[^>]*>(.*?)<\/th>/g)].map(m => m[1]);
  assert.deepEqual(groups, ['Strict photo ID — 2 states', 'Non-strict ID — 1 state', 'No data — 48 states']);
  assert.match(html, /<th scope="col" class="sv-data__th-text">Note<\/th>/);
});

test('numeric mode is unchanged: tiles carry values and no slot', () => {
  const html = renderToStaticMarkup(createElement(TileMap, { tiles: US_STATE_TILES, data: { AR: { value: 12 } }, valueLabel: 'Share', format: { unit: 'percent' } }));
  assert.match(tileHtml(html, 'AR'), />12%<\/span>/);
  assert.doesNotMatch(html, /data-slot/);
  assert.doesNotMatch(html, /rowgroup/);
});

test('a categorical GeoMap fills regions with one pattern per category slot', () => {
  const html = renderToStaticMarkup(createElement(GeoMap, {
    regions: UK_ITL1_REGIONS,
    categoryLabel: 'Rule',
    categories: [{ id: 'a', label: 'Rule A', mark: 'A' }, { id: 'b', label: 'Rule B', mark: 'B' }],
    categoryData: { london: { category: 'a' }, wales: { category: 'b', note: 'Devolved' } },
  }));
  const patterns = [...html.matchAll(/<pattern id="([^"]+-cat-\d)"/g)].map(m => m[1]);
  assert.equal(patterns.length, 2);
  assert.match(html, new RegExp(`fill:url\\(#${patterns[0]}\\)[^>]*data-region="london"`));
  assert.match(html, /aria-label="Wales: Rule B"/);
  assert.match(html, /data-readout="Wales: Rule B — Devolved"/);
});
