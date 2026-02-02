import {utils} from "../helpers/utils";
import {expect, Page} from "playwright/test";
import {test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

async function assertWhatsappButton(page: Page, topicId: string, expectedPhone: string) {
  const whatsappButton = page.locator(`[data-wwtopic="${topicId}"] a[href*="wa.me"]`);
  await expect(whatsappButton).toBeVisible({timeout: 16000});

  const href = await whatsappButton.getAttribute('href');
  expect(href).toBe(`https://wa.me/+4${expectedPhone}`);
}

async function findTopicWithPhoneInTitle(page: Page) {
  const topicWithPhone = await page.evaluate(() => {
    const topics = document.querySelectorAll('[data-wwtopic]');
    for (const topic of topics) {
      const titleElement = topic.querySelector('.ipsDataItem_title a[data-ipshover]');
      const titleText = titleElement.textContent;
      const phoneMatch = titleText.match(/07(\d ?){8}/);
      if (phoneMatch) {
        return {
          id: topic.getAttribute('data-wwtopic'),
          phone: phoneMatch[0].replace(/\s/g, ''),
        };
      }
    }
    return null;
  });

  if (!topicWithPhone) {
    throw new Error('No topic with phone found in current page');
  }

  return topicWithPhone;
}

async function setupEscortTopicWithoutPhoneInTitle(page: Page) {
  const {user} = await utilsNimfomane.waitForFirstImage(page);
  const profileLink = (await utilsNimfomane.getUserProfileLink(page, user)).replace(/\/$/, '');

  const topicId = '174418';

  await utilsNimfomane.deleteTopicInfoStorage(page, topicId);
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'isOfEscort', true);
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'escortDeterminationTime', Date.now());
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'ownerUser', user);
  await utilsNimfomane.setEscortStorageProp(page, user, 'phone', undefined);
  await utilsNimfomane.setEscortStorageProp(page, user, 'phoneDeterminationTime', undefined);

  return {topicId, profileLink};
}

test('Should analyze phone from escort topic title and display whatsapp button.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {id: topicId, phone} = await findTopicWithPhoneInTitle(page);
  const owner = await utilsNimfomane.getTopicStorageProp(page, topicId, 'ownerUser');

  await utilsNimfomane.deleteTopicInfoStorage(page, topicId);
  if (owner) {
    await utilsNimfomane.deleteEscortStorage(page, owner);
  }

  await utilsNimfomane.throttleReload(page);
  await assertWhatsappButton(page, topicId, phone);
});

test('Should analyze phone from publi topic title and display whatsapp button.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {id: topicId, phone} = await findTopicWithPhoneInTitle(page);

  await utilsNimfomane.deleteTopicInfoStorage(page, topicId);
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'isOfEscort', false);
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'escortDeterminationTime', Date.now());
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'publiLink', 'https://..');
  await utilsNimfomane.setTopicStorageProp(page, topicId, 'publiLinkDeterminationTime', Date.now());

  await utilsNimfomane.throttleReload(page);
  await assertWhatsappButton(page, topicId, phone);
});

test('Should get escort phone from topics lists if not found previously.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {topicId, profileLink} = await setupEscortTopicWithoutPhoneInTitle(page);

  await utils.modifyRouteBody(page, profileLink + '/content/?type=forums_topic', ($) => {
    const firstTopicTitle = $('.ipsDataItem_title').first();
    firstTopicTitle.text('My topic with phone 0723456789');
  });

  await utilsNimfomane.goto(page, 'https://nimfomane.com/forum/forum/30-escorte-baia-mare/');
  await assertWhatsappButton(page, topicId, '0723456789');
});

test('Should get escort phone from profile page if not found previously.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {topicId, profileLink} = await setupEscortTopicWithoutPhoneInTitle(page);

  await utils.modifyRouteBody(page, profileLink + '/content/?type=forums_topic', ($) => {
    $('.ipsDataItem_title').remove();
  });
  await utils.modifyRouteBody(page, profileLink, ($) => {
    const profileItem = $('.ipsDataItem_generic').first();
    profileItem.text('0734567890');
  });

  await utilsNimfomane.goto(page, 'https://nimfomane.com/forum/forum/30-escorte-baia-mare/');
  await assertWhatsappButton(page, topicId, '0734567890');
});

test('Should get escort phone from first page content list if not found previously.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {topicId, profileLink} = await setupEscortTopicWithoutPhoneInTitle(page);

  await utils.modifyRouteBody(page, profileLink + '/content/?type=forums_topic', ($) => {
    $('.ipsDataItem_title').remove();
  });
  await utils.modifyRouteBody(page, profileLink, ($) => {
    $('.ipsDataItem_generic').remove();
  });
  await utils.modifyRouteBody(page, profileLink + '/content/?type=forums_topic_post', ($) => {
    const firstComment = $('[data-role="commentContent"]').first();
    firstComment.text('My latest post 0745678901 contact me');
  });

  await utilsNimfomane.goto(page, 'https://nimfomane.com/forum/forum/30-escorte-baia-mare/');
  await assertWhatsappButton(page, topicId, '0745678901');
});
