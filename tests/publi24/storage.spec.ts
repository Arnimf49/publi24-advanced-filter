import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should cleanup stale ad storage on startup.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.evaluate(() => {
    const oldTimestamp = Date.now() - 366 * 24 * 60 * 60 * 1000;
    localStorage.setItem('ww2:STALE_NO_SEEN', JSON.stringify({ phone: '0700000001' }));
    localStorage.setItem('ww2:STALE_OLD', JSON.stringify({ phone: '0700000001', lastSeen: oldTimestamp }));
    localStorage.setItem('ww2:FRESH_AD', JSON.stringify({ phone: '0700000001', lastSeen: Date.now() }));
    localStorage.setItem('ww2:phone:0700000001', JSON.stringify({
      ads: [
        'STALE_NO_SEEN|anunturi/matrimoniale/escorte/cluj/cluj-napoca/stale-no-seen/',
        'STALE_OLD|anunturi/matrimoniale/escorte/cluj/cluj-napoca/stale-old/',
        'FRESH_AD|anunturi/matrimoniale/escorte/cluj/cluj-napoca/fresh-ad/'
      ]
    }));
  });

  await page.reload();
  await page.waitForTimeout(700);

  const storageState = await page.evaluate(() => {
    return {
      staleNoSeen: localStorage.getItem('ww2:STALE_NO_SEEN'),
      staleOld: localStorage.getItem('ww2:STALE_OLD'),
      freshAd: localStorage.getItem('ww2:FRESH_AD'),
      phoneItem: localStorage.getItem('ww2:phone:0700000001'),
    };
  });

  expect(storageState.staleNoSeen).toBeNull();
  expect(storageState.staleOld).toBeNull();
  expect(storageState.freshAd).not.toBeNull();
  expect(storageState.phoneItem).toContain('FRESH_AD|');
  expect(storageState.phoneItem).not.toContain('STALE_NO_SEEN|');
  expect(storageState.phoneItem).not.toContain('STALE_OLD|');
});
