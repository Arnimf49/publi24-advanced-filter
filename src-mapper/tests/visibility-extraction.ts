/**
 * Visibility exclusion checks for extractStructuredText.
 * Injects hidden/visible test elements into a blank page and verifies
 * the structured text extractor correctly includes/excludes them.
 *
 * Run with: npx tsx src-mapper/tests/visibility-extraction.ts
 */
import { chromium } from 'playwright';

async function extractStructuredText(page: import('playwright').Page): Promise<string> {
  return page.evaluate(() => {
    const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'head', 'meta', 'link']);
    const MAX_DEPTH = 15;
    const MAX_TEXT_LEN = 200;
    const MAX_TOTAL_LINES = 600;

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
      const clickable = hasClickHandler(el);

      if (directText || clickable) {
        const clickSuffix = clickable ? ' [click]' : '';
        const textPart = directText ? `"${directText}"` : '';
        lines.push(`${'  '.repeat(depth)}${tag}: ${textPart}${clickSuffix}`);
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

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');

  await page.evaluate(() => {
    function makeDiv(id: string, text: string, styles: Partial<CSSStyleDeclaration>): void {
      const el = document.createElement('div');
      el.id = id;
      el.textContent = text;
      Object.assign(el.style, styles);
      document.body.appendChild(el);
    }
    makeDiv('test-display-none',      'SHOULD_NOT_APPEAR_DISPLAY_NONE',   { display: 'none' });
    makeDiv('test-visibility-hidden', 'SHOULD_NOT_APPEAR_VIS_HIDDEN',     { visibility: 'hidden' });
    makeDiv('test-opacity-zero',      'SHOULD_NOT_APPEAR_OPACITY_ZERO',   { opacity: '0', width: '100px', height: '20px' });
    makeDiv('test-zero-size',         'SHOULD_NOT_APPEAR_ZERO_SIZE',      { width: '0', height: '0', overflow: 'hidden' });
    makeDiv('test-visible',           'SHOULD_APPEAR_VISIBLE',            { width: '100px', height: '20px', background: 'red' });
  });

  const text = await extractStructuredText(page);

  const checks: Array<{ label: string; marker: string; shouldBePresent: boolean }> = [
    { label: 'display:none excluded',      marker: 'SHOULD_NOT_APPEAR_DISPLAY_NONE',  shouldBePresent: false },
    { label: 'visibility:hidden excluded', marker: 'SHOULD_NOT_APPEAR_VIS_HIDDEN',    shouldBePresent: false },
    { label: 'opacity:0 excluded',         marker: 'SHOULD_NOT_APPEAR_OPACITY_ZERO',  shouldBePresent: false },
    { label: 'zero-size excluded',         marker: 'SHOULD_NOT_APPEAR_ZERO_SIZE',     shouldBePresent: false },
    { label: 'visible element included',   marker: 'SHOULD_APPEAR_VISIBLE',           shouldBePresent: true  },
  ];

  let allPassed = true;
  for (const { label, marker, shouldBePresent } of checks) {
    const present = text.includes(marker);
    const pass = present === shouldBePresent;
    console.log(`${pass ? '✅' : '❌'} ${label}: ${present ? 'present' : 'absent'} (expected: ${shouldBePresent ? 'present' : 'absent'})`);
    if (!pass) {
      allPassed = false;
    }
  }

  console.log(allPassed ? '\n✅ All visibility checks passed' : '\n❌ Some visibility checks FAILED');
  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();
