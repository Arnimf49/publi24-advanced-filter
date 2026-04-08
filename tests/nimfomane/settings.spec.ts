import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

test('Should open settings modal from menu.', async ({page}) => {
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/201-discutii-generale-cluj/'});

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();

  const focusModeSwitch = page.locator('[data-wwid="focus-mode-switch"]');
  await expect(focusModeSwitch).toBeVisible();
});

test('Should toggle focus mode and hide previously hidden topics.', async ({page}) => {
  await utilsNimfomane.open(page);

  const {id: topicId, user} = await utilsNimfomane.waitForFirstImage(page);
  const topic = page.locator(`[data-wwtopic="${topicId}"]`);

  await topic.locator('[data-wwid="toggle-hidden"]').click();
  await page.waitForTimeout(200);

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="focus-mode-switch"]').click();
  await page.waitForTimeout(1500);

  await expect(page.locator(`[data-wwtopic="${topicId}"]`)).toBeHidden();

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="focus-mode-switch"]').click();
  await page.waitForTimeout(1500);

  await expect(page.locator(`[data-wwtopic="${topicId}"]`)).toBeVisible();

  if (user) {
    await utilsNimfomane.setEscortStorageProp(page, user, 'hidden', false);
  }
});

test('Should show hidden count indicator when focus mode is active.', async ({page}) => {
  await utilsNimfomane.open(page);

  const {id: topicId, user} = await utilsNimfomane.waitForFirstImage(page);
  const topic = page.locator(`[data-wwtopic="${topicId}"]`);

  await topic.locator('[data-wwid="toggle-hidden"]').click();
  await page.waitForTimeout(200);

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="focus-mode-switch"]').click();
  await page.waitForTimeout(1500);

  const indicator = page.locator('[data-wwid="hidden-count-indicator"]');
  await expect(indicator).toBeVisible();
  await expect(indicator).toContainText('topic');

  // cleanup
  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="focus-mode-switch"]').click();
  await page.waitForTimeout(1500);

  if (user) {
    await utilsNimfomane.setEscortStorageProp(page, user, 'hidden', false);
  }
});
