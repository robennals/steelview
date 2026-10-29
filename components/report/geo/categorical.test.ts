import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { countOf } from '../format';
import {
  categoryCounts,
  categoryReadoutText,
  categorySlots,
  categorySummary,
  isCategorical,
  MAX_CATEGORIES,
  NO_DATA,
  type CategoryEncoding,
} from './categorical';

const encoding: CategoryEncoding = {
  categoryLabel: 'ID rule at the polls',
  categories: [
    { id: 'strict-photo', label: 'Strict photo ID', mark: 'SP' },
    { id: 'non-strict', label: 'Non-strict ID', mark: 'N' },
    { id: 'none', label: 'No document requested', mark: '—' },
  ],
  categoryData: {
    AR: { category: 'strict-photo', note: 'Since 2017' },
    GA: { category: 'strict-photo' },
    AK: { category: 'non-strict' },
    XX: { category: 'strict-photo' },
  },
};
const areas = [
  { id: 'AR', name: 'Arkansas' },
  { id: 'GA', name: 'Georgia' },
  { id: 'AK', name: 'Alaska' },
  { id: 'WY', name: 'Wyoming' },
];

test('slots run 1 to n in list order', () => {
  assert.deepEqual([...categorySlots(encoding.categories)], [['strict-photo', 1], ['non-strict', 2], ['none', 3]]);
});

test('more than six categories is refused: there are only six distinct looks', () => {
  const seven = Array.from({ length: MAX_CATEGORIES + 1 }, (_, i) => ({ id: `c${i}`, label: `C${i}`, mark: `${i}` }));
  assert.throws(() => categorySlots(seven), /at most 6/);
});

test('counts cover every category, count only the given areas, and include No data', () => {
  const counts = categoryCounts(encoding.categoryData, areas.map(area => area.id), encoding.categories);
  assert.deepEqual([...counts], [['strict-photo', 2], ['non-strict', 1], ['none', 0], [NO_DATA, 1]]);
});

test('an assignment to an unknown category counts as No data', () => {
  const counts = categoryCounts({ AR: { category: 'typo' } }, ['AR'], encoding.categories);
  assert.equal(counts.get(NO_DATA), 1);
});

test('the summary names every category with its count, then No data', () => {
  assert.equal(
    categorySummary(areas, encoding),
    '4 areas in 3 categories: Strict photo ID, 2; Non-strict ID, 1; No document requested, 0; No data, 1.',
  );
});

test('the readout adds the note; a missing area reads No data', () => {
  assert.equal(categoryReadoutText('Arkansas', encoding.categories[0], 'Since 2017'), 'Arkansas: Strict photo ID — Since 2017');
  assert.equal(categoryReadoutText('Georgia', encoding.categories[0]), 'Georgia: Strict photo ID');
  assert.equal(categoryReadoutText('Wyoming', undefined, 'ignored'), 'Wyoming: No data');
});

test('isCategorical tells the two encodings apart', () => {
  assert.equal(isCategorical(encoding), true);
  assert.equal(isCategorical({ data: {}, valueLabel: 'Share' }), false);
});

test('countOf writes a regular plural of a table heading', () => {
  assert.equal(countOf(10, 'State'), '10 states');
  assert.equal(countOf(1, 'Country'), '1 country');
  assert.equal(countOf(2, 'Country'), '2 countries');
  assert.equal(countOf(0, 'Region'), '0 regions');
});

/* ------------------------------------------------------------- contrast */

type Rgb = [number, number, number];

function hex(value: string): Rgb {
  const channel = (i: number) => parseInt(value.slice(1 + i, 3 + i), 16);
  return [channel(0), channel(2), channel(4)];
}

/** `color-mix(in srgb, a p%, b)`: a straight mix of the gamma-encoded channels. */
function mix(a: Rgb, b: Rgb, share: number): Rgb {
  const channel = (i: number) => a[i] * share + b[i] * (1 - share);
  return [channel(0), channel(1), channel(2)];
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map(channel => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio. */
function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The hex tokens of the light `:root` block and of the dark-theme override. */
function themeTokens(): Record<'light' | 'dark', Record<string, string>> {
  const css = readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8');
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
  const lightStart = css.indexOf(':root {');
  assert.ok(lightStart >= 0 && darkStart > lightStart, 'globals.css has a light :root block followed by a dark override');
  const tokens = (block: string) => Object.fromEntries([...block.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map(m => [m[1], m[2]]));
  const darkBlock = css.slice(darkStart, css.indexOf('\n}\n', darkStart));
  return { light: tokens(css.slice(lightStart, darkStart)), dark: { ...tokens(css.slice(lightStart, darkStart)), ...tokens(darkBlock) } };
}

for (const theme of ['light', 'dark'] as const) {
  test(`ink reads at 4.5:1 or better on every category tint (${theme} theme)`, () => {
    const tokens = themeTokens()[theme];
    const ink = hex(tokens['--ink']);
    const paper = hex(tokens['--paper']);
    for (let slot = 1; slot <= MAX_CATEGORIES; slot++) {
      const series = tokens[`--sv-series-${slot}`];
      assert.ok(series, `--sv-series-${slot} is defined`);
      const ratio = contrast(ink, mix(hex(series), paper, 0.3));
      assert.ok(ratio >= 4.5, `slot ${slot}: ink on the 30% tint of ${series} is ${ratio.toFixed(2)}:1`);
    }
  });
}
