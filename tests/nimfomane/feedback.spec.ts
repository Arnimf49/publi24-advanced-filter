import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

const NIMFOMANE_URL = 'https://nimfomane.com/forum/forum/201-discutii-generale-cluj/';
const SUPABASE_FEEDBACK_URL = '**/rest/v1/feedback_v1**';

test('Should send feedback successfully and show error on failure.', async ({ page }) => {
  await utilsNimfomane.open(page, {url: NIMFOMANE_URL});

  await page.route(SUPABASE_FEEDBACK_URL, route => route.fulfill({ status: 201, body: '' }));

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="feedback-button"]').click();

  const modal = page.locator('[data-wwid="feedback-modal"]');
  await modal.locator('textarea').fill('Test feedback message');

  const [request] = await Promise.all([
    page.waitForRequest(req => req.url().includes('/rest/v1/feedback_v1')),
    modal.locator('button', {hasText: 'Trimite'}).click(),
  ]);

  expect(request.method()).toBe('POST');
  const body = JSON.parse(request.postData()!);
  expect(body.message).toBe('Test feedback message');
  expect(body.user_id).toBeTruthy();
  await expect(modal.locator('text=Mesajul a fost trimis')).toBeVisible();

  // reopen and test failure
  await page.locator('[data-wwid="close"]').click();
  await page.route(SUPABASE_FEEDBACK_URL, route => route.fulfill({ status: 500, body: '' }));

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="feedback-button"]').click();
  await modal.locator('textarea').fill('Another message');
  await modal.locator('button', {hasText: 'Trimite'}).click();
  await expect(modal.locator('text=Eroare la trimitere')).toBeVisible();
});

test('Should validate char limit and daily send limit.', async ({ page }) => {
  await utilsNimfomane.open(page, {url: NIMFOMANE_URL});

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="feedback-button"]').click();

  const modal = page.locator('[data-wwid="feedback-modal"]');
  await modal.locator('textarea').fill('a'.repeat(701));
  await expect(modal.locator('button', {hasText: 'Trimite'})).toBeDisabled();

  await page.locator('[data-wwid="close"]').click();

  const timestamps = [Date.now() - 1000, Date.now() - 2000, Date.now() - 3000];
  await page.evaluate((ts) => {
    localStorage.setItem('ww:feedback-sent-today', JSON.stringify({ timestamps: ts }));
  }, timestamps);

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="feedback-button"]').click();
  await expect(modal.locator('text=limita de 3 mesaje')).toBeVisible();
  await expect(modal.locator('textarea')).not.toBeVisible();
});
