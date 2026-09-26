import {WWBrowserStorage} from "./core/browserStorage";
import {addSearchLoader, addContinueButton, withRetry} from "./core/searchUI";
import {IS_MOBILE_VIEW} from "../common/globals";
import {SearchResult} from "./core/linksFilter";

let isManual: boolean = false;

const currentUrl = new URL(window.location.href);
const q: string | null = currentUrl.searchParams.get('q');
const isSecondSearch = q?.includes('site:nimfomane.com');
const topOffset = IS_MOBILE_VIEW ? 50 : 20;

function getResults() {
  return document.body.querySelectorAll<HTMLAnchorElement>('#rso a[data-ved]') ??
    document.body.querySelectorAll<Element>('[eid] [jsaction][jscontroller] > [href]');
}

function buildGotoResultName(anchor: HTMLAnchorElement): string {
  const urlText = anchor.querySelector<HTMLElement>('[role="text"]')?.textContent?.trim() ?? '';
  const resultTitle = anchor.querySelector<HTMLElement>('[role="heading"]')?.textContent?.trim()
    ?? anchor.querySelector<HTMLElement>('h3')?.textContent?.trim()
    ?? '';
  const domainMatch = urlText.match(/https?:\/\/([^\s/]+)/);

  if (domainMatch) {
    const domain = domainMatch[1].replace(/^www\./, '').toLowerCase();
    const titleText = resultTitle;
    return titleText ? `${domain} | ${titleText}` : domain;
  }

  const fullText = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
  return resultTitle.split(/\s+/)[0] || fullText.split(/\s+/)[0] || 'unknown';
}

function getGotoResultParts(result: SearchResult): {domain: string, title: string} | null {
  if (!Array.isArray(result)) {
    return null;
  }

  const separatorIndex = result[0].indexOf(' | ');
  if (separatorIndex === -1) {
    return null;
  }

  return {
    domain: result[0].slice(0, separatorIndex).trim().toLowerCase().replace(/^www\./, ''),
    title: result[0].slice(separatorIndex + 3).trim().replace(/\s+/g, ' ').toLowerCase(),
  };
}

function isPubli24Domain(domain: string): boolean {
  return domain === 'publi24' || domain === 'publi24.ro';
}

function isPubli24Result(result: SearchResult, parts: {domain: string, title: string} | null): boolean {
  if (parts) {
    return isPubli24Domain(parts.domain);
  }

  if (typeof result !== 'string') {
    return false;
  }

  try {
    return isPubli24Domain(new URL(result, 'https://www.google.com').hostname.replace(/^www\./, '').toLowerCase());
  } catch (error) {
    console.error(`Error parsing search result URL "${result}":`, error);
    return false;
  }
}

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const seenDomainTitles = new Set<string>();

  return results.filter((result) => {
    const serializedResult = JSON.stringify(result);
    if (seen.has(serializedResult)) {
      return false;
    }
    seen.add(serializedResult);

    const parts = getGotoResultParts(result);
    if (!parts) {
      return !isPubli24Result(result, parts);
    }

    if (isPubli24Result(result, parts)) {
      return false;
    }

    const domainTitleKey = `${parts.domain}\u0000${parts.title}`;
    if (seenDomainTitles.has(domainTitleKey)) {
      return false;
    }
    seenDomainTitles.add(domainTitleKey);
    return true;
  });
}

function isGotoHref(href: string): boolean {
  try {
    return new URL(href, 'https://www.google.com').pathname === '/goto';
  } catch (error) {
    console.error(`Error parsing possible Google redirect URL "${href}":`, error);
    return false;
  }
}

function extractResultLinks(wwid: string) {
  const storageKey = `ww:search_results:${wwid}`;

  if (!document.querySelector('[role="main"], [id="rso"]')) {
    return false;
  }

  const noResultsIndicator = document.querySelector('p[role="heading"][aria-level] ~ ul');

  if (getResults().length === 0 && !noResultsIndicator) {
    return false;
  }

  setTimeout(() => {
    const results: NodeListOf<Element> = getResults();
    WWBrowserStorage.get(storageKey)
      .then((data) => {
        const currentUrls: SearchResult[] = data[storageKey] || [];

        const resultUrls: SearchResult[] = Array.from(results)
          .map((n: Element): SearchResult | null => {
            const anchor = n as HTMLAnchorElement;
            const href = anchor.getAttribute('href');
            if (href === null) {
              return null;
            }
            if (isGotoHref(href)) {
              return [buildGotoResultName(anchor), href];
            }
            return href;
          })
          .filter((r): r is SearchResult => r !== null);

        const deduplicatedUrls = deduplicateResults([...resultUrls, ...currentUrls]);

        return WWBrowserStorage.set(storageKey, deduplicatedUrls);
      })
      .then(() => {
        if (isSecondSearch) {
          if (isManual) {
            addContinueButton(() => {
              window.close();
              WWBrowserStorage.set('ww:search_started_for', null);
            });
          } else {
            window.close();
            WWBrowserStorage.set('ww:search_started_for', null);
          }
        } else {
          currentUrl.searchParams.set('q', q + ' site:nimfomane.com');
          console.log("Redirecting to:", currentUrl.toString());
          if (isManual) {
            addContinueButton(() => {
              window.location.href = currentUrl.toString();
            });
          } else {
            window.location.href = currentUrl.toString();
          }
        }
      })
      .catch((error: any) => {
        console.error("Error processing search results or redirecting:", error);
        WWBrowserStorage.set('ww:search_started_for', null);
      });
  }, 100)

  return true;
}


if (q) {
  WWBrowserStorage.get('ww:search_started_for').then((data) => {
    const searchData = data['ww:search_started_for'];

    if (searchData?.wwid) {
      let wwid = searchData.wwid;
      isManual = searchData.manual ?? false;

      withRetry(() => addSearchLoader(`căutare după telefon (${isSecondSearch ? '2' : '1'}/2) ..`, isManual, isSecondSearch ? 100 : 50, topOffset));

      const interval: number = window.setInterval(() => {
        if (extractResultLinks(wwid)) {
          clearInterval(interval);
        }
      }, 50);
    } else {
      console.log("No active phone search found.");
    }
  }).catch((error) => {
    console.error("Failed to retrieve initial search state:", error);
  });
}
