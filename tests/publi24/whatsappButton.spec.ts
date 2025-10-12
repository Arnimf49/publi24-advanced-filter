import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should open whatsapp with one click.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);

  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();
  expect(await (await firstAd.$('a[data-wwid="whatsapp"][target="_blank"]')).getAttribute('href'))
    .toEqual(`https://wa.me/+4${phone}`);
})

