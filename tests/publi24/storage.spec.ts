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

test('Should remove orphaned phone ad references while keeping live phone data.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.evaluate(() => {
    localStorage.setItem('ww2:LIVE_REFERENCE_AD', JSON.stringify({
      phone: '0700000004',
      lastSeen: Date.now(),
    }));
    localStorage.setItem('ww2:phone:0700000004', JSON.stringify({
      hidden: true,
      ads: [
        'LIVE_REFERENCE_AD|anunturi/matrimoniale/escorte/cluj/cluj-napoca/live-reference-ad/',
        'MISSING_REFERENCE_AD|anunturi/matrimoniale/escorte/cluj/cluj-napoca/missing-reference-ad/',
      ],
    }));
  });

  await page.reload();
  await page.waitForTimeout(700);

  const storageState = await page.evaluate(() => {
    return {
      liveAd: localStorage.getItem('ww2:LIVE_REFERENCE_AD'),
      phoneItem: localStorage.getItem('ww2:phone:0700000004'),
    };
  });

  expect(storageState.liveAd).not.toBeNull();
  expect(storageState.phoneItem).toContain('LIVE_REFERENCE_AD|');
  expect(storageState.phoneItem).not.toContain('MISSING_REFERENCE_AD|');
  expect(storageState.phoneItem).toContain('"hidden":true');
});

test('Should cleanup orphaned phone storage when all its ads go stale.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.evaluate(() => {
    const oldTimestamp = Date.now() - 366 * 24 * 60 * 60 * 1000;
    localStorage.setItem('ww2:STALE_ORPHAN_1', JSON.stringify({ phone: '0700000002', lastSeen: oldTimestamp }));
    localStorage.setItem('ww2:STALE_ORPHAN_2', JSON.stringify({ phone: '0700000002', lastSeen: oldTimestamp }));
    localStorage.setItem('ww2:phone:0700000002', JSON.stringify({
      ads: [
        'STALE_ORPHAN_1|anunturi/matrimoniale/escorte/cluj/cluj-napoca/stale-orphan-1/',
        'STALE_ORPHAN_2|anunturi/matrimoniale/escorte/cluj/cluj-napoca/stale-orphan-2/'
      ]
    }));
  });

  await page.reload();
  await page.waitForTimeout(700);

  const storageState = await page.evaluate(() => {
    return {
      staleOrphan1: localStorage.getItem('ww2:STALE_ORPHAN_1'),
      staleOrphan2: localStorage.getItem('ww2:STALE_ORPHAN_2'),
      phoneItem: localStorage.getItem('ww2:phone:0700000002'),
    };
  });

  expect(storageState.staleOrphan1).toBeNull();
  expect(storageState.staleOrphan2).toBeNull();
  expect(storageState.phoneItem).toBeNull();
});

test('Should keep favorited phone in favorites list even when orphaned.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.evaluate(() => {
    const oldTimestamp = Date.now() - 366 * 24 * 60 * 60 * 1000;
    localStorage.setItem('ww2:STALE_FAV_AD', JSON.stringify({ phone: '0700000003', lastSeen: oldTimestamp }));
    localStorage.setItem('ww2:phone:0700000003', JSON.stringify({
      ads: [
        'STALE_FAV_AD|anunturi/matrimoniale/escorte/cluj/cluj-napoca/stale-fav-ad/'
      ]
    }));
    localStorage.setItem('ww:favs', JSON.stringify(['0700000003']));
  });

  await page.reload();
  await page.waitForTimeout(700);

  const storageState = await page.evaluate(() => {
    return {
      staleFavAd: localStorage.getItem('ww2:STALE_FAV_AD'),
      phoneItem: localStorage.getItem('ww2:phone:0700000003'),
      favorites: localStorage.getItem('ww:favs'),
    };
  });

  expect(storageState.staleFavAd).toBeNull();
  expect(storageState.phoneItem).not.toBeNull();
  expect(storageState.favorites).toContain('0700000003');
});

test('Should remove an oversized ad during the one-month retention pass.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.evaluate(() => {
    const oneAndHalfMonthsAgo = Date.now() - 45 * 24 * 60 * 60 * 1000;
    localStorage.setItem('ww2:OVERSIZED_RECENT_AD', JSON.stringify({
      phone: '0700000005',
      lastSeen: oneAndHalfMonthsAgo,
      payload: 'x'.repeat(4_300_000),
    }));
  });

  await page.reload();
  await page.waitForTimeout(700);

  const adItem = await page.evaluate(() => localStorage.getItem('ww2:OVERSIZED_RECENT_AD'));
  expect(adItem).toBeNull();
});

test('Should stop cleanup after removing an oversized seven-month-old ad.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.evaluate(() => {
    const sevenMonthsAgo = Date.now() - 210 * 24 * 60 * 60 * 1000;
    const fiveMonthsAgo = Date.now() - 150 * 24 * 60 * 60 * 1000;
    localStorage.setItem('ww2:OVERSIZED_SEVEN_MONTH_AD', JSON.stringify({
      phone: '0700000006',
      lastSeen: sevenMonthsAgo,
      payload: 'x'.repeat(4_300_000),
    }));
    localStorage.setItem('ww2:FIVE_MONTH_AD', JSON.stringify({
      phone: '0700000007',
      lastSeen: fiveMonthsAgo,
    }));
  });

  await page.reload();
  await page.waitForTimeout(700);

  const storageState = await page.evaluate(() => {
    return {
      sevenMonthAd: localStorage.getItem('ww2:OVERSIZED_SEVEN_MONTH_AD'),
      fiveMonthAd: localStorage.getItem('ww2:FIVE_MONTH_AD'),
    };
  });

  expect(storageState.sevenMonthAd).toBeNull();
  expect(storageState.fiveMonthAd).not.toBeNull();
});
