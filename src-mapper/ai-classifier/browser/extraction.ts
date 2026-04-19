import type { Page } from 'playwright';
import type { PageSummary } from '../types/browser.js';
import { phoneSignals } from '../utilities/phoneSignals.js';

type BrowserActionableElement = {
  id: string;
  element: string;
  name: string;
  contextHint: string;
  href: string | null;
  domPath: string;
};

type DomExtractionResult = {
  actionableElements: PageSummary['actionableElements'];
  structuredText: string;
  structuredTextWithIds: string;
  phoneNumbers: string[];
  title: string;
};

const extractActionableElements = async (page: Page, currentDomain: string): Promise<BrowserActionableElement[]> => {
  return page.evaluate((domain) => {
    (window as any).__name = (fn: any, _name: string) => fn;
    
    function isVisible(element: Element): boolean {
      const style = window.getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') {
        return false;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return true;
      }

      function hasVisibleRect(candidate: Element): boolean {
        const candidateStyle = window.getComputedStyle(candidate);
        if (candidateStyle.visibility === 'hidden' || candidateStyle.display === 'none') {
          return false;
        }

        const candidateRect = candidate.getBoundingClientRect();
        return candidateRect.width > 0 && candidateRect.height > 0;
      }

      return Array.from(element.querySelectorAll('*')).some(hasVisibleRect);
    }

    function getName(element: Element): string {
      function findDescendantMetadata(candidate: Element): string {
        const imgAlt = Array.from(candidate.querySelectorAll('img[alt]'))
          .map((node) => (node.getAttribute('alt') || '').replace(/\s+/g, ' ').trim())
          .find(Boolean);
        if (imgAlt) {
          return imgAlt;
        }

        const labelledDescendant = Array.from(candidate.querySelectorAll('[aria-label], [title]'))
          .map((node) => (
            node.getAttribute('aria-label') ||
            node.getAttribute('title') ||
            ''
          ).replace(/\s+/g, ' ').trim())
          .find(Boolean);

        return labelledDescendant || '';
      }

      const explicitName = [
        element.getAttribute('aria-label') || '',
        element.getAttribute('title') || '',
        element.getAttribute('alt') || '',
        element instanceof HTMLInputElement ? (element.value || '') : '',
        (element as HTMLElement).innerText || '',
        element.textContent || '',
        findDescendantMetadata(element),
      ]
        .map((value) => value.replace(/\s+/g, ' ').trim())
        .find(Boolean) || '';

      if (explicitName) {
        return explicitName.slice(0, 120);
      }

      const identityText = [
        element.id || '',
        element.className || '',
        element.getAttribute('data-testid') || '',
        element.getAttribute('data-role') || '',
      ]
        .join(' ')
        .toLowerCase();

      if (/(^|\s)(close|btn-close|close-btn|dismiss|cancel|overlay-close|modal-close|popup-close)(\s|$)/i.test(identityText)) {
        return 'Close overlay';
      }

      if (/(^|\s)(cookie|consent|accept)(\s|$)/i.test(identityText)) {
        return 'Accept consent';
      }

      return '';
    }

    function getContextHint(element: Element): string {
      function normalize(value: string): string {
        return value.replace(/\s+/g, ' ').trim();
      }
      const ownText = normalize(element.textContent || '');
      const parentText = element.parentElement ? normalize(element.parentElement.textContent || '') : '';
      const container = element.closest('[id*="phone"], [id*="kontakt"], [class*="phone"], [class*="kontakt"], [class*="contact"], [class*="tel"]');
      const containerText = container ? normalize(container.textContent || '') : '';
      const onclickText = normalize(element.getAttribute('onclick') || '');
      const combined = [ownText, parentText, containerText, onclickText]
        .filter(Boolean)
        .join(' | ')
        .slice(0, 220);

      return combined;
    }

    function isActionable(element: Element): boolean {
      const style = window.getComputedStyle(element);
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      const hasOnClick = element.hasAttribute('onclick');
      const hasHref = element.hasAttribute('href');
      const hasTabIndex = element.hasAttribute('tabindex');
      const knownActionTag = ['a', 'button', 'summary'].includes(tagName) || (tagName === 'input' && ['button', 'submit'].includes((element.getAttribute('type') || '').toLowerCase()));
      const semanticAction = role === 'button' || role === 'link';
      const pointerAction = style.cursor === 'pointer';
      const name = getName(element);

      const identityText = [
        element.id || '',
        element.className || '',
        element.getAttribute('data-testid') || '',
        element.getAttribute('data-role') || '',
      ]
        .join(' ')
        .toLowerCase();
      const looksLikeCloseControl = /(^|\s)(close|btn-close|close-btn|dismiss|cancel|overlay-close|modal-close|popup-close)(\s|$)/i.test(identityText);

      if (tagName === 'a' && hasHref) {
        return true;
      }

      if (!isVisible(element)) {
        return false;
      }

      if (!name && !looksLikeCloseControl) {
        return false;
      }

      return knownActionTag || semanticAction || hasOnClick || hasHref || hasTabIndex || pointerAction;
    }

    function generateDomPath(element: Element): string {
      const path: string[] = [];
      let current: Element | null = element;

      while (current && current !== document.body) {
        if (!current.parentElement) {
          break;
        }

        const parent: Element = current.parentElement;
        const siblings = Array.from(parent.children).filter((el: Element) => el.tagName === current!.tagName);

        if (siblings.length > 1) {
          const index = siblings.indexOf(current);
          path.unshift(`${current.tagName.toLowerCase()}:${index}`);
        } else {
          path.unshift(current.tagName.toLowerCase());
        }

        current = parent;
      }

      path.unshift('body');
      return path.join('>');
    }

    function hashCode(str: string): string {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    }

    function getTop2DomainLevels(hostname: string): string {
      const parts = hostname.split('.').filter(Boolean);
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    }

    function isSameDomain(href: string, currentDomain: string): boolean {
      try {
        const hrefUrl = new URL(href);
        const hrefTop2 = getTop2DomainLevels(hrefUrl.hostname);
        const currentTop2 = getTop2DomainLevels(currentDomain);
        return hrefTop2 === currentTop2;
      } catch {
        return true;
      }
    }

    document.querySelectorAll('[data-ai-mapper-id]').forEach((element) => {
      element.removeAttribute('data-ai-mapper-id');
    });

    const actionableCandidates = Array.from(
      document.querySelectorAll('a, button, summary, input, div, span, [role], [onclick], [tabindex]')
    ).filter(isActionable);

    const actionableElements = actionableCandidates
      .map((element) => {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const name = getName(element);
        const contextHint = getContextHint(element);
        const href = element instanceof HTMLAnchorElement ? element.href : null;
        const domPath = generateDomPath(element);
        const id = hashCode(domPath);

        const elementRole = role || tagName;
        const elementLabel = elementRole === tagName ? tagName : `${tagName}[${elementRole}]`;

        if (!name && !contextHint) {
          return null;
        }

        if (href && !isSameDomain(href, domain)) {
          // Still include cross-domain links — the AI needs to see them and attempt
          // navigation so the browser can detect redirect-bait (cross-domain error).
        }
        element.setAttribute('data-ai-mapper-id', id);

        return {
          id,
          element: elementLabel,
          name,
          contextHint,
          href,
          domPath,
        };
      })
      .filter((el): el is NonNullable<typeof el> => el !== null);

    return actionableElements;
  }, currentDomain);
};

const stripUrlsForPhoneExtraction = (text: string): string => {
  return text.replace(/\b(?:https?:\/\/|www\.)\S+/gi, ' ');
};

const extractPhoneCandidatesFromText = (text: string): string[] => {
  const normalizedText = stripUrlsForPhoneExtraction(String(text || ''))
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    // Replace trailing punctuation that can border a phone number with spaces
    .replace(/[,;:!?]/g, ' ')
    // Replace leading dashes/hyphens before digits so "-07404 619342" becomes " 07404 619342"
    .replace(/(?<=\s|^)-(?=\d)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalizedText) {
    return [];
  }

  const boundaryWrappedText = ` ${normalizedText} `;
  const matches = [
    // Separators: spaces, parentheses, hyphens only — no dots (dots are price/decimal separators)
    // Use [\s\W] boundaries so emoji/special chars also act as delimiters
    ...(boundaryWrappedText.match(/(?<=[\s\W])(?:\+?\d[\d\s()-]{5,}\d)(?=[\s\W])/g) || []),
    ...(boundaryWrappedText.match(/(?<=[\s\W])\d{7,}(?=[\s\W])/g) || []),
  ];

  return [...new Set(matches
    .map((match) => match.replace(/\s+/g, ' ').trim())
    .filter((match) => {
      const digitsOnly = match.replace(/[^\d]/g, '');
      if (digitsOnly.length < 7) {
        return false;
      }

      // Numbers starting with 00 (international dialing prefix) can be up to 15 digits
      if (!match.includes('+') && !match.startsWith('00') && digitsOnly.length > 12) {
        return false;
      }

      if (!match.includes('+') && match.startsWith('00') && digitsOnly.length > 15) {
        return false;
      }

      if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(match) || /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(match)) {
        return false;
      }

      // Reject year ranges like "2010-2024"
      if (/^\d{4}-\d{4}$/.test(match)) {
        return false;
      }

      // Reject anything where a dash is surrounded by spaces (e.g. "1998 - 2026")
      if (/\s-\s/.test(match)) {
        return false;
      }

      // Reject if non-digit characters make up more than 40% of the match —
      // real phone numbers are mostly digits; prices/dimensions/codes are not.
      const separatorCount = match.length - digitsOnly.length;
      if (separatorCount / match.length > 0.4) {
        return false;
      }

      return true;
    }))];
};

const extractPhoneTextSources = async (page: Page): Promise<string[]> => {
  return page.evaluate(() => {
    function isVisible(element: Element): boolean {
      const style = window.getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') {
        return false;
      }

      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    const visibleText = document.body && (document.body as HTMLElement).innerText
      ? (document.body as HTMLElement).innerText
      : '';
    const nodeTexts = Array.from(document.querySelectorAll('a, p, span, strong, small, div, li, td, th'))
      .filter((element) => isVisible(element))
      .map((element) => element.textContent || '')
      .filter(Boolean);

    return [visibleText, ...nodeTexts, document.title || ''];
  });
};

const extractPhoneHrefCandidates = async (page: Page): Promise<string[]> => {
  const hrefs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]'))
      .map((el) => el.getAttribute('href') || '')
      .filter(Boolean);
  });

  return hrefs.flatMap((href) => extractPhoneCandidatesFromContactHref(href));
};

const extractPhoneCandidates = async (page: Page): Promise<string[]> => {
  // tel:/whatsapp hrefs are the highest-confidence source — collect them first.
  const hrefCandidates = await extractPhoneHrefCandidates(page);

  const textSources = await extractPhoneTextSources(page);
  const textCandidates = textSources.flatMap((text) => extractPhoneCandidatesFromText(text));

  return [...new Set([...hrefCandidates, ...textCandidates])];
};

const extractStructuredText = async (page: Page): Promise<{ plain: string; withIds: string }> => {
  return page.evaluate(() => {
    (window as any).__name = (fn: any, _name: string) => fn;

    const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'head', 'meta', 'link']);
    const MAX_DEPTH = 15;
    const MAX_TEXT_LEN = 200;
    const MAX_TOTAL_LINES = 1000;

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
          text += (child.textContent || '').replace(/\s+/g, ' ');
        }
      }
      return text.trim().slice(0, MAX_TEXT_LEN);
    }

    // Returns true if the element has a JS click handler but no navigable href.
    // Checks el.onclick (covers inline onclick= and programmatic .onclick assignment).
    // Also flags <a> elements with empty/# href that carry non-standard attributes,
    // as these are almost always JS-triggered actions wired via addEventListener.
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

    const linesPlain: string[] = [];
    const linesWithIds: string[] = [];

    function walk(el: Element, depth: number): void {
      if (linesPlain.length >= MAX_TOTAL_LINES) {
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
        const line = `${'  '.repeat(depth)}${tag}: ${textPart}${hrefSuffix}${clickSuffix}`;
        linesPlain.push(line);

        const actionId = el.getAttribute('data-ai-mapper-id');
        linesWithIds.push(actionId ? `${line} [id=${actionId}]` : line);
      }

      for (const child of Array.from(el.children)) {
        walk(child, depth + 1);
      }
    }

    if (document.body) {
      walk(document.body, 0);
    }

    return { plain: linesPlain.join('\n'), withIds: linesWithIds.join('\n') };
  });
};

const collapsePhoneCandidates = (phoneNumbers: string[]): string[] => {
  return phoneSignals.collapseEquivalentPhoneNumbers(phoneNumbers);
};

const isPhoneLikeHref = (href: string | null | undefined): boolean => {
  if (!href) {
    return false;
  }

  const normalizedHref = href.toLowerCase();
  return normalizedHref.startsWith('tel:') ||
    normalizedHref.startsWith('sms:') ||
    normalizedHref.startsWith('callto:') ||
    normalizedHref.startsWith('whatsapp:') ||
    normalizedHref.includes('wa.me/') ||
    normalizedHref.includes('api.whatsapp.com/');
};

const extractPhoneCandidatesFromContactHref = (href: string): string[] => {
  if (!isPhoneLikeHref(href)) {
    return [];
  }

  const trimmedHref = href.trim();
  if (!trimmedHref) {
    return [];
  }

  if (/^(?:tel|sms|callto|whatsapp):/i.test(trimmedHref)) {
    const normalizedValue = trimmedHref.replace(/^(?:tel|sms|callto|whatsapp):/i, '');
    const match = normalizedValue.match(/^\+?[\d\s()./-]{7,}$/);
    return match ? [match[0].trim()] : [];
  }

  try {
    const url = new URL(trimmedHref);
    if (url.hostname.includes('wa.me')) {
      const phonePath = url.pathname.replace(/^\/+/, '');
      return /^\+?\d{7,15}$/.test(phonePath) ? [phonePath] : [];
    }

    if (url.hostname.includes('api.whatsapp.com')) {
      const phoneParam = url.searchParams.get('phone') || '';
      return /^\+?\d{7,15}$/.test(phoneParam) ? [phoneParam] : [];
    }
  } catch {
    return [];
  }

  return [];
};

const extractDomSignals = async (page: Page, currentDomain: string): Promise<DomExtractionResult> => {
  // Run actionable elements extraction first so it stamps data-ai-mapper-id attributes
  // onto the DOM before structured text extraction reads them.
  const actionableElements = await extractActionableElements(page, currentDomain);

  const [phoneNumbers, structuredTexts, title] = await Promise.all([
    extractPhoneCandidates(page),
    extractStructuredText(page),
    page.title(),
  ]);

  return {
    actionableElements,
    structuredText: structuredTexts.plain,
    structuredTextWithIds: structuredTexts.withIds,
    phoneNumbers,
    title,
  };
};

export const extraction = {
  extractDomSignals,
  extractPhoneCandidatesFromText,
  extractPhoneCandidatesFromContactHref,
  collapsePhoneCandidates,
};
