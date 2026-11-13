import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { LonLat } from './types';
import { WORLD_COUNTRIES } from './world-countries';
import { WORLD_COUNTRY_TILES } from './world-tiles';

/** One cell of the grid, in square kilometres. */
const CELL_KM2 = 250_000;
const EARTH_RADIUS_KM = 6371;
const RADIANS = Math.PI / 180;

const rows = Math.max(...WORLD_COUNTRY_TILES.map(tile => tile.row + (tile.h ?? 1)));
const cols = Math.max(...WORLD_COUNTRY_TILES.map(tile => tile.col + (tile.w ?? 1)));

/** Each cell's tile id, or undefined for water. */
const grid: Array<Array<string | undefined>> = Array.from({ length: rows }, () => Array<string | undefined>(cols).fill(undefined));
for (const { id, row, col, w = 1, h = 1 } of WORLD_COUNTRY_TILES) {
  for (let r = row; r < row + h; r++) for (let c = col; c < col + w; c++) {
    assert.equal(grid[r][c], undefined, `${id} overlaps ${grid[r][c]} at ${r},${c}`);
    grid[r][c] = id;
  }
}

const pairKey = (a: string, b: string) => [a, b].sort().join('-');

/** Every pair of countries whose tiles share an edge. */
const touching = new Set<string>();
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  const here = grid[r][c];
  if (!here) continue;
  for (const there of [grid[r][c + 1], grid[r + 1]?.[c]]) if (there && there !== here) touching.add(pairKey(here, there));
}

/** A ring's area on the sphere, in square kilometres. */
function ringArea(ring: LonLat[]): number {
  let sum = 0;
  ring.forEach(([lon, lat], i) => {
    const [nextLon, nextLat] = ring[(i + 1) % ring.length];
    sum += (nextLon - lon) * RADIANS * (2 + Math.sin(lat * RADIANS) + Math.sin(nextLat * RADIANS));
  });
  return Math.abs((sum * EARTH_RADIUS_KM * EARTH_RADIUS_KM) / 2);
}

const areaOf = (id: string) =>
  WORLD_COUNTRIES.find(region => region.id === id)?.coordinates.reduce((total, polygon) => total + polygon.reduce((sum, ring, i) => sum + (i === 0 ? ringArea(ring) : -ringArea(ring)), 0), 0) ?? 0;

test('there is one tile per sovereign state, each with an outline or a dot', () => {
  assert.equal(WORLD_COUNTRY_TILES.length, 197);
  assert.equal(new Set(WORLD_COUNTRY_TILES.map(tile => tile.id)).size, 197);
  for (const { id } of WORLD_COUNTRY_TILES) assert.ok(WORLD_COUNTRIES.some(region => region.id === id), id);
});

test('a tile is as large as its country, down to one cell', () => {
  for (const { id, w = 1, h = 1 } of WORLD_COUNTRY_TILES) {
    const cells = Math.max(1, areaOf(id) / CELL_KM2);
    assert.ok(Math.abs(w * h - cells) <= Math.max(1.75, cells * 0.2), `${id} has ${w * h} cells for ${cells.toFixed(1)}`);
  }
});

test('the largest countries are the largest tiles, in order of size', () => {
  const cellsOf = (id: string) => {
    const { w = 1, h = 1 } = WORLD_COUNTRY_TILES.find(tile => tile.id === id)!;
    return w * h;
  };
  assert.ok(cellsOf('RU') > cellsOf('CN'));
  assert.ok(cellsOf('CN') > cellsOf('IN'));
  assert.ok(cellsOf('IN') > cellsOf('FR'));
  assert.ok(cellsOf('FR') > cellsOf('LU'));
  assert.equal(cellsOf('LU'), 1);
});

test('most real land borders are kept, and the ones readers look for', () => {
  const owners = new Map<string, Set<string>>();
  const tiled = new Set(WORLD_COUNTRY_TILES.map(tile => tile.id));
  for (const region of WORLD_COUNTRIES) {
    if (!tiled.has(region.id)) continue;
    for (const point of region.coordinates.flat(2)) {
      const key = `${point[0].toFixed(2)},${point[1].toFixed(2)}`;
      owners.set(key, (owners.get(key) ?? new Set()).add(region.id));
    }
  }
  const borders = new Set<string>();
  for (const ids of owners.values()) {
    const list = [...ids];
    list.forEach((a, i) => list.slice(i + 1).forEach(b => borders.add(pairKey(a, b))));
  }
  const kept = [...borders].filter(pair => touching.has(pair));
  assert.ok(kept.length / borders.size >= 0.7, `${kept.length} of ${borders.size} borders kept`);
  for (const [a, b] of [['FR', 'DE'], ['FR', 'ES'], ['DE', 'PL'], ['UA', 'RU'], ['US', 'CA'], ['US', 'MX'], ['CN', 'RU'], ['IN', 'PK'], ['IN', 'CN'], ['BR', 'AR'], ['EG', 'LY'], ['TR', 'SY'], ['SA', 'YE'], ['IE', 'GB']]) {
    assert.ok(touching.has(pairKey(a, b)), `${a} touches ${b}`);
  }
});

test('countries divided by a major body of water never touch', () => {
  const seas: Record<string, string[][]> = {
    'the Pacific': [['US', 'RU'], ['US', 'JP'], ['CL', 'AU']],
    'the Atlantic': [['US', 'FR'], ['BR', 'SN'], ['CA', 'IS'], ['US', 'GB']],
    'the Indian Ocean': [['IN', 'AU'], ['MG', 'MZ'], ['IN', 'OM'], ['LK', 'IN']],
    'the Mediterranean': [['ES', 'MA'], ['IT', 'TN'], ['IT', 'LY'], ['GR', 'LY'], ['GR', 'EG'], ['GR', 'IL'], ['GR', 'TR'], ['CY', 'TR'], ['CY', 'IL'], ['MT', 'TN'], ['FR', 'DZ']],
    'the Adriatic': [['IT', 'HR'], ['IT', 'AL'], ['IT', 'BA']],
    'the North Sea and the Channel': [['GB', 'FR'], ['GB', 'NL'], ['GB', 'BE'], ['GB', 'NO'], ['GB', 'DK']],
    'the Baltic': [['SE', 'EE'], ['SE', 'LV'], ['SE', 'LT'], ['SE', 'PL'], ['SE', 'DK'], ['FI', 'EE']],
    'the Black Sea': [['UA', 'TR'], ['RO', 'TR'], ['MD', 'TR']],
    'the Red Sea and the Gulf of Aden': [['EG', 'SA'], ['SD', 'SA'], ['ER', 'YE'], ['DJ', 'YE'], ['SO', 'YE']],
    'the Gulf': [['IR', 'SA'], ['IR', 'AE'], ['IR', 'QA'], ['IR', 'OM']],
    'the seas of East Asia': [['JP', 'KR'], ['JP', 'CN'], ['KR', 'CN'], ['TW', 'CN'], ['PH', 'VN'], ['ID', 'AU'], ['PG', 'AU'], ['AU', 'NZ'], ['MY', 'ID']],
    'the Caribbean and the Gulf of Mexico': [['CU', 'US'], ['CU', 'MX'], ['BS', 'US'], ['JM', 'CU'], ['CU', 'HT'], ['VE', 'DO']],
  };
  for (const [sea, pairs] of Object.entries(seas)) {
    for (const [a, b] of pairs) assert.ok(!touching.has(pairKey(a, b)), `${a} and ${b} are divided by ${sea}`);
  }
});

test('the oceans are wide open', () => {
  const edge = (id: string, side: 'left' | 'right') => {
    const { col, w = 1 } = WORLD_COUNTRY_TILES.find(tile => tile.id === id)!;
    return side === 'left' ? col : col + w;
  };
  assert.ok(edge('GM', 'left') - edge('BR', 'right') >= 4, 'the Atlantic is at least four cells across');
  // The Pacific runs off both edges of the grid, as it does on the real shapes.
  const fromEastAsia = cols - edge('JP', 'right');
  assert.ok(fromEastAsia + edge('US', 'left') >= 7, 'the Pacific is at least seven cells across');
});

test('each continent is one connected landmass, with no holes but its real seas', () => {
  const reach = (start: string) => {
    const seen = new Set<string>();
    const queue = [start];
    while (queue.length > 0) {
      const id = queue.pop()!;
      if (seen.has(id)) continue;
      seen.add(id);
      for (const pair of touching) {
        const [a, b] = pair.split('-');
        if (a === id) queue.push(b);
        if (b === id) queue.push(a);
      }
    }
    return seen;
  };
  const americas = reach('CA');
  for (const id of ['US', 'MX', 'GT', 'HN', 'NI', 'CR', 'PA', 'CO', 'BR', 'AR', 'CL']) assert.ok(americas.has(id), `${id} joins the Americas`);
  const oldWorld = reach('FR');
  for (const id of ['DE', 'RU', 'CN', 'IN', 'VN', 'SA', 'EG', 'NG', 'CD', 'ZA']) assert.ok(oldWorld.has(id), `${id} joins Afro-Eurasia`);
  assert.ok(!oldWorld.has('US'), 'the oceans divide the Americas from the Old World');

  // Water no ocean can reach is a hole in the land; the only ones allowed are real inland seas.
  const seen = new Set<string>();
  const flood = (startRow: number, startCol: number) => {
    const coast = new Set<string>();
    const stack: Array<[number, number]> = [[startRow, startCol]];
    let open = false;
    while (stack.length > 0) {
      const [r, c] = stack.pop()!;
      if (r < 0 || c < 0 || r >= rows || c >= cols) {
        open = true;
        continue;
      }
      const tile = grid[r][c];
      if (tile) coast.add(tile);
      if (tile || seen.has(`${r},${c}`)) continue;
      seen.add(`${r},${c}`);
      // Diagonals count: water runs between two tiles that meet only at a corner, as through a strait.
      for (const dr of [-1, 0, 1]) for (const dc of [-1, 0, 1]) stack.push([r + dr, c + dc]);
    }
    return { open, coast };
  };
  const enclosed: Array<Set<string>> = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] || seen.has(`${r},${c}`)) continue;
    const { open, coast } = flood(r, c);
    if (!open) enclosed.push(coast);
  }
  const named = enclosed.map(coast => (coast.has('UA') && coast.has('TR') ? 'the Black Sea' : coast.has('KZ') && coast.has('IR') ? 'the Caspian' : [...coast].join(' '))).sort();
  assert.deepEqual(named, ['the Black Sea', 'the Caspian']);
});
