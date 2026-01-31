import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should display version history modal.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="version-history-button"]').click();

  const modal = page.locator('[data-wwid="version-history-modal"]');
  await expect(modal).toBeVisible();

  await expect(modal.locator('h3', {hasText: '2.41'})).toBeVisible();
});

test('Should add animations for new version.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const menuButton = page.locator('[data-wwid="menu-button"]');
  await expect(menuButton).toHaveAttribute('data-wwanimating', 'false');

  await page.evaluate(() => {
    localStorage.setItem('ww:version-seen', '1');
  });
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
