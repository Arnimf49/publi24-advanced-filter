import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

test('Should display version history modal.', async ({ page }) => {
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/201-discutii-generale-cluj/'});

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="version-history-button"]').click();

  const modal = page.locator('[data-wwid="version-history-modal"]');
  await expect(modal).toBeVisible();

  await expect(modal.locator('h2', {hasText: '3.0.1'})).toBeVisible();
});

test('Should add animations for new version.', async ({ page }) => {
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/201-discutii-generale-cluj/'});

  const menuButton = page.locator('[data-wwid="menu-button"]');
  await expect(menuButton).toHaveAttribute('data-wwanimating', 'false');

  await page.evaluate(() => localStorage.setItem('p24fa:nimfo:version-seen', '1'));
  await page.reload();

  await expect(menuButton).toHaveAttribute('data-wwanimating', 'true');

  await menuButton.click();
  const versionHistoryButton = page.locator('[data-wwid="version-history-button"]');
  await expect(versionHistoryButton).toHaveAttribute('data-wwanimating', 'true');

  await versionHistoryButton.click();
  const modal = page.locator('[data-wwid="version-history-modal"]');
  await page.locator('[data-wwid="close"]').click();
  await expect(modal).not.toBeVisible();

  await expect(menuButton).toHaveAttribute('data-wwanimating', 'false');
});
