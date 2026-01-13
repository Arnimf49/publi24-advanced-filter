import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {Page} from "playwright-core";

const setupHideSetting = async (page: Page, criteria: string, options?: {defaultValue?: string | number, value?: string | number, noOpen?: boolean}) => {
  await (await page.$('[data-wwid="menu-button"]')).click();
  await (await page.$('[data-wwid="settings-button"]')).click();
  if (!options?.noOpen) {
    await (await page.$('[data-wwid="auto-hiding"]')).click();
  }
  await (await page.$(`[data-wwcriteria="${criteria}"]`)).click();

  if (options?.value) {
    const input = await page.$(`[data-wwcriteria="${criteria}"] input`);
    expect(await input.getAttribute('value'), ''+options.defaultValue);
    await input.fill('');
    expect(await input.getAttribute('value'), '');
    await input.fill(''+options.value);
    expect(await input.getAttribute('value'), ''+options.value);
  }

  await page.locator('[data-wwid="close"]').click();
}

test('Should automatically hide based on max age.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'maxAge', {defaultValue: 35, value: 26});
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Am 27 de ani', 'Buna');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'peste 26 de ani'});
});

test('Should automatically hide based on min height.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'minHeight', {defaultValue: 160, value: 165});
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'Am 1.64');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'sub 165cm'});
});

test('Should automatically hide based on max height.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'maxHeight', {defaultValue: 175, value: 170});
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'Inaltime 171cm');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'peste 170cm'});
});

test('Should automatically hide based on max weight.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'maxWeight', {defaultValue: 65, value: 55});
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', '56KG');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'peste 55kg'});
});

test('Should automatically hide if trans mentioned.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'trans');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna sunt transsexuala', '');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'transsexual'});
});

test('Should automatically hide if botoxed.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'botox');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'Siliconata');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'siliconată'});
});

test('Should automatically hide if only trips.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'onlyTrips');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'Numai deplasari');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'numai deplasări'});
});

test('Should automatically hide if show web.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'showWeb');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'Ofer show web');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'oferă show web'});
});

test('Should automatically hide if bts risk.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'btsRisc');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'cum vrei tu');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'risc bts'});
});

test('Should automatically hide if party.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'party');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'Fac party si deplasari');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'face party'});
});

test('Should automatically hide if mature.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'mature');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna matură 40 ani', '');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'matură'});
});

test('Should automatically hide for multiple.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'onlyTrips');
  await setupHideSetting(page, 'party', {noOpen: true});
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Numai depalsari', 'Fac party');
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'numai deplasări / face party'});
});

