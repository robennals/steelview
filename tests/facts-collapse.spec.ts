import { test, expect } from '@playwright/test';

// The Facts section shows its first three *headline* facts and puts the rest
// behind a native <details> group. Supporting facts are listed under the
// headline fact they are evidence for and never as top-level rows, so
// `.sv-fact` counts exactly the top-level list. These assertions are content-independent: they
// count the facts the page actually renders rather than naming any of them,
// so re-ranking or adding facts in content/ does not turn this suite red.

const FACTS_SHOWN = 3;

const closedLabel = '.sv-more__label[data-when="closed"]';
const openLabel = '.sv-more__label[data-when="open"]';

test('only the first three facts are visible until the group is opened', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  const total = await page.locator('.sv-fact').count();
  expect(total).toBeGreaterThan(FACTS_SHOWN);

  await expect(page.locator('.sv-fact:visible')).toHaveCount(FACTS_SHOWN);

  // The control says how many are behind it, not just "show more".
  await expect(page.locator(closedLabel)).toHaveText(`Show ${total - FACTS_SHOWN} more data collections`);
  await expect(page.locator(openLabel)).toBeHidden();
});

test('the control reveals the remaining facts, and closes them again', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  const total = await page.locator('.sv-fact').count();
  const control = page.locator('details.sv-more > summary');

  await control.click();
  await expect(page.locator('.sv-fact:visible')).toHaveCount(total);
  await expect(page.locator(openLabel)).toHaveText('Show fewer');
  await expect(page.locator(closedLabel)).toBeHidden();

  await control.click();
  await expect(page.locator('.sv-fact:visible')).toHaveCount(FACTS_SHOWN);
});

// The group collapse is a plain <details>, exactly like every item on the
// page, so it must still work with JavaScript turned off.
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('the collapse still hides and reveals the remaining facts', async ({ page }) => {
    await page.goto('/topics/uk-immigration');
    const total = await page.locator('.sv-fact').count();
    await expect(page.locator('.sv-fact:visible')).toHaveCount(FACTS_SHOWN);

    await page.locator('details.sv-more > summary').click();
    await expect(page.locator('.sv-fact:visible')).toHaveCount(total);
  });
});

test('only the Facts section collapses', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await expect(page.locator('details.sv-more')).toHaveCount(1);

  // Fact rows are excluded: they are links now, not disclosures, so they
  // carry no collapse of their own — only the group control does.
  const others = page.locator('details.sv-item:not(.sv-fact):not(.sv-subfact)');
  const count = await others.count();
  expect(count).toBeGreaterThan(0);
  await expect(
    page.locator('details.sv-item:not(.sv-fact):not(.sv-subfact):visible')
  ).toHaveCount(count);
});
