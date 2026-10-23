import { test, expect } from '@playwright/test';

const topic = '/topics/uk-immigration';
const viewpoint = '#viewpoint-too-much-too-fast-damages-the-social-fabric';

test('an unresolved premise opens a research-needed popup and restores focus', async ({ page }) => {
  await page.goto(topic);
  await page.locator(`${viewpoint} > summary`).click();
  const citation = page.locator(`${viewpoint} a[href="#needed"]`).first();
  await expect(citation).toHaveClass('sv-needed-cite');
  await citation.click();
  const modal = page.getByRole('dialog', { name: 'Research needed' });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Research needed to see if this is true.');
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  await expect(citation).toBeFocused();
});
