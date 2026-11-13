import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AreaMap, type AreaMapProps } from './area-map';
import { GeoMap } from './geo-map';
import type { CategoryEncoding } from './geo/categorical';
import { US_STATE_TILES, US_TERRITORY_TILES } from './geo/tiles';
import { US_STATES, US_TERRITORIES } from './geo/us-states';
import { UK_ITL1_REGIONS } from './geo/uk-itl1';
import { TileMap } from './tile-map';
import { WORLD_COUNTRY_TILES } from './geo/world-tiles';

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

test('a category tile prints its name and code but no mark, and carries its slot and an aria-label naming the category', () => {
  const html = renderToStaticMarkup(createElement(TileMap, { tiles: US_STATE_TILES, ...rules, areaLabel: 'State' }));
  for (const [id, slot] of [['AR', '1'], ['GA', '1'], ['AK', '2']]) {
    const tile = tileHtml(html, id);
    assert.doesNotMatch(tile, /sv-tile-map__value/);
    assert.match(tile, new RegExp(`data-slot="${slot}"`));
  }
  assert.match(tileHtml(html, 'AR'), /<span class="sv-tile-map__name" aria-hidden="true">Arkansas<\/span><span class="sv-tile-map__code" aria-hidden="true">AR<\/span>/);
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

const rowsOf = (html: string) => [...html.matchAll(/<th scope="row">([^<]+)<\/th><td[^>]*>(.*?)<\/td>/g)].map(m => [m[1], m[2].replace(/<[^>]*>/g, '')]);

test('a categorical table is one table: a row per area and a column for its category, no sections', () => {
  const html = renderToStaticMarkup(createElement(TileMap, { tiles: US_STATE_TILES, ...rules, areaLabel: 'State' }));
  assert.doesNotMatch(html, /rowgroup/);
  assert.equal(html.match(/<tbody/g)?.length, 1);
  const rows = rowsOf(html);
  assert.equal(rows.length, 51);
  // Category order, then alphabetical; areas with no category last.
  assert.deepEqual(rows.slice(0, 3).map(row => row[0]), ['Arkansas', 'Georgia', 'Alaska']);
  assert.deepEqual(rows[0], ['Arkansas', 'SPStrict photo ID']);
  assert.deepEqual(rows[3], ['Alabama', 'No data']);
  assert.match(html, /<td class="sv-data__td-text sv-area-table__note">Free ID card on request<\/td>/);
  for (const heading of ['State', 'ID rule at the polls', 'Note']) assert.match(html, new RegExp(`aria-sort="[a-z]+"><button[^>]*>${heading}<`));
  assert.match(html, /<option value="Non-strict ID">Non-strict ID<\/option>/);
  assert.match(html, /<option value="No data">No data<\/option>/);
});

test('a numeric table sorts largest first and filters by a range', () => {
  const html = renderToStaticMarkup(createElement(TileMap, { tiles: US_STATE_TILES, data: { AR: { value: 12 }, GA: { value: 40 } }, valueLabel: 'Share', format: { unit: 'percent' }, areaLabel: 'State' }));
  assert.deepEqual(rowsOf(html).slice(0, 3), [['Georgia', '40%'], ['Arkansas', '12%'], ['Alabama', 'No data']]);
  assert.match(html, /aria-label="Share: at least"/);
  assert.match(html, /aria-label="Share: at most"/);
  assert.doesNotMatch(html, /<select/);
  assert.doesNotMatch(html, />Note</);
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

test('a GeoMap outlines its highlighted regions without changing their fill', () => {
  const html = renderToStaticMarkup(createElement(GeoMap, {
    regions: UK_ITL1_REGIONS,
    valueLabel: 'Share',
    data: { london: { value: 3 }, wales: { value: 3 } },
    highlight: ['wales'],
  }));
  const path = (id: string) => html.match(new RegExp(`<path[^>]*data-region="${id}"[^>]*>`))?.[0] ?? '';
  assert.match(path('wales'), /data-highlight="true"/);
  assert.doesNotMatch(path('london'), /data-highlight/);
  assert.equal(path('wales').match(/fill:[^;"]+/)?.[0], path('london').match(/fill:[^;"]+/)?.[0]);
});

test('a bounded tile prints its glyph, every inexact tile is stippled, and the legend explains only the marks used', () => {
  const html = renderToStaticMarkup(createElement(TileMap, {
    tiles: US_STATE_TILES,
    valueLabel: 'Deaths',
    data: { CA: { value: 159, qualifier: 'at least', asPublished: 'at least 159' }, TX: { value: 90, qualifier: 'about' }, NY: { low: 60, high: 80 }, FL: { value: 120 } },
  }));
  assert.match(tileHtml(html, 'CA'), /data-stippled="true"/);
  assert.match(tileHtml(html, 'CA'), />▲159<\/span>/);
  assert.match(tileHtml(html, 'CA'), /aria-label="California: at least 159"/);
  assert.match(tileHtml(html, 'TX'), /data-stippled="true"[^>]*>.*>90<\/span>/);
  assert.match(tileHtml(html, 'NY'), />60–\u200b80<\/span>/);
  assert.doesNotMatch(tileHtml(html, 'FL'), /data-stippled/);
  assert.match(html, /▲<\/span> At least this value/);
  assert.doesNotMatch(html, /▼<\/span>/);
  assert.match(html, /Stippled: not an exact figure — approximate, a bound or a range \(shaded at its midpoint\)/);
});

test('a numeric GeoMap draws a stipple over each inexact area, never instead of its fill', () => {
  const html = renderToStaticMarkup(createElement(GeoMap, {
    regions: UK_ITL1_REGIONS,
    valueLabel: 'Share',
    format: { unit: 'percent' },
    data: { london: { value: 40, qualifier: 'over' }, wales: { value: 7 } },
  }));
  assert.match(html, /<path class="sv-geo-map__region"[^>]*data-region="london"[^>]*><\/path><path class="sv-geo-map__stipple"/);
  assert.equal(html.match(/sv-geo-map__stipple"/g)?.length, 1);
  assert.match(html, /aria-label="London: over 40%"/);
});

test('an area too small for its outline is a focusable dot with a wider hit area', () => {
  const html = renderToStaticMarkup(createElement(GeoMap, {
    regions: [
      { id: 'big', name: 'Big', coordinates: [[[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]]] },
      { id: 'tiny', name: 'Tiny', coordinates: [], point: [5, 5] },
      { id: 'both', name: 'Both', coordinates: [[[[1, 1], [1.1, 1], [1.1, 1.1], [1, 1]]]], point: [1.05, 1.05] },
    ],
    valueLabel: 'Share',
    data: { tiny: { value: 2, qualifier: 'about' }, big: { value: 1 } },
    highlight: ['tiny'],
  }));
  const dot = html.match(/<g class="sv-geo-map__dot"[^>]*data-region="tiny"[^>]*>.*?<\/g>/)?.[0] ?? '';
  assert.match(dot, /tabindex="0"/);
  assert.match(dot, /aria-label="Tiny: about 2"/);
  assert.match(dot, /data-highlight="true"/);
  assert.match(dot, /class="sv-geo-map__dot-hit"[^>]*r="9"/);
  assert.match(dot, /class="sv-geo-map__stipple"/);
  assert.doesNotMatch(html, /<path[^>]*data-region="tiny"/, 'no empty outline path');
  // An outline under a dot answers the pointer, but only the dot takes focus.
  assert.match(html, /<path class="sv-geo-map__region"[^>]*data-region="both"[^>]*aria-hidden="true"/);
  assert.match(html, /<g class="sv-geo-map__dot"[^>]*data-region="both"[^>]*tabindex="0"/);
});

test('a tile spanning cells is placed by its top-left cell and its span, and the grid counts the span', () => {
  const html = renderToStaticMarkup(createElement(TileMap, {
    tiles: [{ id: 'a', code: 'A', name: 'A', row: 0, col: 0, w: 2, h: 2 }, { id: 'b', code: 'B', name: 'B', row: 2, col: 2 }],
    valueLabel: 'Share',
    data: { a: { value: 1 }, b: { value: 2 } },
  }));
  assert.match(tileHtml(html, 'a'), /grid-row:1 \/ span 2;grid-column:1 \/ span 2/);
  assert.match(tileHtml(html, 'b'), /grid-row:3 \/ span 1;grid-column:3 \/ span 1/);
  assert.match(html, /--sv-tile-cols:3;--sv-tile-rows:3/);
});

test('a world tile is too small to print its value until zoomed in: it keeps its code and only a bound\'s glyph', () => {
  const html = renderToStaticMarkup(createElement(TileMap, {
    tiles: WORLD_COUNTRY_TILES,
    valueLabel: 'Share',
    format: { unit: 'percent' },
    data: { FR: { value: 13 }, TV: { value: 2, qualifier: 'at least' } },
  }));
  assert.match(html, /data-cols="dense"/);
  assert.match(tileHtml(html, 'FR'), /<span class="sv-tile-map__value" aria-hidden="true"><\/span>/);
  assert.match(tileHtml(html, 'FR'), /aria-label="France: 13%"/);
  assert.match(tileHtml(html, 'TV'), />▲<\/span>/);
  assert.match(tileHtml(html, 'FR'), /<span class="sv-tile-map__value sv-tile-map__value--zoomed" aria-hidden="true">13%<\/span>/);
  assert.match(html, /print values only when zoomed in/);
});

test('every outlined country carries its name for the map to show where it fits, and a dot does not', () => {
  const html = renderToStaticMarkup(createElement(GeoMap, {
    regions: [
      { id: 'big', name: 'Big', coordinates: [[[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]]] },
      { id: 'tiny', name: 'Tiny', coordinates: [], point: [5, 5] },
    ],
    valueLabel: 'Share',
    data: { big: { value: 1 } },
  }));
  assert.match(html, /<text class="sv-geo-map__label"[^>]*data-label-for="big" aria-hidden="true">Big<\/text>/);
  assert.doesNotMatch(html, /data-label-for="tiny"/);
  // Outlines, dots and names are siblings, so each needs a key of its own.
  assert.equal(new Set([...html.matchAll(/data-label-for="([^"]+)"/g)].map(m => m[1])).size, 1);
});

test('every area says where a click zooms to, and a preview does not zoom', () => {
  const props = { tiles: [{ id: 'a', code: 'A', name: 'A', row: 1, col: 2, w: 3, h: 2 }], valueLabel: 'Share', data: { a: { value: 1 } } };
  assert.match(tileHtml(renderToStaticMarkup(createElement(TileMap, props)), 'a'), /data-focus="2 1 3 2"/);
  const map = renderToStaticMarkup(createElement(GeoMap, { regions: UK_ITL1_REGIONS, valueLabel: 'Share', data: { london: { value: 3 } } }));
  assert.match(map, /<path class="sv-geo-map__region"[^>]*data-region="london"[^>]*data-focus="[\d. ]+"/);
  assert.match(map, /aria-label="Zoom in"/);
  assert.match(map, /aria-label="Zoom out"/);
  assert.match(map, />Whole map<\/button>/);
  const preview = renderToStaticMarkup(createElement(AreaMap, { ...numeric, preview: { href: '/x' } }));
  assert.doesNotMatch(preview, /data-focus|Zoom in/);
});

/* ------------------------------------------------- AreaMap: both views */

const numeric = {
  tiles: [...US_STATE_TILES, ...US_TERRITORY_TILES],
  regions: [...US_STATES, ...US_TERRITORIES],
  valueLabel: 'Rejected, % of returned mail ballots',
  format: { unit: 'percent', decimals: 1 },
  data: { CA: { value: 1, qualifier: 'under', asPublished: 'under 1%' }, TX: { value: 2.5 }, PR: { value: 3, qualifier: 'at least' } },
  highlight: ['PR'],
  areaLabel: 'State or territory',
  title: 'Mail ballots rejected',
} satisfies AreaMapProps;

const buttons = (html: string) => [...html.matchAll(/<button type="button" aria-pressed="(true|false)">([^<]+)<\/button>/g)].map(m => `${m[2]}${m[1] === 'true' ? '*' : ''}`);

test('the switch offers Map, Tiles and Table, the default view first and drawn on the server', () => {
  const map = renderToStaticMarkup(createElement(AreaMap, numeric));
  assert.deepEqual(buttons(map), ['Map*', 'Tiles', 'Table']);
  assert.match(map, /<svg class="sv-geo-map__svg"/);
  assert.doesNotMatch(map, /sv-tile-map__grid/);

  const tiles = renderToStaticMarkup(createElement(AreaMap, { ...numeric, defaultView: 'tiles' }));
  assert.deepEqual(buttons(tiles), ['Tiles*', 'Map', 'Table']);
  assert.match(tiles, /<ul class="sv-tile-map__grid"/);
  assert.doesNotMatch(tiles, /<svg class="sv-geo-map__svg"/);
});

test('without JavaScript the table follows the default view, listing every area', () => {
  const html = renderToStaticMarkup(createElement(AreaMap, numeric));
  const table = html.slice(html.indexOf('<noscript>'));
  assert.equal((table.match(/<th scope="row">/g) ?? []).length, 56);
  assert.match(table, /<th scope="row">Puerto Rico<\/th><td>at least 3%<\/td>/);
});

test('both views read an area the same way, qualifier and highlight included', () => {
  for (const defaultView of ['map', 'tiles'] as const) {
    const html = renderToStaticMarkup(createElement(AreaMap, { ...numeric, defaultView }));
    assert.match(html, /data-region="CA"[^>]*data-readout="California: under 1%"/, defaultView);
    assert.match(html, /aria-label="Puerto Rico: at least 3%"/, defaultView);
    assert.match(html, /data-region="PR"[^>]*data-highlight="true"/, defaultView);
    assert.match(html, /▼<\/span> At most this value/, `${defaultView}: the legend explains the glyphs`);
    assert.match(html, /Stippled: not an exact figure/, defaultView);
  }
});

test('in the real-shape view a territory is a focusable dot and the stipple marks a bound', () => {
  const html = renderToStaticMarkup(createElement(AreaMap, numeric));
  assert.match(html, /<g class="sv-geo-map__dot"[^>]*data-region="PR"[^>]*tabindex="0"/);
  assert.match(html, /<path class="sv-geo-map__region"[^>]*data-region="CA"[^>]*><\/path><path class="sv-geo-map__stipple"/);
});

test('on the real shapes a bound carries its glyph, and every dot is drawn over every outline', () => {
  const html = renderToStaticMarkup(createElement(AreaMap, numeric));
  assert.deepEqual([...html.matchAll(/<text class="sv-geo-map__glyph"[^>]*>(.)<\/text>/g)].map(m => m[1]).sort(), ['▲', '▼']);
  const lastOutline = html.lastIndexOf('<path class="sv-geo-map__region"');
  const firstDot = html.indexOf('<g class="sv-geo-map__dot"');
  assert.ok(firstDot > lastOutline, 'dots after outlines');
});

test('an inset enlarges an area in the real-shape view, with its value under it', () => {
  const html = renderToStaticMarkup(createElement(AreaMap, { ...numeric, insets: [{ regionIds: ['DC'], label: 'Washington DC' }], data: { ...numeric.data, DC: { value: 4 } } }));
  assert.match(html, /<rect class="sv-geo-map__inset-frame"/);
  assert.match(html, /sv-geo-map__inset-label[^>]*>Washington DC<\/text>/);
  assert.match(html, /sv-geo-map__inset-value[^>]*>4%<\/text>/);
});

test('GeoMap markers are drawn, keyed by shape and listed in the table', () => {
  const html = renderToStaticMarkup(createElement(GeoMap, {
    regions: UK_ITL1_REGIONS,
    valueLabel: 'Share',
    data: { london: { value: 3 } },
    markers: [{ lon: -0.1, lat: 51.5, label: 'Heathrow', value: 500, kind: 'Centre' }, { lon: -1.5, lat: 53.8, label: 'Leeds', kind: 'Port' }],
    markerValueLabel: 'People held',
    insets: [{ regionIds: ['london'] }],
  }));
  assert.match(html, /aria-label="Heathrow: 500 \(people held\)"/);
  assert.match(html, /<li>.*Centre<\/li>/);
  assert.match(html, /<caption>Marked locations<\/caption>/);
});
