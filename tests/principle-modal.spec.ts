import { test, expect } from './hydrated-test';
import { headCorner } from './topic-rows';

const topic = '/topics/uk-immigration';
const viewpoint = '#viewpoint-open-and-build';
const principle = '#principle-gains-from-open-exchange';
const finalStep = '.sv-walk__outline-step >> nth=5';
const PRINCIPLE_TEXT = 'People should be free to trade, share knowledge';

test('an inline principle pill opens its shared text and restores focus on close', async ({ page }) => {
  await page.goto(topic);
  await page.locator(`${viewpoint} .sv-row__toggle`).click(headCorner);
  await page.locator(`${viewpoint} ${finalStep}`).click();
  const pill = page.locator(`${viewpoint} .prose-body a[href="${principle}"]`);
  await expect(pill).toHaveClass('sv-principle-cite');
  await pill.click();
  const modal = page.getByRole('dialog', { name: 'Freedom to cooperate and exchange' });
  await expect(modal).toBeVisible();
  await expect(modal.locator('.sv-modal__eyebrow')).toHaveText('Principle');
  await expect(modal).toContainText(PRINCIPLE_TEXT);
  await expect(page).toHaveURL(new RegExp(`${topic}$`));
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  await expect(pill).toBeFocused();
  await pill.click();
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: 'Close' }).click();
  await expect(pill).toBeFocused();
});

test('principle links retain an on-page destination without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(topic);
  await page.locator(`${viewpoint} .prose-body a[href="${principle}"]`).click();
  await expect(page).toHaveURL(new RegExp(`${principle}$`));
  await page.locator(`${principle} > summary`).click();
  await expect(page.locator(principle)).toContainText(PRINCIPLE_TEXT);
  await context.close();
});
