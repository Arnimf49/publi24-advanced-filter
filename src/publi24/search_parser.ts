import {WWBrowserStorage} from "./core/browserStorage";
import {addSearchLoader, addContinueButton, withRetry} from "./core/searchUI";
import {google} from "../common/google";
import {IS_MOBILE_VIEW} from "../common/globals";
import {SearchResult} from "./core/linksFilter";

let isManual: boolean = false;
let finished: boolean = false;

const currentUrl = new URL(window.location.href);
const q: string | null = currentUrl.searchParams.get('q');
const isSecondSearch = q?.includes('site:nimfomane.com');
const topOffset = IS_MOBILE_VIEW ? 50 : 20;

function finishSearch(): void {
  if (finished) {
    return;
  }
  finished = true;

  WWBrowserStorage.set('ww:search_started_for', null)
    .catch((error) => {
      console.error('Failed to clear phone search state:', error);
    })
    .finally(() => {
      window.close();
    });
}

function isResultAnchor(anchor: Element): anchor is HTMLAnchorElement {
  // Google injects utility links (e.g. "Traducerea acestei pagini") into the
  // results column. They are plain text anchors, while a real result link
  // always carries a result identity: the title heading or the site/cite line.
  return anchor.querySelector('h3, [role="heading"], cite, [role="text"]') !== null;
}

function getResults(): HTMLAnchorElement[] {
  const anchors = document.body.querySelectorAll<HTMLAnchorElement>('#rso a[data-ved]');
  const results = Array.from(anchors).filter(isResultAnchor);

  if (results.length > 0) {
    return results;
  }

  return Array.from(document.body.querySelectorAll<HTMLAnchorElement>('[eid] [jsaction][jscontroller] > a[href]'))
    .filter(isResultAnchor);
}

function buildGotoResultName(anchor: HTMLAnchorElement): string {
  const urlText = anchor.querySelector<HTMLElement>('[role="text"]')?.textContent?.trim() ?? '';
  const resultTitle = anchor.querySelector<HTMLElement>('[role="heading"]')?.textContent?.trim()
    ?? anchor.querySelector<HTMLElement>('h3')?.textContent?.trim()
    ?? '';
  const fullText = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
  const domainMatch = urlText.match(/https?:\/\/([^\s/]+)/);

  if (domainMatch) {
    const domain = domainMatch[1].replace(/^www\./, '').toLowerCase();
    const titleText = resultTitle;
    return titleText ? `${domain} | ${titleText}` : domain;
  }

  // Some Google cards (e.g. Facebook) show a site label and engagement
  // metadata instead of a URL. The anchor text starts with the title, so strip
  // it before falling back to the label before the breadcrumb separator.
  const textAfterTitle = resultTitle && fullText.startsWith(resultTitle)
    ? fullText.slice(resultTitle.length).trim()
    : fullText;
  const label = textAfterTitle.split('·')[0].trim();

  if (label && label.length <= 40) {
    return resultTitle ? `${label} | ${resultTitle}` : label;
  }

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
    const results = getResults();
    WWBrowserStorage.get(storageKey)
      .then((data) => {
        const currentUrls: SearchResult[] = data[storageKey] || [];

        const resultUrls: SearchResult[] = results
          .map((anchor): SearchResult | null => {
            const href = anchor.getAttribute('href');
            if (href === null) {
              return null;
            }
            if (google.isRedirectPath(href)) {
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
              finishSearch();
            });
          } else {
            finishSearch();
          }
        } else {
          currentUrl.searchParams.set('q', 'site:nimfomane.com ' + q);
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
