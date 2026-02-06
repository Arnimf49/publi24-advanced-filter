import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should open whatsapp with one click.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);

  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();
  expect(await (await firstAd.$('a[data-wwid="whatsapp"][target="_blank"]')).getAttribute('href'))
    .toEqual(`https://wa.me/+4${phone}`);
})

test('Should include predefined message in WhatsApp link when enabled', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="whatsapp-message-switch"]').click();

  const testMessage = 'Bună! Am văzut anunțul tău.';
  await page.locator('[data-wwid="whatsapp-message-input"]').fill(testMessage);

  await page.keyboard.press('Escape');

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();

  const href = await (await firstAd.$('a[data-wwid="whatsapp"][target="_blank"]')).getAttribute('href');
  expect(href).toBe(`https://wa.me/+4${phone}?text=${encodeURIComponent(testMessage)}`);
});

