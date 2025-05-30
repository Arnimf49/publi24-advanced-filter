import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should open whatsapp with one click.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstArticle = (await page.$$('[data-articleid]'))[0];
  await page.waitForTimeout(1000);

  const phone = await (await firstArticle.$('[data-wwid="phone-number"]')).innerText();
  expect(await (await firstArticle.$('a[data-wwid="whatsapp"][target="_blank"]')).getAttribute('href'))
    .toEqual(`https://wa.me/+4${phone}`);
})

