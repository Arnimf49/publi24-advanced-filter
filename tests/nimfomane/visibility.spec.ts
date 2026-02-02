import {expect, Page} from "playwright/test";
import {test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

async function findTopicWithPhone(page: Page) {
  const {id} = await utilsNimfomane.waitForFirstImage(page);
  const topic = page.locator(`[data-wwtopic="${id}"]`);

  await topic.locator('[data-wwid="topic-image"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);

  const whatsappButton = topic.locator('a[href*="wa.me"]');
  await expect(whatsappButton).toBeVisible({timeout: 16000});

  return topic;
}

async function assertTopicHidden(topic: any, hidden: boolean) {
  const firstChild = topic.locator('> *:not([data-wwid="hide-reason-container"])').first();
  const opacity = await firstChild.evaluate((el: Element) => getComputedStyle(el).getPropertyValue('opacity'));
  const blendMode = await firstChild.evaluate((el: Element) => getComputedStyle(el).getPropertyValue('mix-blend-mode'));

  expect(opacity).toEqual(hidden ? '0.5' : '1');
  expect(blendMode).toEqual(hidden ? 'luminosity' : 'normal');
}

async function assertReasonDisplay(topic: any, expectedReason: string) {
  const reasonElement = topic.locator('[data-wwid="hide-reason"]');
  await expect(reasonElement).toBeVisible();
  const reasonText = await reasonElement.innerText();
  expect(reasonText).toContain(expectedReason);
}

test('Should hide or show escort topic.', async ({page}) => {
  await utilsNimfomane.open(page);
  const topic = await findTopicWithPhone(page);
  const topicId = await topic.getAttribute('data-wwtopic');

  await topic.locator('[data-wwid="toggle-hidden"]').click();
  await page.waitForTimeout(100);
  await assertTopicHidden(topic, true);

  await utilsNimfomane.throttleReload(page);
  const topicAfterReload = page.locator(`[data-wwtopic="${topicId}"]`);
  await page.waitForTimeout(100);
  await assertTopicHidden(topicAfterReload, true);

  await topicAfterReload.locator('[data-wwid="toggle-hidden"]').click();
  await topicAfterReload.locator('[data-wwid="toggle-hidden"]').click();
  await page.locator('[data-wwid="show-button"]').click();
  await page.waitForTimeout(100);
  await assertTopicHidden(topicAfterReload, false);
});

test('Should reason hiding topic.', async ({page}) => {
  await utilsNimfomane.open(page);
  const topic = await findTopicWithPhone(page);

  await topic.locator('[data-wwid="toggle-hidden"]').click();
  await page.locator('[data-wwid="reason"]').filter({hasText: 'aspect'}).click();

  await assertReasonDisplay(topic, 'aspect');

  await page.locator('[data-wwid="back-button"]').click();
  await page.locator('[data-wwid="reason"]').filter({hasText: 'alta'}).click();
  await page.locator('[data-wwid="subcategory"]').filter({hasText: 'sex'}).click();

  await page.waitForTimeout(100);
  await assertTopicHidden(topic, true);
  await assertReasonDisplay(topic, 'alta: sex');
});

test('Should hide publi topic.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {id: topicId} = await utilsNimfomane.waitForFirstImage(page);

  await utilsNimfomane.setTopicStorageProp(page, topicId, 'isOfEscort', false);
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'escortDeterminationTime', Date.now());
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'publiLink', 'https://www.publi24.ro/anunturi/matrimoniale/escorte/cluj/cluj-napoca/test/1234/');
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'publiLinkDeterminationTime', Date.now());

  await utilsNimfomane.throttleReload(page);

  const topic = page.locator(`[data-wwtopic="${topicId}"]`);
  await topic.locator('[data-wwid="toggle-hidden"]').click();
  await page.locator('[data-wwid="reason"]').filter({hasText: 'aspect'}).click();
  await page.locator('[data-wwid="subcategory"]').filter({hasText: 'vârstă'}).click();

  await page.waitForTimeout(100);
  await assertTopicHidden(topic, true);
  await assertReasonDisplay(topic, 'aspect: vârstă');
});
