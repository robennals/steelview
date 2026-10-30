import { test, expect } from '@playwright/test';

const topic = '/topics/uk-asylum';
const viewpoint = '#viewpoint-refuge';
const principle = '#principle-obligation-to-people-in-danger';

test('an inline principle pill opens its shared text and restores focus on close', async ({ page }) => {
  await page.goto(topic);
  await page.locator(`${viewpoint} > summary`).click();
  const pill = page.locator(`${viewpoint} .prose-body a[href="${principle}"]`);
  await expect(pill).toHaveClass('sv-principle-cite');
  await pill.click();
  const modal = page.getByRole('dialog', { name: 'Obligation to people in danger' });
  await expect(modal).toBeVisible();
  await expect(modal.locator('.sv-modal__eyebrow')).toHaveText('Principle');
  await expect(modal).toContainText('We have a duty to help people facing grave danger');
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
  await page.locator(`${viewpoint} > summary`).click();
  await page.locator(`${viewpoint} .prose-body a[href="${principle}"]`).click();
  await expect(page).toHaveURL(new RegExp(`${principle}$`));
  await page.locator(`${principle} > summary`).click();
  await expect(page.locator(principle)).toContainText('We have a duty to help people facing grave danger');
  await context.close();
});
