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
  const url = new URL(href!);
  const postfixes = [
    '', ' 🙂', ' 😃', ' 😉', ' 😌', ' 😎', ' ⭐', ' 🙏', ' 🌟',
    ' ,', ' -', ' _', ' \'', ' "', ' \\', ' *', ' #', ' ~', ' `', ' /',
  ];

  expect(url.origin + url.pathname).toBe(`https://wa.me/+4${phone}`);
  const message = url.searchParams.get('text')!;
  expect(message.startsWith(testMessage)).toBe(true);
  expect(postfixes).toContain(message.slice(testMessage.length));
});

test('Should not randomize predefined WhatsApp message when randomization is disabled', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="whatsapp-message-switch"]').click();

  const randomizationSwitch = page.locator('[data-wwid="whatsapp-message-randomization-switch"] [role="switch"]');
  await expect(randomizationSwitch).toHaveAttribute('aria-checked', 'true');
  await randomizationSwitch.click();

  const testMessage = 'Mesaj fără randomizare.';
  await page.locator('[data-wwid="whatsapp-message-input"]').fill(testMessage);
  await page.keyboard.press('Escape');

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();
  const href = await (await firstAd.$('a[data-wwid="whatsapp"][target="_blank"]')).getAttribute('href');

  expect(href).toBe(`https://wa.me/+4${phone}?text=${encodeURIComponent(testMessage)}`);
});
