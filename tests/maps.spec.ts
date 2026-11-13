import type { Locator } from '@playwright/test';
import { test, expect } from './hydrated-test';

// Depends on authored content: the us-vote-by-mail fact
// `secret-ballot-and-postal-voting-abroad` carries a world map (preset
// world, so it has both tiles and real shapes) that opens on its real
// shapes. The switching tests do not assume which view it opens on, or what
// Liechtenstein's category is — only that a microstate is readable, and
// reads the same, in both views.

const POSTAL = 'secret-ballot-and-postal-voting-abroad';
const POSTAL_URL = `/topics/us-vote-by-mail/facts/${POSTAL}`;
const POSTAL_MAP = `#${POSTAL}--chart-idea-postal-voting`;

/** The distinct areas a map's current view draws, as tiles, shapes or dots. */
async function drawnAreas(map: Locator): Promise<number> {
  const ids = await map.locator('.sv-tile-map__tile, .sv-geo-map__region, .sv-geo-map__dot').evaluateAll(els => els.map(el => el.getAttribute('data-region')));
  return new Set(ids).size;
}

test('a map switches between its tiles, its real shapes and its table, reading each area the same way', async ({ page }) => {
  await page.goto(POSTAL_URL);
  const map = page.locator(POSTAL_MAP);
  const button = (name: string) => map.locator('.sv-chart__view-controls button', { hasText: name });
  await expect(map.locator('.sv-chart__view-controls button')).toHaveCount(3);
  await expect(map.locator('.sv-chart__view-controls button[aria-pressed="true"]')).toHaveCount(1);
  await expect(map.locator('.sv-chart__view-controls button').last()).toHaveText('Table');

  const readout = map.locator('.sv-map__readout');
  await button('Tiles').click();
  await page.mouse.move(0, 0);
  const tiles = await drawnAreas(map);
  await map.locator('.sv-tile-map__tile[data-region="LI"]').focus();
  await expect(readout).toHaveText(/^Liechtenstein: \S/);
  const liechtenstein = await readout.textContent();
  await map.locator('.sv-tile-map__tile[data-region="GB"]').focus();
  await expect(readout).toHaveText(/^United Kingdom: \S/);
  const uk = await readout.textContent();

  await button('Map').click();
  await expect(map.locator('.sv-tile-map__grid')).toHaveCount(0);
  // Liechtenstein is a few pixels across at this scale, so it is a dot a
  // keyboard can reach, with the same sentence as its tile.
  await map.locator('.sv-geo-map__dot[data-region="LI"]').focus();
  await expect(readout).toHaveText(liechtenstein!);
  await map.locator('.sv-geo-map__region[data-region="GB"]').focus();
  await expect(readout).toHaveText(uk!);

  await button('Table').click();
  await expect(map.locator('table.sv-chart__table tbody th[scope="row"]')).toHaveCount(tiles);
});

test('a world map opening on its shapes offers one tile per sovereign state', async ({ page }) => {
  await page.goto(POSTAL_URL);
  const map = page.locator(POSTAL_MAP);
  await expect(map.locator('.sv-chart__view-controls button')).toHaveText(['Map', 'Tiles', 'Table']);
  await expect(map.locator('.sv-geo-map__dot')).toHaveCount(29);
  await map.locator('.sv-chart__view-controls button', { hasText: 'Tiles' }).click();
  await expect(map.locator('.sv-tile-map__tile')).toHaveCount(197);
  // Focus scrolls the page: a pointer left on the map would land on a tile and take the readout.
  await page.mouse.move(0, 0);
  // Tuvalu is a microstate: one tile, reachable by keyboard, with its sentence.
  await map.locator('.sv-tile-map__tile[data-region="TV"]').focus();
  await expect(map.locator('.sv-map__readout')).toHaveText(/^Tuvalu: \S/);
});

test('clicking a country zooms to it, in both drawings, and the buttons take it back', async ({ page }) => {
  await page.goto(POSTAL_URL);
  const map = page.locator(POSTAL_MAP);
  const interactive = map.locator('.sv-map__interactive');
  const zoomIn = map.getByRole('button', { name: 'Zoom in' });
  const whole = map.getByRole('button', { name: 'Whole map' });

  await expect(whole).toBeDisabled();
  await map.locator('.sv-geo-map__region[data-region="DE"]').click();
  await expect(interactive).toHaveAttribute('data-zoomed', /.+/);
  await expect(whole).toBeEnabled();
  await whole.click();
  await expect(interactive).not.toHaveAttribute('data-zoomed', /.+/);

  await zoomIn.click();
  await expect(interactive).toHaveAttribute('data-zoomed', 'true');
  await whole.click();

  // Whole, only the largest countries have room for their names.
  await expect(map.locator('.sv-geo-map__label[data-label-for="RU"]')).toHaveAttribute('data-label', 'large');
  await expect(map.locator('.sv-geo-map__label[data-label-for="LU"]')).not.toHaveAttribute('data-label', /.+/);
  await map.locator('.sv-chart__view-controls button', { hasText: 'Tiles' }).click();
  await expect(map.locator('.sv-tile-map__tile[data-region="RU"]')).toHaveAttribute('data-label', 'name');
  await expect(map.locator('.sv-tile-map__tile[data-region="LU"]')).not.toHaveAttribute('data-label', /.+/);
  // Tiles zoom only a little: a click nudges in, and the buttons stop at the detail scale.
  await map.locator('.sv-tile-map__tile[data-region="DE"]').click();
  await expect(interactive).toHaveAttribute('data-zoomed', 'true');
  await expect(interactive).toHaveAttribute('style', /--sv-map-zoom: 1\.5/);
  await zoomIn.click();
  await zoomIn.click();
  await expect(interactive).toHaveAttribute('data-zoomed', 'detail');
  await expect(zoomIn).toBeDisabled();
  // The disabled button has dropped focus; Escape works from any tile.
  await map.locator('.sv-tile-map__tile[data-region="DE"]').focus();
  await page.keyboard.press('Escape');
  await expect(interactive).not.toHaveAttribute('data-zoomed', /.+/);
});

test('the table is one list of areas that sorts and filters by column', async ({ page }) => {
  await page.goto(POSTAL_URL);
  const map = page.locator(POSTAL_MAP);
  await map.locator('.sv-chart__view-controls button', { hasText: 'Table' }).click();
  // In a data panel the table's scroll box runs to the bottom of the step.
  const scroller = await map.locator('.sv-area-table .sv-chart__table-scroll').boundingBox();
  const figure = await map.boundingBox();
  expect(figure!.y + figure!.height - (scroller!.y + scroller!.height)).toBeLessThan(80);
  const names = map.locator('table.sv-chart__table tbody th[scope="row"]');
  await expect(names).toHaveCount(197);
  await expect(map.locator('table.sv-chart__table tbody')).toHaveCount(1);

  await map.getByRole('searchbox', { name: 'Country', exact: true }).fill('lux');
  await expect(names).toHaveText(['Luxembourg']);
  await map.getByRole('searchbox', { name: 'Country', exact: true }).fill('');

  await map.getByRole('combobox').selectOption('All voters may vote by post');
  await expect(names).toHaveCount(11);
  await map.getByRole('button', { name: 'Country', exact: true }).click();
  await expect(names.first()).toHaveText('Canada');
  await map.getByRole('button', { name: 'Country', exact: true }).click();
  await expect(names.first()).toHaveText('United States');
});

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('a map shows its default view and every area in the table', async ({ page }) => {
    await page.goto(POSTAL_URL);
    const map = page.locator(POSTAL_MAP);
    const areas = await drawnAreas(map);
    expect(areas).toBeGreaterThan(0);
    await map.locator('summary', { hasText: 'Show the numbers' }).click();
    await expect(map.locator('details table tbody th[scope="row"]')).toHaveCount(areas);
    await expect(map.locator('details table tbody th[scope="row"]', { hasText: 'Liechtenstein' })).toHaveCount(1);
    await expect(map.getByRole('button', { name: 'Zoom in' })).toBeHidden();
  });
});
