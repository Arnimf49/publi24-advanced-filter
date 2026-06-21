import {expect, test} from "../helpers/fixture";
import {ElementHandle} from "playwright-core";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should show inspector-escorte favicon on duplicate button when integration enabled', async ({ page, context }) => {
  await utilsPubli.open(context, page, {inspectorEscorte: true});

  const ad = await utilsPubli.findAdWithDuplicates(page);

  await ad.waitForSelector('[data-wwid="duplicates-container"] img[src*="inspector-escorte"]');
});

test('Should show source banner in duplicates modal when integration enabled', async ({ page, context }) => {
  await utilsPubli.open(context, page, {inspectorEscorte: true});

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await ad.$('[data-wwid="duplicates"]')).click();

  await page.waitForSelector('[data-wwid="ads-modal"]');
  await expect(page.locator('[data-wwid="source-banner"]')).toBeVisible();
  await expect(page.locator('[data-wwid="source-banner"]')).toContainText('inspector-escorte.com');
});

test('Should show source banner in phone search modal when integration enabled', async ({ page, context }) => {
  await utilsPubli.open(context, page, {inspectorEscorte: true});

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="phone-search-button"]').click();
  await page.waitForSelector('[data-wwid="ads-modal"]');

  await page.locator('[data-wwid="phone-input"]').type(phone);
  await page.waitForTimeout(2000);

  await expect(page.locator('[data-wwid="source-banner"]')).toBeVisible();
});

test('Should paginate inspector escorte ads correctly.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {inspectorEscorte: true});

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const phone = await (await ad.$('[data-wwid="phone-number"]')).innerText();
  const adUrl = await (await ad.$('.article-title a')).evaluate((el: HTMLAnchorElement) => el.href);

  const noDupAd = await utilsPubli.findAdWithoutDuplicates(page);
  const noDupUrl = await (await noDupAd.$('.article-title a')).evaluate((el: HTMLAnchorElement) => el.href);

  await context.route('https://api.inspector-escorte.com/v1/ads*', (route) => {
    const url = route.request().url();
    if (url.includes('phone=test')) {
      return route.fulfill({ status: 200, body: JSON.stringify({data: []}), contentType: 'application/json' });
    }

    const requestPhone = new URL(url).searchParams.get('phone') || '';
    if (requestPhone === phone) {
      const ads = Array.from({length: 20}, (_, i) => ({
        id: `ie-${i}`,
        title: `Ad ${i}`,
        description: 'desc',
        phone: requestPhone,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        geolocation: '',
        images: [],
        urls: {'inspector-escorte': `https://inspector-escorte.com/ad/${i}`, publi24: i < 15 ? adUrl : noDupUrl},
      }));
      return route.fulfill({ status: 200, body: JSON.stringify({data: ads}), contentType: 'application/json' });
    }

    return route.fulfill({ status: 200, body: JSON.stringify({data: []}), contentType: 'application/json' });
  });

  await page.goto(adUrl);
  await page.waitForTimeout(1500);

  await page.locator('[data-wwid="duplicates"]').click();
  await page.waitForTimeout(200);

  const modal = page.locator('[data-wwid="ads-modal"]');
  await expect(modal).toBeVisible();

  const sourceBanner = modal.locator('[data-wwid="source-banner"]');
  await expect(sourceBanner).toBeVisible();
  await expect(sourceBanner).toContainText('Sursa duplicatelor: inspector-escorte.com');
  await expect(sourceBanner.locator('a')).toHaveAttribute('href', `https://inspector-escorte.com/phone/${phone}`);

  await expect(modal.locator('[data-articleid]')).toHaveCount(15, { timeout: 60000 });

  const loadMoreButton = modal.locator('[data-wwid="load-more"]');
  await expect(loadMoreButton).toBeVisible();
  await expect(loadMoreButton).toHaveText('încarcă mai multe (+5)');
  await expect(modal.locator('[data-wwid="count"]')).toHaveText('20');

  await modal.evaluate((el: HTMLElement) => { el.scrollTop = el.scrollHeight; });
  await expect(modal.locator('[data-wwid="results-count"]')).toBeVisible();

  await Promise.all([
    expect(loadMoreButton).toHaveText('Se încarcă...'),
    expect(loadMoreButton).toBeDisabled(),
    loadMoreButton.click(),
  ]);

  await expect(loadMoreButton).not.toBeVisible({ timeout: 60000 });

  await expect(modal.locator('[data-articleid]').nth(14)).toBeVisible();

  await expect(modal.locator('[data-articleid]')).toHaveCount(20);
  await expect(modal.locator('[data-wwid="count"]')).toHaveText('20');
});
