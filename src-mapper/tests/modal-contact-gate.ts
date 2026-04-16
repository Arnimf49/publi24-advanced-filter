/**
 * Diagnostic script: open harriet's profile, click WhatsApp button,
 * then run the structured text extraction and check if the contact gate modal appears.
 * Run with: npx tsx src-mapper/tests/modal-contact-gate.ts
 */
import { chromium } from 'playwright';
import { FingerprintGenerator } from 'fingerprint-generator';
import { FingerprintInjector } from 'fingerprint-injector';

const URL = 'https://www.en.realescort.eu/ads/195051/harriet';

async function extractStructuredText(page: import('playwright').Page): Promise<string> {
  // Exact copy of production extractStructuredText from extraction.ts
  return page.evaluate(() => {
    (window as any).__name = (fn: any, _name: string) => fn;

    const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'head', 'meta', 'link']);
    const MAX_DEPTH = 15;
    const MAX_TEXT_LEN = 200;
    const MAX_TOTAL_LINES = 600;

    const isStaticAsset = (href: string): boolean => {
      try {
        const pathname = new window.URL(href, window.location.href).pathname.toLowerCase();
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
          text += (child.textContent || '').replace(/\s+/g, ' ');
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
          return attrs.some(attr => attr.name !== 'href' && attr.name !== 'class' && attr.name !== 'id' && attr.name !== 'data-ai-mapper-id' && attr.name !== 'style' && attr.name !== 'target' && attr.name !== 'rel' && attr.name !== 'title' && attr.name !== 'aria-label');
        }
      }
      return false;
    }

    const lines: string[] = [];

    function walk(el: Element, depth: number): void {
      if (lines.length >= MAX_TOTAL_LINES) {
        return;
      }
      if (depth > MAX_DEPTH) {
        return;
      }

      const tag = el.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) {
        return;
      }
      if (!isVisible(el)) {
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
    if (!el) return { found: false };
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

  console.log('Navigating to:', URL);
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('\n=== BEFORE CLICK: structured text (search for contact gate) ===');
  const before = await extractStructuredText(page);
  const contactLine = before.split('\n').find(l => l.toLowerCase().includes('contact') || l.toLowerCase().includes('verify'));
  console.log('Contact-related lines:', contactLine || '(none found)');

  // Find WhatsApp button - find contact method anchor containing WhatsApp img/text
  console.log('\n=== Checking for WhatsApp button ===');
  // Try the contact-method anchor that has WhatsApp img alt text
  const waBtn = await page.$('a.contact-method:has(img[alt="WhatsApp"]), a[re-modal2*="/api/a/contact"]');
  if (!waBtn) {
    console.log('No WhatsApp contact button found. Listing all a[re-modal2]:');
    const all = await page.$$('a[re-modal2]');
    for (const a of all) {
      console.log(' -', await a.evaluate(el => el.outerHTML.slice(0, 200)));
    }
  } else {
    console.log('Found WhatsApp contact button:', await waBtn.evaluate(el => el.outerHTML.slice(0, 200)));
    console.log('\nClicking WhatsApp contact button...');
    await waBtn.click();
    await page.waitForTimeout(2000);

    console.log('\n=== AFTER CLICK: debug x-modals visibility ===');
    await debugVisibility(page, '.x-modals');
    await debugVisibility(page, '.x-stacked');
    await debugVisibility(page, '.modal-box.ads.contact');
    await debugVisibility(page, '.msgbox4.lg');

    console.log('\n=== AFTER CLICK: structured text (search for contact gate) ===');
    const after = await extractStructuredText(page);
    const idx = after.toLowerCase().indexOf('contact information');
    if (idx !== -1) {
      console.log('✅ FOUND "contact information" in structured text:');
      console.log(after.slice(Math.max(0, idx - 100), idx + 200));
    } else {
      console.log('❌ NOT FOUND. Checking for "verify" or "human"...');
      const lines = after.split('\n').filter(l =>
        l.toLowerCase().includes('verify') || l.toLowerCase().includes('human') ||
        l.toLowerCase().includes('contact') || l.toLowerCase().includes('captcha')
      );
      console.log('Relevant lines:', lines.length ? lines : '(none)');
      console.log('\nFull structured text after click:');
      console.log(after);
    }
  }

  // === Visibility exclusion tests ===
  // Inject elements that should be excluded and one that should be included,
  // then verify the structured text correctly excludes/includes them.
  console.log('\n=== Visibility exclusion tests ===');
  await page.evaluate(() => {
    function makeDiv(id: string, text: string, styles: Partial<CSSStyleDeclaration>) {
      const el = document.createElement('div');
      el.id = id;
      el.textContent = text;
      Object.assign(el.style, styles);
      document.body.appendChild(el);
    }
    makeDiv('test-display-none',   'SHOULD_NOT_APPEAR_DISPLAY_NONE',   { display: 'none' });
    makeDiv('test-visibility-hidden', 'SHOULD_NOT_APPEAR_VIS_HIDDEN',  { visibility: 'hidden' });
    makeDiv('test-opacity-zero',   'SHOULD_NOT_APPEAR_OPACITY_ZERO',   { opacity: '0', width: '100px', height: '20px' });
    makeDiv('test-zero-size',      'SHOULD_NOT_APPEAR_ZERO_SIZE',      { width: '0', height: '0', overflow: 'hidden' });
    makeDiv('test-visible',        'SHOULD_APPEAR_VISIBLE',            { width: '100px', height: '20px', background: 'red' });
  });

  const visTestText = await extractStructuredText(page);
  const checks = [
    { label: 'display:none excluded',       marker: 'SHOULD_NOT_APPEAR_DISPLAY_NONE',   shouldBePresent: false },
    { label: 'visibility:hidden excluded',   marker: 'SHOULD_NOT_APPEAR_VIS_HIDDEN',     shouldBePresent: false },
    { label: 'opacity:0 excluded',           marker: 'SHOULD_NOT_APPEAR_OPACITY_ZERO',   shouldBePresent: false },
    { label: 'zero-size excluded',           marker: 'SHOULD_NOT_APPEAR_ZERO_SIZE',      shouldBePresent: false },
    { label: 'visible element included',     marker: 'SHOULD_APPEAR_VISIBLE',            shouldBePresent: true  },
  ];
  let allPassed = true;
  for (const { label, marker, shouldBePresent } of checks) {
    const present = visTestText.includes(marker);
    const pass = present === shouldBePresent;
    console.log(`${pass ? '✅' : '❌'} ${label}: ${present ? 'present' : 'absent'} (expected: ${shouldBePresent ? 'present' : 'absent'})`);
    if (!pass) allPassed = false;
  }
  console.log(allPassed ? '\n✅ All visibility checks passed' : '\n❌ Some visibility checks FAILED');

  console.log('\nDone. Browser will stay open for 10s for inspection...');
  await page.waitForTimeout(10000);
  await browser.close();
})();
