import type { Page } from 'playwright';
import type { DomainCandidate } from '../types/tools.js';
import type { BrowserToolResult, PageSummary } from '../types/browser.js';
import { phoneSignals } from '../utilities/phoneSignals.js';
import { extraction } from './extraction.js';

const waitForSettledPage = async (page: Page): Promise<void> => {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: 10_000 });
  } catch {
    await page.waitForTimeout(1_000);
  }
};

const detectPageFlags = (): string[] => {
  return [];
};

const readPageSnapshot = async (page: Page, currentDomain: string): Promise<{
  domSignals: Awaited<ReturnType<typeof extraction.extractDomSignals>>;
}> => {
  const domSignals = await extraction.extractDomSignals(page, currentDomain);

  return {
    domSignals,
  };
};

const isDialogOnlyInteraction = (beforePage: PageSummary, afterPage: PageSummary): boolean => {
  if (beforePage.url !== afterPage.url) {
    return false;
  }

  const dialogKeywords = ['dialog', 'gallery', 'lightbox', 'modal'];

  const hadDialogBefore = dialogKeywords.some((keyword) => beforePage.structuredText.toLowerCase().includes(keyword));
  const hasDialogAfter = dialogKeywords.some((keyword) => afterPage.structuredText.toLowerCase().includes(keyword));

  if (hadDialogBefore || !hasDialogAfter) {
    return false;
  }

  return beforePage.structuredText === afterPage.structuredText || afterPage.structuredText.startsWith(beforePage.structuredText.slice(0, 400));
};

const isEquivalentPageNavigation = (beforePage: PageSummary, afterPage: PageSummary): boolean => {
  try {
    const beforeUrl = new URL(beforePage.url);
    const afterUrl = new URL(afterPage.url);

    if (beforeUrl.host !== afterUrl.host || beforeUrl.pathname !== afterUrl.pathname) {
      return false;
    }
  } catch {
    return false;
  }

  return (
    beforePage.title === afterPage.title &&
    beforePage.structuredText === afterPage.structuredText &&
    beforePage.phoneNumbers.join('|') === afterPage.phoneNumbers.join('|')
  );
};

const toToolError = (error: unknown, errorCode: string): BrowserToolResult => {
  const message = error instanceof Error ? error.message : String(error);
  
  console.error(`[BrowserSession] ${errorCode}:`, error);

  return {
    ok: false,
    errorCode,
    message,
    recoverable: true,
  };
};

const normalizeElementReference = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
};

const resolveActionableElementId = async (page: Page, elementRef: string): Promise<string> => {
  const normalizedRef = normalizeElementReference(elementRef);
  
  const matchedId = await page.evaluate((targetRef) => {
    (window as any).__name = (fn: any, _name: string) => fn;
    
    function normalize(value: string): string {
      return value.replace(/\s+/g, ' ').trim().toLowerCase();
    }
    function getName(element: Element): string {
      return normalize(
        element.getAttribute('aria-label') ||
        (element instanceof HTMLInputElement ? element.value : '') ||
        (element as HTMLElement).innerText ||
        element.textContent ||
        ''
      );
    }

    const candidates = Array.from(document.querySelectorAll('[data-ai-mapper-id]'));
    
    const byId = candidates.find((element) => element.getAttribute('data-ai-mapper-id') === targetRef);
    if (byId) {
      return byId.getAttribute('data-ai-mapper-id');
    }

    const exactMatch = candidates.find((element) => getName(element) === targetRef);
    if (exactMatch) {
      return exactMatch.getAttribute('data-ai-mapper-id');
    }

    const partialMatch = candidates.find((element) => getName(element).includes(targetRef));
    return partialMatch ? partialMatch.getAttribute('data-ai-mapper-id') : null;
  }, normalizedRef) as string | null;

  if (!matchedId) {
    throw new Error(`No actionable element matches "${elementRef}". Use the exact elementId from the actionable element list.`);
  }

  return matchedId;
};

const clickProbeTarget = async (page: Page, locator: ReturnType<Page['locator']>): Promise<void> => {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Probe target is not clickable because no bounding box is available.');
  }

  const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);
  const paddingX = Math.min(18, box.width * 0.2);
  const paddingY = Math.min(18, box.height * 0.2);
  const targetX = randomBetween(box.x + paddingX, box.x + box.width - paddingX);
  const targetY = randomBetween(box.y + paddingY, box.y + box.height - paddingY);
  const startX = Math.max(0, targetX - randomBetween(24, 48));
  const startY = Math.max(0, targetY - randomBetween(12, 28));

  await page.mouse.move(startX, startY, { steps: 8 });
  await page.mouse.move(targetX, targetY, { steps: 12 });
  await page.mouse.down();
  await page.waitForTimeout(Math.round(randomBetween(60, 140)));
  await page.mouse.up();
};

const isPhoneLikeHref = (href: string | null | undefined): boolean => {
  if (!href) {
    return false;
  }

  const normalizedHref = href.toLowerCase();

  if (normalizedHref.startsWith('sms:')) {
    // Reject SMS shortcodes (≤6 digits) — these are premium/marketing codes, not real phone numbers.
    const digits = normalizedHref.slice(4).replace(/\D/g, '');
    if (digits.length <= 6) {
      return false;
    }
  }

  return normalizedHref.startsWith('tel:') ||
    normalizedHref.startsWith('sms:') ||
    normalizedHref.startsWith('callto:') ||
    normalizedHref.startsWith('whatsapp:') ||
    normalizedHref.includes('wa.me/') ||
    normalizedHref.includes('api.whatsapp.com/');
};

const MESSAGING_HOSTS = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com', 't.me', 'telegram.me', 'viber.com', 'signal.me'];

const isMessagingHost = (host: string): boolean => {
  const h = host.toLowerCase();
  return MESSAGING_HOSTS.some((m) => h === m || h.endsWith('.' + m));
};

const markPhoneProbeTarget = async (page: Page, phoneNumber: string): Promise<string | null> => {
  const normalizedPhone = phoneNumber.replace(/[^\d+]/g, '');
  if (!normalizedPhone) {
    return null;
  }

  return page.evaluate(({ targetPhone }) => {
    (window as any).__name = (fn: any, _name: string) => fn;
    
    document.querySelectorAll('[data-ai-phone-probe]').forEach((element) => {
      element.removeAttribute('data-ai-phone-probe');
    });

    function normalize(value: string): string {
      return value.replace(/[^\d+]/g, '');
    }
    function digitsOnly(value: string): string {
      return value.replace(/[^\d]/g, '');
    }
    function isPhoneLikeMatch(left: string, right: string): boolean {
      const leftNormalized = normalize(left);
      const rightNormalized = normalize(right);
      const leftDigits = digitsOnly(leftNormalized);
      const rightDigits = digitsOnly(rightNormalized);

      if (!leftDigits || !rightDigits) {
        return false;
      }

      if (
        leftNormalized.includes(rightNormalized) ||
        rightNormalized.includes(leftNormalized) ||
        leftDigits.includes(rightDigits) ||
        rightDigits.includes(leftDigits)
      ) {
        return true;
      }

      if (leftDigits.length >= 7 && rightDigits.length >= 7) {
        const shorter = leftDigits.length <= rightDigits.length ? leftDigits : rightDigits;
        const longer = leftDigits.length <= rightDigits.length ? rightDigits : leftDigits;
        return longer.endsWith(shorter) || longer.endsWith(shorter.slice(1));
      }

      return false;
    }
    function isVisible(element: Element): boolean {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    }

    const bestCandidate = Array.from(document.querySelectorAll('a, button, span, div, p, strong, small'))
      .filter((element) => isVisible(element))
      .find((element) => {
        const textMatch = (element.textContent || '').trim();
        if (isPhoneLikeMatch(textMatch, targetPhone)) {
          return true;
        }

        if (element instanceof HTMLAnchorElement) {
          const href = element.href || '';
          const normalizedHref = href.toLowerCase();
          const isPhoneHref = normalizedHref.startsWith('tel:') ||
            normalizedHref.startsWith('sms:') ||
            normalizedHref.startsWith('callto:') ||
            normalizedHref.startsWith('whatsapp:') ||
            normalizedHref.includes('wa.me/') ||
            normalizedHref.includes('api.whatsapp.com/');
          return isPhoneHref && isPhoneLikeMatch(href, targetPhone);
        }

        return false;
      });

    if (!bestCandidate) {
      return null;
    }

    bestCandidate.setAttribute('data-ai-phone-probe', 'true');
    return '[data-ai-phone-probe="true"]';
  }, { targetPhone: normalizedPhone });
};

function isSameSiteNavigation(hostA: string, hostB: string): boolean {
  if (hostA === hostB) {
    return true;
  }
  const getRegistrable = (h: string) => h.split('.').slice(-2).join('.');
  return getRegistrable(hostA) === getRegistrable(hostB);
}

export class BrowserSession {
  private page: Page;
  private domain: string;
  private homepageUrl: string | null = null;
  private startHost: string | null = null;
  private navigationSteps = 0;

  constructor(page: Page, domain: string) {
    this.page = page;
    this.domain = domain;
  }

  async openCandidate(candidate: DomainCandidate): Promise<BrowserToolResult> {
    const targetUrl = candidate.source ?? `https://${candidate.domain}`;
    try {
      this.homepageUrl = new URL(targetUrl).origin;
      this.startHost = new URL(targetUrl).host;
      this.navigationSteps = 0;

      await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await waitForSettledPage(this.page);

      return {
        ok: true,
        page: await this.buildPageSummary(),
      };
    } catch (error) {
      try {
        await waitForSettledPage(this.page);
        const currentUrl = this.page.url();

        if (
          currentUrl &&
          currentUrl !== 'about:blank' &&
          !currentUrl.startsWith('chrome-error://') &&
          ['http:', 'https:'].includes(new URL(currentUrl).protocol)
        ) {
          this.homepageUrl = new URL(targetUrl).origin;
          this.startHost = new URL(targetUrl).host;
          this.navigationSteps = 0;
          return {
            ok: true,
            page: await this.buildPageSummary(),
          };
        }
      } catch {
        // Fall through to the original open error if the page is still not usable.
      }

      return toToolError(error, 'open_candidate_failed');
    }
  }

  async clickElement(elementIds: string[]): Promise<BrowserToolResult> {
    return this.clickElementsWithRetry(elementIds, null, 3);
  }

  private async clickElementsWithRetry(
    elementIds: string[],
    lastPage: PageSummary | null,
    remainingRetries: number,
  ): Promise<BrowserToolResult> {
    const failed: string[] = [];

    for (let i = 0; i < elementIds.length; i++) {
      if (i > 0 || lastPage !== null) {
        await this.page.waitForTimeout(300);
      }
      const result = await this.clickSingle(elementIds[i]);
      if (!result.ok) {
        if (result.errorCode === 'click_blocked_by_overlay') {
          failed.push(elementIds[i]);
        } else {
          return result;
        }
      } else {
        lastPage = result.page!;
      }
    }

    if (failed.length === 0) {
      return { ok: true, page: lastPage! };
    }

    const someSucceeded = failed.length < elementIds.length;
    if (someSucceeded && remainingRetries > 0) {
      return this.clickElementsWithRetry(failed, lastPage, remainingRetries - 1);
    }

    return {
      ok: false,
      errorCode: 'click_blocked_by_overlay',
      message: `Click failed because an overlay or modal intercepted pointer events for element(s): ${failed.join(', ')}. Clear or bypass the blocking overlay first, then retry.`,
      recoverable: true,
    };
  }

  private async clickSingle(elementId: string): Promise<BrowserToolResult> {
    try {
      const beforePage = await this.buildPageSummary();
      const previousUrl = this.page.url();
      const previousHost = (() => { try { return new URL(previousUrl).host; } catch { return ''; } })();
      const resolvedElementId = await resolveActionableElementId(this.page, elementId);
      const locator = this.page.locator(`[data-ai-mapper-id="${resolvedElementId}"]`).first();
      await locator.waitFor({ state: 'visible', timeout: 4_000 });

      const popupPromise = this.page.waitForEvent('popup', { timeout: 1_500 }).catch(() => null);
      await locator.click({ timeout: 4_000 });
      const popup = await popupPromise;

      if (popup) {
        const popupUrl = popup.url();
        const popupHost = (() => { try { return new URL(popupUrl).host; } catch { return popupUrl; } })();
        await popup.close().catch(() => undefined);
        if (isMessagingHost(popupHost)) {
          return {
            ok: false,
            errorCode: 'click_opened_new_tab',
            message: `Click opened a messaging app (${popupHost}) in a new tab. This is a legitimate WhatsApp/Telegram contact link — the phone is embedded in the link. Do not retry. Use verify_phone_action if a phone number is visible.`,
            recoverable: true,
          };
        }
        return {
          ok: false,
          errorCode: 'click_opened_new_tab',
          message: `Click opened a new tab pointing to ${popupHost}. This is redirect bait — the site routes contact through an off-site link instead of providing a real phone. Do not retry this element. Classify as BAD.`,
          recoverable: false,
        };
      }

      await waitForSettledPage(this.page);
      const afterPage = await this.buildPageSummary();

      if (isDialogOnlyInteraction(beforePage, afterPage)) {
        return {
          ok: false,
          errorCode: 'click_opened_dialog_only',
          message: 'Click opened an in-page dialog or gallery.',
          recoverable: true,
        };
      }

      const currentUrl = this.page.url();
      if (currentUrl !== previousUrl) {
        this.navigationSteps += 1;

        const currentHost = (() => { try { return new URL(currentUrl).host; } catch { return ''; } })();
        if (previousHost && currentHost && currentHost !== previousHost && !isSameSiteNavigation(previousHost, currentHost)) {
          await this.page.goto(previousUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 }).catch(() => undefined);
          await waitForSettledPage(this.page);
          if (isMessagingHost(currentHost)) {
            return {
              ok: false,
              errorCode: 'click_navigated_cross_domain',
              message: `Click navigated to a messaging platform (${currentHost}). This is a legitimate WhatsApp/Telegram contact link — the phone is embedded in the link. The browser has been returned to the previous page. Use verify_phone_action if a phone number is visible.`,
              recoverable: true,
            };
          }
          return {
            ok: false,
            errorCode: 'click_navigated_cross_domain',
            message: `Click navigated to a different domain (${currentHost}). The browser has been returned to the previous page. This is redirect bait — the site routes contact through an off-site domain instead of providing a real phone. Do not retry this element. Classify as BAD.`,
            recoverable: false,
          };
        }
      }

      return {
        ok: true,
        page: afterPage,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('intercepts pointer events')) {
        return {
          ok: false,
          errorCode: 'click_blocked_by_overlay',
          message: 'Click failed because an overlay or modal intercepted pointer events. Clear or bypass the blocking overlay first, then retry the intended profile/detail action.',
          recoverable: true,
        };
      }

      return toToolError(error, 'click_element_failed');
    }
  }

  async openElementHref(elementId: string | null, directHref: string | null): Promise<BrowserToolResult> {
    try {
      const beforePage = await this.buildPageSummary();
      const previousUrl = this.page.url();

      let rawHref: string | null = null;

      if (directHref) {
        rawHref = directHref;
      } else if (elementId) {
        const resolvedElementId = await resolveActionableElementId(this.page, elementId);
        const locator = this.page.locator(`[data-ai-mapper-id="${resolvedElementId}"]`).first();
        await locator.waitFor({ state: 'attached', timeout: 4_000 });
        rawHref = await locator.evaluate((element) => {
          return element instanceof HTMLAnchorElement ? element.href : element.getAttribute('href');
        });
      } else {
        return {
          ok: false,
          errorCode: 'open_element_href_no_target',
          message: 'open_element_href requires either elementId or href. Provide elementId when navigating via a page element, or href when using a URL returned by analyze_page.',
          recoverable: true,
        };
      }

      if (!rawHref) {
        return {
          ok: false,
          errorCode: 'open_element_href_unavailable',
          message: 'The selected element does not expose an href that can be opened directly. This is likely a text/title/container element, not a real link. Do not retry open_element_href on this control; choose an actionable element whose href field already shows a real same-host profile/detail URL, or use click_element only if there is a good reason to believe an overlay-intercepted real link is underneath.',
          recoverable: true,
        };
      }

      let hrefUrl: URL;
      try {
        hrefUrl = new URL(rawHref, this.page.url());
      } catch {
        return {
          ok: false,
          errorCode: 'open_element_href_invalid_url',
          message: 'The selected href is not a valid navigable URL. Do not retry open_element_href on this control; choose a real same-host http(s) profile/detail link instead.',
          recoverable: true,
        };
      }

      if (!['http:', 'https:'].includes(hrefUrl.protocol)) {
        const protocolLabel = hrefUrl.protocol.replace(/:$/, '') || 'non-http';
        return {
          ok: false,
          errorCode: 'open_element_href_special_scheme',
          message: `The selected href uses the ${protocolLabel}: scheme, not a normal web page URL. Do not use open_element_href on phone, sms, mail, WhatsApp, Telegram, or other special-scheme actions. If this is a phone/contact action, use verify_phone_action instead; otherwise choose a real same-host http(s) listing/profile link.`,
          recoverable: true,
        };
      }

      const currentHost = (() => { try { return new URL(this.page.url()).host; } catch { return ''; } })();
      const targetHost = hrefUrl.host;
      if (currentHost && targetHost && !isSameSiteNavigation(currentHost, targetHost)) {
        if (isMessagingHost(targetHost)) {
          return {
            ok: false,
            errorCode: 'open_element_href_cross_domain',
            message: `Rejected: this href points to a messaging platform (${targetHost}). Use verify_phone_action instead — the phone number is likely embedded in the WhatsApp/Telegram link.`,
            recoverable: true,
          };
        }
        return {
          ok: false,
          errorCode: 'open_element_href_cross_domain',
          message: `Rejected: this href points to a different domain (${targetHost}). Navigating off-site via open_element_href is not allowed. An off-site contact link is redirect bait — the site does not provide a real on-site phone. Do not retry this link. Classify as BAD.`,
          recoverable: false,
        };
      }

      await this.page.goto(hrefUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await waitForSettledPage(this.page);
      const afterPage = await this.buildPageSummary();

      if (this.page.url() === previousUrl) {
        return {
          ok: false,
          errorCode: 'open_element_href_same_page',
          message: 'Opening this href kept you on the same page and did not advance to a new profile/detail view. Do not repeat this control; choose a different same-host profile/detail link or another navigation path.',
          recoverable: true,
        };
      }

      if (isEquivalentPageNavigation(beforePage, afterPage)) {
        return {
          ok: false,
          errorCode: 'open_element_href_no_new_info',
          message: 'Opening this href changed the URL but the page content is essentially the same and no new listing/contact information appeared. Do not keep opening similar gallery/photo/item links; switch to a different type of navigation such as a named profile page, another section, or another non-equivalent control.',
          recoverable: true,
        };
      }

      if (this.page.url() !== previousUrl) {
        this.navigationSteps += 1;
      }

      return {
        ok: true,
        page: afterPage,
      };
    } catch (error) {
      return toToolError(error, 'open_element_href_failed');
    }
  }

  async verifyPhoneAction(phoneNumber: string): Promise<BrowserToolResult> {
    try {
      const trimmedPhone = phoneNumber.trim();
      if (/[xX*•_?]/.test(trimmedPhone)) {
        return {
          ok: false,
          errorCode: 'verify_phone_action_masked_phone',
          message: 'Phone verification failed because the provided phone number is still masked or partially hidden. Do not verify a placeholder like 09x xxx xxxx directly. First identify and click the phone-reveal control on the current escort profile page, then re-read the page and verify the fully revealed number.',
          recoverable: true,
        };
      }

      const beforePage = await this.buildPageSummary();
      const previousUrl = this.page.url();
      const previousPageCount = this.page.context().pages().length;
      let targetLocator: ReturnType<Page['locator']>;

      const probeSelector = await markPhoneProbeTarget(this.page, phoneNumber);
      if (!probeSelector) {
        return {
          ok: false,
          errorCode: 'verify_phone_action_target_not_found',
          message: 'Phone verification failed because no visible page element matching the phone number could be probed.',
          recoverable: true,
        };
      }

      targetLocator = this.page.locator(probeSelector).first();
      await targetLocator.waitFor({ state: 'visible', timeout: 4_000 });

      const href = await targetLocator.evaluate((element) => {
        return element instanceof HTMLAnchorElement ? element.href : element.getAttribute('href');
      });

      // If the element's href is already a phone-like link (tel:, whatsapp, etc.),
      // the phone number is accessible without clicking — clicking a tel: link can cause
      // Playwright to navigate to tel:+xxx which breaks subsequent URL comparisons.
      if (isPhoneLikeHref(href)) {
        return { ok: true, page: beforePage };
      }

      const popupPromise = this.page.waitForEvent('popup', { timeout: 2_000 }).catch(() => null);
      let transientUrl: string | null = null;
      const onFrameNav = (frame: import('playwright').Frame) => {
        if (frame === this.page.mainFrame()) {
          const url = frame.url();
          if (url && url !== previousUrl && url !== 'about:blank') {
            transientUrl = url;
          }
        }
      };
      this.page.on('framenavigated', onFrameNav);
      await clickProbeTarget(this.page, targetLocator);
      await this.page.waitForTimeout(1_500);
      this.page.off('framenavigated', onFrameNav);
      const popup = await popupPromise;

      if (popup) {
        await popup.close().catch(() => undefined);
        if (isPhoneLikeHref(href)) {
          return { ok: true, page: beforePage };
        }
        return {
          ok: false,
          errorCode: 'verify_phone_action_popup_opened',
          message: 'Phone verification failed because clicking the contact action opened a new tab or popup. Treat this as redirect bait, not a trustworthy escort contact path.',
          recoverable: true,
        };
      }

      const currentUrl = this.page.url();
      const currentPageCount = this.page.context().pages().length;
      const normalizedHref = href?.toLowerCase() ?? '';

      // Detect redirect bait: onclick navigated to another domain then came back (transient navigation).
      if (transientUrl && currentUrl === previousUrl) {
        try {
          const transientHost = new URL(transientUrl).host;
          const previousHost = new URL(previousUrl).host;
          if (!isSameSiteNavigation(previousHost, transientHost) && !isPhoneLikeHref(href)) {
            return {
              ok: false,
              errorCode: 'verify_phone_action_external_navigation',
              message: `Phone verification failed because clicking the contact action transiently navigated to another domain (${transientHost}) before returning. Treat this as redirect bait, not a trustworthy escort contact path.`,
              recoverable: true,
            };
          }
        } catch { /* ignore URL parse errors */ }
      }

      if (href && !isPhoneLikeHref(href) && currentUrl === previousUrl && currentPageCount === previousPageCount) {
        return {
          ok: false,
          errorCode: 'verify_phone_action_non_phone_href',
          message: 'Phone verification failed because the matched element points to a non-phone URL rather than a phone-specific contact path.',
          recoverable: true,
        };
      }

      if (currentPageCount > previousPageCount) {
        return {
          ok: false,
          errorCode: 'verify_phone_action_new_page_opened',
          message: 'Phone verification failed because clicking the contact action opened another page. Treat this as redirect bait, not a trustworthy escort contact path.',
          recoverable: true,
        };
      }

      if (currentUrl !== previousUrl) {
        const previousHost = new URL(previousUrl).host;
        const currentHost = new URL(currentUrl).host;
        const normalizedHrefDigits = normalizedHref.replace(/[^\d+]/g, '');
        const currentUrlDigits = currentUrl.replace(/[^\d+]/g, '');

        if (!isSameSiteNavigation(previousHost, currentHost)) {
          await this.page.goto(previousUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 }).catch(() => undefined);
          await waitForSettledPage(this.page);

          if (isPhoneLikeHref(href)) {
            return { ok: true, page: beforePage };
          }

          return {
            ok: false,
            errorCode: 'verify_phone_action_external_navigation',
            message: `Phone verification failed because clicking the contact action navigated to another domain (${currentUrl}). Treat this as redirect bait, not a trustworthy escort contact path.`,
            recoverable: true,
          };
        }

        if (normalizedHrefDigits && currentUrlDigits.includes(normalizedHrefDigits)) {
          return {
            ok: true,
            page: await this.buildPageSummary(),
          };
        }

        return {
          ok: false,
          errorCode: 'verify_phone_action_unexpected_navigation',
          message: `Phone verification failed because clicking the contact action changed the page without opening a phone-specific URL (navigated to: ${currentUrl}). Treat this as suspicious bait unless stronger same-host evidence proves otherwise.`,
          recoverable: true,
        };
      }

      if (normalizedHref.startsWith('tel:') || normalizedHref.startsWith('sms:') || normalizedHref.startsWith('callto:') || normalizedHref.includes('whatsapp')) {
        return {
          ok: true,
          page: beforePage,
        };
      }

      return {
        ok: true,
        page: await this.buildPageSummary(),
      };
    } catch (error) {
      return toToolError(error, 'verify_phone_action_failed');
    }
  }

  async openHomepage(): Promise<BrowserToolResult> {
    try {
      const currentUrl = this.page.url();
      const targetUrl = this.homepageUrl ?? (currentUrl ? new URL(currentUrl).origin : `https://${this.domain}`);

      await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await waitForSettledPage(this.page);
      if (targetUrl !== currentUrl) {
        this.navigationSteps += 1;
      }

      return {
        ok: true,
        page: await this.buildPageSummary(),
      };
    } catch (error) {
      return toToolError(error, 'open_homepage_failed');
    }
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await waitForSettledPage(this.page);
  }

  async getCurrentPage(): Promise<PageSummary> {
    return this.buildPageSummary();
  }

  async getHtml(): Promise<string> {
    try {
      return await this.page.content();
    } catch {
      return '';
    }
  }

  async snapshotPage(): Promise<{ url: string; title: string; structuredText: string; actionableElements: PageSummary['actionableElements']; html: string }> {
    // Retry once — the page evaluate may fail if a navigation just completed
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await waitForSettledPage(this.page);
        const url = this.page.url();
        const [domSignals, html] = await Promise.all([
          extraction.extractDomSignals(this.page, this.domain),
          this.getHtml(),
        ]);

        return {
          url,
          title: domSignals.title,
          structuredText: domSignals.structuredText,
          actionableElements: domSignals.actionableElements,
          html,
        };
      } catch (error) {
        if (attempt === 1) {
          throw error;
        }

        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('Execution context was destroyed')) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    throw new Error('snapshotPage: unreachable');
  }

  async focus(): Promise<void> {
    try {
      await this.page.bringToFront();
    } catch {
      // Best-effort — ignore if the page is already closed
    }
  }

  async close(): Promise<void> {
    await this.page.close();
  }

  private async buildPageSummary(): Promise<PageSummary> {
    const currentHost = (() => {
      try {
        return new URL(this.page.url()).host;
      } catch {
        return this.domain;
      }
    })();

    let domSignals: Awaited<ReturnType<typeof extraction.extractDomSignals>>;

    try {
      ({ domSignals } = await readPageSnapshot(this.page, currentHost));
    } catch (error) {
      if (error instanceof Error && /result is not a function/i.test(error.message)) {
        await this.page.waitForTimeout(1_500);
        ({ domSignals } = await readPageSnapshot(this.page, currentHost));
      } else {
        throw error;
      }
    }

    if (domSignals.structuredText.length < 100) {
      await this.page.waitForTimeout(1_000);
      ({ domSignals } = await readPageSnapshot(this.page, currentHost));
    }

    const contactHrefPhones = domSignals.actionableElements.flatMap((element) => {
      return element.href ? extraction.extractPhoneCandidatesFromContactHref(element.href) : [];
    });
    const phoneNumbers = extraction.collapsePhoneCandidates([...new Set([
      ...domSignals.phoneNumbers,
      ...contactHrefPhones,
      ...extraction.extractPhoneCandidatesFromText(domSignals.structuredText),
      ...extraction.extractPhoneCandidatesFromText(domSignals.title),
    ])]);
    const pageFlags = detectPageFlags();

    return {
      url: this.page.url(),
      title: domSignals.title,
      startHost: this.startHost,
      currentHost,
      sameHostAsStart: Boolean(this.startHost) && this.startHost === currentHost,
      structuredText: domSignals.structuredText,
      structuredTextWithIds: domSignals.structuredTextWithIds,
      phoneNumbers,
      countryHints: phoneSignals.getPhoneCountryHints(phoneNumbers),
      tldHint: phoneSignals.extractCountryFromDomain(this.domain),
      canGoBack: this.navigationSteps > 0,
      navigationSteps: this.navigationSteps,
      pageFlags,
      actionableElements: domSignals.actionableElements,
    };
  }
}
