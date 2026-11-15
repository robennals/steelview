import { test, expect } from './hydrated-test';
import { headCorner } from './topic-rows';

// The trial slideshow layout (components/viewpoints/viewpoint-slides.tsx).
const topic = '/topics/uk-asylum';
const viewpoint = '#viewpoint-refuge';

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a viewpoint steps from its text to the graph it leans on, with no outline', async ({ page }) => {
    await page.goto(topic);
    await page.locator(`${viewpoint} .sv-row__toggle`).click(headCorner);
    const deck = page.locator(`${viewpoint} .sv-deck`);
    await expect(deck.locator('.sv-deck__outline')).toBeHidden();
    await expect(deck.locator('.sv-deck__heading').first()).toBeInViewport();
    await deck.getByRole('button', { name: /Next/ }).click();
    const chartSlide = deck.locator('.sv-deck__slide').nth(1);
    await expect(chartSlide).toBeInViewport();
    await expect(chartSlide.locator('.sv-deck__shows')).toContainText('People who arrived by small boat since 2018');
    await expect(chartSlide.locator('.sv-chart')).toBeVisible();
  });

  test('a cited claim opens its finding in a pop-up, which leads on to the data', async ({ page }) => {
    await page.goto(topic);
    await page.locator(`${viewpoint} .sv-row__toggle`).click(headCorner);
    const claim = page.locator(`${viewpoint} .sv-deck__slide`).first().locator('a.sv-cite').first();
    await claim.click();
    const popup = page.getByRole('dialog', { name: 'Most decided small-boat claims were granted' });
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('79,589');
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    await expect(claim).toBeFocused();

    await claim.click();
    await popup.getByRole('link', { name: 'See the data' }).click();
    await expect(popup).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'Asylum Claims and Decisions in the UK and Europe' })).toBeVisible();
  });
});

test('on a wide screen the slides are listed down the left, a table getting no slide of its own', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(topic);
  await page.locator(`${viewpoint} .sv-row__toggle`).click(headCorner);
  const outline = page.locator(`${viewpoint} .sv-deck__outline`);
  await expect(outline).toBeVisible();
  // Six steps; the Rwanda and work-ban steps lean on tables, so four graphs.
  await expect(outline.locator('li')).toHaveCount(10);
  await expect(outline.locator('li[data-chart]')).toHaveCount(4);
  await outline.getByRole('button', { name: /Ukrainians and Hong Kongers/ }).click();
  await expect(outline.getByRole('button', { name: /Ukrainians and Hong Kongers/ })).toHaveAttribute('aria-current', 'step');
});
