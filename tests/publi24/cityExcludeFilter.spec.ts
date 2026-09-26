import {test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {expect} from "../helpers/fixture";

const COUNTY_LISTING = 'https://www.publi24.ro/anunturi/matrimoniale/escorte/cluj/';

const exclusionButton = (page: Parameters<typeof utilsPubli.open>[1]) => (
  page.locator('[data-wwid^="exclusion-filter-"] button').first()
);

test('Can exclude cities and report the selected and removed counts.', async ({page, context}) => {
  await utilsPubli.open(context, page, {clearStorage: true, location: 'cluj/'});
  await page.goto(COUNTY_LISTING);

  const button = exclusionButton(page);
  await button.waitFor();

  const locations = await page.locator('[data-articleid] .article-location').allTextContents();
  const excludedLocations = locations.filter((location) => /Cluj-Napoca|Floresti/i.test(location));
  expect(excludedLocations.length).toBeGreaterThan(0);

  await button.dispatchEvent('click');
  const modal = page.locator('[data-wwid="exclusion-filter-modal"]');
  await expect(modal).toBeVisible();
  await modal.getByRole('button', {name: 'Cluj-Napoca'}).click();
  await modal.getByRole('button', {name: 'Floresti'}).click();
  await expect(modal.getByRole('button', {name: 'Cluj-Napoca'})).toHaveAttribute('aria-pressed', 'true');
  await expect(modal.getByRole('button', {name: 'Floresti'})).toHaveAttribute('aria-pressed', 'true');

  await modal.getByRole('button', {name: 'Confirmă'}).click();
  await page.waitForTimeout(900);

  await expect(page.locator('[data-articleid]').filter({hasText: 'Cluj-Napoca'})).toHaveCount(0);
  await expect(page.locator('[data-articleid]').filter({hasText: 'Floresti'})).toHaveCount(0);
  await expect(exclusionButton(page).locator('.active-filters-bubble')).toHaveText('2');
  await expect(page.locator('[data-wwid="excluded-count-indicator"]'))
    .toHaveText(`${excludedLocations.length} excluse prin filtru`);
});

test('Does not show for an unselected county or a selected city.', async ({page, context}) => {
  await utilsPubli.open(context, page, {clearStorage: true, location: ''});
  await expect(page.locator('[data-wwid^="exclusion-filter-"]')).toHaveCount(0);

  await page.goto('https://www.publi24.ro/anunturi/matrimoniale/escorte/cluj/cluj-napoca/');
  await page.waitForTimeout(700);
  await expect(page.locator('[data-wwid^="exclusion-filter-"]')).toHaveCount(0);
});

test('Cleans exclusions when changing county.', async ({page, context}) => {
  await utilsPubli.open(context, page, {clearStorage: true, location: 'cluj/'});
  await page.evaluate(() => {
    localStorage.setItem('ww:excluded-cities', JSON.stringify(['Cluj-Napoca', 'Floresti']));
  });

  await page.goto('https://www.publi24.ro/anunturi/matrimoniale/escorte/brasov/');
  await page.waitForTimeout(900);

  await expect.poll(async () => page.evaluate(() => (
    JSON.parse(localStorage.getItem('ww:excluded-cities') || '[]')
  ))).toEqual([]);
});
