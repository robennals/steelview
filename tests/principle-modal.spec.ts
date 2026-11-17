import { test, expect } from './hydrated-test';
import { headCorner } from './topic-rows';

const topic = '/topics/uk-asylum';
const viewpoint = '#viewpoint-bar-and-remove';
const principle = '#principle-first-duty-to-its-own-people';
const finalStep = '.sv-deck__outline-item >> nth=4';
const PRINCIPLE_TEXT = 'A government holds power because its citizens grant it';

test('an inline principle pill opens its shared text and restores focus on close', async ({ page }) => {
  await page.goto(topic);
  await page.locator(`${viewpoint} .sv-row__toggle`).click(headCorner);
  await page.locator(`${viewpoint} ${finalStep}`).click();
  const pill = page.locator(`${viewpoint} a[href="${principle}"]`);
  await expect(pill).toHaveClass('sv-principle-cite');
  await pill.click();
  const modal = page.getByRole('dialog', { name: "A government's first duty is to its own people" });
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
