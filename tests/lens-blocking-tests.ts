/**
 * Google Lens 403 fix – 10 variations
 *
 * Run all:         npx tsx tests/lens-403-fix.ts
 * Run variation N: npx tsx tests/lens-403-fix.ts <N>
 *
 * Prerequisites (already done):
 *   npm install patchright
 *   npx patchright install chromium
 *
 * Screenshots land in: test-results/lens-403-debug/
 */

import { chromium } from 'playwright';
import { chromium as patchrightChromium } from 'patchright';
import { FingerprintGenerator } from 'fingerprint-generator';
import { FingerprintInjector } from 'fingerprint-injector';
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_URL =
  'https://s3.publi24.ro/vertical-ro-f646bd5a/top/20260513/1422/7637104d1ca15f6617105301477d721a.webp';

const SCREENSHOTS_DIR = 'test-results/lens-403-debug';
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Mirrors the production URL construction in adActions.ts */
function lensUrl(overrides: Record<string, string> = {}): string {
  const encodedUrl = encodeURIComponent(IMAGE_URL);
  const params = new URLSearchParams({ hl: 'ro', ...overrides });
  return `https://lens.google.com/uploadbyurl?url=${encodedUrl}&${params}`;
}

function trackResponses(page: any): void {
  page.on('response', (r: any) => {
    if (r.url().includes('lens.google.com')) {
      const ok = r.status() < 400;
      console.log(`  ${ok ? '✓' : '✗'} HTTP ${r.status()} — ${r.url().slice(0, 100)}`);
    }
  });
}

async function withFingerprint(launcher: any): Promise<{ browser: any; ctx: any }> {
  const { fingerprint, headers } = new FingerprintGenerator({ locales: ['en-US'] }).getFingerprint({
    devices: ['desktop'],
    operatingSystems: ['windows'],
  });

  const launchOpts: any = {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  };

  const browser = await launcher.launch(launchOpts);

  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    userAgent: fingerprint.navigator.userAgent,
    extraHTTPHeaders: { 'accept-language': headers['accept-language'] },
  });

  await new FingerprintInjector().attachFingerprintToPlaywright(ctx, { fingerprint, headers });
  return { browser, ctx };
}

async function run(num: number, label: string, fn: () => Promise<void>): Promise<void> {
  console.log(`\n${'─'.repeat(65)}`);
  console.log(`[${num}/10] ${label}`);
  console.log('─'.repeat(65));
  try {
    await fn();
    console.log('  → done');
  } catch (err: any) {
    console.error(`  → ERROR: ${err.message}`);
  }
}

// ── Variations ────────────────────────────────────────────────────────────────

const variations: Array<{ label: string; fn: () => Promise<void> }> = [
  {
    // Reproduce current state: FingerprintGenerator/Injector + plain playwright
    label: 'Baseline (playwright): FingerprintGenerator + FingerprintInjector, uploadbyurl?hl=ro',
    fn: async () => {
      const { browser, ctx } = await withFingerprint(chromium);
      const page = await ctx.newPage();
      trackResponses(page);
      await page.goto(lensUrl(), { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-baseline.png') });
      await browser.close();
    },
  },
  {
    // Stealth-patched Chromium: most direct fix for automation-detection-based 403
    label: 'Patchright: basic launch, same URL as baseline',
    fn: async () => {
      const browser = await patchrightChromium.launch({ headless: false, args: ['--no-sandbox'] });
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
      const page = await ctx.newPage();
      trackResponses(page);
      await page.goto(lensUrl(), { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-patchright-basic.png') });
      await browser.close();
    },
  },
  {
    // Establish Google cookies/consent before hitting Lens
    label: 'Patchright: warm-up visit to google.com first, then Lens',
    fn: async () => {
      const browser = await patchrightChromium.launch({ headless: false, args: ['--no-sandbox'] });
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
      const page = await ctx.newPage();
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      trackResponses(page);
      await page.goto(lensUrl(), { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-patchright-warmup.png') });
      await browser.close();
    },
  },
  {
    // Remove hl=ro entirely – locale param may be triggering a block
    label: 'Patchright: bare URL without any hl param',
    fn: async () => {
      const browser = await patchrightChromium.launch({ headless: false, args: ['--no-sandbox'] });
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
      const page = await ctx.newPage();
      const url = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(IMAGE_URL)}`;
      trackResponses(page);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-patchright-no-hl.png') });
      await browser.close();
    },
  },
  {
    // English locale instead of Romanian – may bypass geo-specific restrictions
    label: 'Patchright: hl=en instead of hl=ro',
    fn: async () => {
      const browser = await patchrightChromium.launch({ headless: false, args: ['--no-sandbox'] });
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
      const page = await ctx.newPage();
      trackResponses(page);
      await page.goto(lensUrl({ hl: 'en' }), { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-patchright-hl-en.png') });
      await browser.close();
    },
  },
  {
    // Chrome sends this when user picks "Search image with Google" from context menu
    label: 'Patchright: source=chrome.element.menu param',
    fn: async () => {
      const browser = await patchrightChromium.launch({ headless: false, args: ['--no-sandbox'] });
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
      const page = await ctx.newPage();
      trackResponses(page);
      await page.goto(
        lensUrl({ source: 'chrome.element.menu' }),
        { waitUntil: 'domcontentloaded', timeout: 20000 },
      );
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-patchright-source.png') });
      await browser.close();
    },
  },
  {
    // Extra tracking params Chrome appends natively: ep=subb, re=df, st=<timestamp>
    label: 'Patchright: ep=subb&re=df&st=<timestamp> (Chrome-native params)',
    fn: async () => {
      const browser = await patchrightChromium.launch({ headless: false, args: ['--no-sandbox'] });
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
      const page = await ctx.newPage();
      trackResponses(page);
      await page.goto(
        lensUrl({ ep: 'subb', re: 'df', st: String(Date.now()) }),
        { waitUntil: 'domcontentloaded', timeout: 20000 },
      );
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-patchright-extra-params.png') });
      await browser.close();
    },
  },
  {
    // Google may validate that the request came from a Google-owned page
    label: 'Patchright: Referer: https://www.google.com/ request header',
    fn: async () => {
      const browser = await patchrightChromium.launch({ headless: false, args: ['--no-sandbox'] });
      const ctx = await browser.newContext({
        viewport: { width: 1600, height: 900 },
        extraHTTPHeaders: { referer: 'https://www.google.com/' },
      });
      const page = await ctx.newPage();
      trackResponses(page);
      await page.goto(lensUrl(), { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-patchright-referer.png') });
      await browser.close();
    },
  },
  {
    // Patchright + aggressive anti-automation Chrome flags
    label: 'Patchright: disable-blink-features=AutomationControlled + exclude-switches=enable-automation',
    fn: async () => {
      const browser = await patchrightChromium.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--exclude-switches=enable-automation',
          '--disable-infobars',
        ],
      });
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
      const page = await ctx.newPage();
      trackResponses(page);
      await page.goto(lensUrl(), { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-patchright-stealth-args.png') });
      await browser.close();
    },
  },
  {
    // Maximum stealth: patchright + real browser fingerprint injected
    label: 'Patchright: combined with FingerprintGenerator + FingerprintInjector',
    fn: async () => {
      const { browser, ctx } = await withFingerprint(patchrightChromium);
      const page = await ctx.newPage();
      trackResponses(page);
      await page.goto(lensUrl(), { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-patchright-fingerprint.png') });
      await browser.close();
    },
  },
  {
    // Plain playwright + FingerprintGenerator/Injector but no hl param
    label: 'Baseline (playwright): FingerprintGenerator + FingerprintInjector, no hl param',
    fn: async () => {
      const { browser, ctx } = await withFingerprint(chromium);
      const page = await ctx.newPage();
      const url = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(IMAGE_URL)}`;
      trackResponses(page);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-baseline-no-hl.png') });
      await browser.close();
    },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

const targetArg = process.argv[2] ? parseInt(process.argv[2], 10) : null;

if (targetArg !== null && (targetArg < 1 || targetArg > variations.length || isNaN(targetArg))) {
  console.error(`Invalid variation number. Pick 1–${variations.length}.`);
  process.exit(1);
}

const indices = targetArg !== null
  ? [targetArg - 1]
  : variations.map((_, i) => i);

for (const i of indices) {
  await run(i + 1, variations[i].label, variations[i].fn);
}

console.log(`\n✓ Screenshots saved to ${SCREENSHOTS_DIR}/`);
