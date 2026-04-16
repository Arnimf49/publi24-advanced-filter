/**
 * Diagnostic: open harriet's profile, click the WhatsApp contact button,
 * then verify the contact-gate modal appears in structured text.
 *
 * Run with: npx tsx src-mapper/tests/contact-gate-diagnostic.ts
 */
import { chromium } from 'playwright';
import { FingerprintGenerator } from 'fingerprint-generator';
import { FingerprintInjector } from 'fingerprint-injector';

const TARGET_URL = 'https://www.en.realescort.eu/ads/195051/harriet';

async function extractStructuredText(page: import('playwright').Page): Promise<string> {
  return page.evaluate(() => {
    const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'head', 'meta', 'link']);
    const MAX_DEPTH = 15;
    const MAX_TEXT_LEN = 200;
    const MAX_TOTAL_LINES = 600;

    const isStaticAsset = (href: string): boolean => {
      try {
        const pathname = new URL(href, window.location.href).pathname.toLowerCase();
        return /\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|woff|woff2|ttf|mp4|mp3|pdf)$/.test(pathname);
      } catch {
        return false;
      }
    };

    const getMeaningfulHref = (el: Element): string | null => {
      if (el.tagName.toLowerCase() !== 'a') {
        return null;
      }
      const href = (el as HTMLAnchorElement).getAttribute('href');
      if (!href || href === '#' || href.trim() === '') {
        return null;
      }
      if (isStaticAsset(href)) {
        return null;
      }
      return href.trim();
    };

    function isVisible(el: Element): boolean {
      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') {
        return false;
      }
      if (parseFloat(style.opacity) === 0) {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    function getDirectText(el: Element): string {
      let text = '';
      for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          text += (child.textContent ?? '').replace(/\s+/g, ' ');
        }
      }
      return text.trim().slice(0, MAX_TEXT_LEN);
    }

    function hasClickHandler(el: Element): boolean {
      if ((el as HTMLElement).onclick !== null) {
        return true;
      }
      if (el.tagName.toLowerCase() === 'a') {
        const href = (el as HTMLAnchorElement).getAttribute('href') ?? '';
        if (href === '' || href === '#') {
          const attrs = Array.from(el.attributes);
          return attrs.some((attr) =>
            !['href', 'class', 'id', 'data-ai-mapper-id', 'style', 'target', 'rel', 'title', 'aria-label'].includes(attr.name),
          );
        }
      }
      return false;
    }

    const lines: string[] = [];

    function walk(el: Element, depth: number): void {
      if (lines.length >= MAX_TOTAL_LINES || depth > MAX_DEPTH) {
        return;
      }

      const tag = el.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag) || !isVisible(el)) {
        return;
      }

      const directText = getDirectText(el);
      const href = getMeaningfulHref(el);
      const clickable = !href && hasClickHandler(el);

      if (directText || href || clickable) {
        const hrefSuffix = href ? ` [href=${href}]` : '';
        const clickSuffix = clickable ? ' [click]' : '';
        const textPart = directText ? `"${directText}"` : '';
        lines.push(`${'  '.repeat(depth)}${tag}: ${textPart}${hrefSuffix}${clickSuffix}`);
      }

      for (const child of Array.from(el.children)) {
        walk(child, depth + 1);
      }
    }

    if (document.body) {
      walk(document.body, 0);
    }

    return lines.join('\n');
  });
}

async function debugVisibility(page: import('playwright').Page, selector: string): Promise<void> {
  const info = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) {
      return { found: false };
    }
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      found: true,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      position: style.position,
      rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
      innerHTML: el.innerHTML.slice(0, 200),
    };
  }, selector);
  console.log(`[${selector}]:`, JSON.stringify(info, null, 2));
}

(async () => {
  const { fingerprint, headers } = new FingerprintGenerator({ locales: ['en-US'] }).getFingerprint({
    devices: ['desktop'],
    operatingSystems: ['linux'],
    browserListQuery: 'last 10 Chrome versions',
  });

  const browser = await chromium.launch({
    headless: false,
    channel: 'chromium',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: null,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { 'accept-language': headers['accept-language'] },
    userAgent: fingerprint.navigator.userAgent,
  });
  await new FingerprintInjector().attachFingerprintToPlaywright(context, { fingerprint, headers });
  const page = await context.newPage();

  console.log('Navigating to:', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('\n=== BEFORE CLICK: structured text (contact/verify lines) ===');
  const before = await extractStructuredText(page);
  const contactLineBefore = before.split('\n').find((l) => l.toLowerCase().includes('contact') || l.toLowerCase().includes('verify'));
  console.log('Contact-related lines:', contactLineBefore ?? '(none found)');

  console.log('\n=== Checking for WhatsApp contact button ===');
  const waBtn = await page.$('a.contact-method:has(img[alt="WhatsApp"]), a[re-modal2*="/api/a/contact"]');
  if (!waBtn) {
    console.log('No WhatsApp contact button found. Listing all a[re-modal2]:');
    const all = await page.$$('a[re-modal2]');
    for (const a of all) {
      console.log(' -', await a.evaluate((el) => el.outerHTML.slice(0, 200)));
    }
  } else {
    console.log('Found:', await waBtn.evaluate((el) => el.outerHTML.slice(0, 200)));
    console.log('\nClicking WhatsApp contact button...');
    await waBtn.click();
    await page.waitForTimeout(2000);

    console.log('\n=== AFTER CLICK: modal visibility ===');
    await debugVisibility(page, '.x-modals');
    await debugVisibility(page, '.x-stacked');
    await debugVisibility(page, '.modal-box.ads.contact');
    await debugVisibility(page, '.msgbox4.lg');

    console.log('\n=== AFTER CLICK: structured text ===');
    const after = await extractStructuredText(page);
    const idx = after.toLowerCase().indexOf('contact information');
    if (idx !== -1) {
      console.log('✅ FOUND "contact information":');
      console.log(after.slice(Math.max(0, idx - 100), idx + 200));
    } else {
      console.log('❌ NOT FOUND. Checking for "verify"/"human"/"captcha"...');
      const relevant = after.split('\n').filter((l) =>
        ['verify', 'human', 'contact', 'captcha'].some((kw) => l.toLowerCase().includes(kw)),
      );
      console.log('Relevant lines:', relevant.length ? relevant : '(none)');
    }
  }

  console.log('\nDone. Browser will stay open for 10s...');
  await page.waitForTimeout(10_000);
  await browser.close();
})();
