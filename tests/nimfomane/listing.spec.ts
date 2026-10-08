import {expect, test} from "../helpers/fixture";
import {utils} from "../helpers/utils";
import {utilsNimfomane} from "../helpers/utilsNimfomane";
import {Page} from "playwright-core";

const BAIA_MARE_LISTING = 'https://nimfomane.com/forum/forum/30-escorte-baia-mare/';
const PUBLI_TOPIC_ID = '174418';

// Slows down topic page fetches so the topic analysis stays in-flight long enough
// to reliably observe the analysis loading indicator.
async function slowTopicAnalysis(page: Page, topicId: string) {
  await utils.modifyRouteBody(page, `https://nimfomane.com/forum/topic/${topicId}-**`, () => {}, 1000);
}

test('Should analyze a new topic and show the loading indicator meanwhile.', async ({page}) => {
  await utilsNimfomane.open(page, {url: BAIA_MARE_LISTING});

  const topicId = PUBLI_TOPIC_ID;
  await slowTopicAnalysis(page, topicId);
  await utilsNimfomane.deleteTopicInfoStorage(page, topicId);
  await utilsNimfomane.throttleReload(page);

  const topic = page.locator(`[data-wwtopic="${topicId}"]`);
  await expect(topic).toBeVisible();

  const loadingIndicator = topic.locator('[data-wwid="analysis-loading"]');
  await expect(loadingIndicator).toBeVisible({timeout: 10000});
  await expect(loadingIndicator).toHaveCount(0, {timeout: 30000});

  await expect(topic.locator('[data-wwid="panel"]')).toBeVisible();
  await expect(topic.locator('[data-wwid="toggle-hidden"]')).toBeVisible();
  await expect(topic.locator('[data-wwid="topic-image"]')).toBeVisible();

  await expect.poll(() => utilsNimfomane.getTopicStorageProp(page, topicId, 'url')).not.toBeUndefined();
  await expect.poll(() => utilsNimfomane.getTopicStorageProp(page, topicId, 'escortDeterminationTime')).not.toBeUndefined();
});

test('Should reanalyze a stale topic and show the loading indicator meanwhile.', async ({page}) => {
  await utilsNimfomane.open(page, {url: BAIA_MARE_LISTING});

  const topicId = PUBLI_TOPIC_ID;
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'isOfEscort', false);
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'escortDeterminationTime', Date.now());
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'publiLink', 'https://www.publi24.ro/anunturi/matrimoniale/escorte/anunt/rm/i73f7836f8387058e49hdh7037850330.html');
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'publiLinkDeterminationTime', Date.now() - (8.64e+7 * 11));

  await slowTopicAnalysis(page, topicId);
  await utilsNimfomane.throttleReload(page);

  const loadingIndicator = page.locator(`[data-wwtopic="${topicId}"] [data-wwid="analysis-loading"]`);
  await expect(loadingIndicator).toBeVisible({timeout: 10000});
  await expect(loadingIndicator).toHaveCount(0, {timeout: 30000});

  // The stale determination was refreshed by the reanalysis.
  await expect.poll(
    () => utilsNimfomane.getTopicStorageProp(page, topicId, 'publiLinkDeterminationTime')
  ).toBeGreaterThan(Date.now() - 60000);
});
