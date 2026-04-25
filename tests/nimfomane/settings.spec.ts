import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

async function getExpectedHiddenCount(page: import("playwright-core").Page) {
  const rowIds = await page.locator('[data-rowid]').evaluateAll((rows) => {
    return rows.map((row) => row.getAttribute('data-rowid')!);
  });

  let hiddenCount = 0;

  for (const id of rowIds) {
    const isOfEscort = await utilsNimfomane.getTopicStorageProp(page, id, 'isOfEscort');
    if (isOfEscort) {
      const ownerUser = await utilsNimfomane.getTopicStorageProp(page, id, 'ownerUser') as string;
      const hidden = await utilsNimfomane.getEscortStorageProp(page, ownerUser, 'hidden');
      if (hidden) {
        hiddenCount++;
      }
    } else {
      const hidden = await utilsNimfomane.getTopicStorageProp(page, id, 'hidden');
      if (hidden) {
        hiddenCount++;
      }
    }
  }

  return hiddenCount;
}

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

  const {id: topicId} = await utilsNimfomane.waitForFirstImage(page);
  const topic = page.locator(`[data-wwtopic="${topicId}"]`);

  await topic.locator('[data-wwid="toggle-hidden"]').click();
  await page.waitForTimeout(200);

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="focus-mode-switch"]').click();
  await page.waitForTimeout(1500);

  const firstPageExpected = await getExpectedHiddenCount(page);
  const indicator = page.locator('[data-wwid="hidden-count-indicator"]');
  await expect(indicator).toBeVisible();
  await expect(indicator).toContainText(String(firstPageExpected));
  await expect(indicator).toContainText('topic');

  const nextPage = page.locator('.ipsPagination_next a').first();
  await expect(nextPage).toBeVisible();
  await nextPage.click();
  await page.waitForTimeout(1500);

  const secondPageExpected = await getExpectedHiddenCount(page);
  const secondPageIndicator = page.locator('[data-wwid="hidden-count-indicator"]');

  if (secondPageExpected > 0) {
    await expect(secondPageIndicator).toContainText(String(secondPageExpected));
  } else {
    await expect(secondPageIndicator).toHaveCount(0);
  }

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="focus-mode-switch"]').click();
  await page.waitForTimeout(1500);
});
