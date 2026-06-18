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
  const heading = anchor.querySelector<HTMLElement>('h1, h2, h3, h4, h5');
  const headingText = heading?.textContent?.trim() ?? '';
  const fullText = anchor.textContent ?? '';
  const domainMatch = fullText.match(/https?:\/\/([^\s/]+)/);
  const domainPrefix = domainMatch ? domainMatch[1] : '';
  return domainPrefix ? `${domainPrefix} ${headingText}`.trim() : headingText;
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
            if (href.startsWith('goto')) {
              return [buildGotoResultName(anchor), href];
            }
            return href;
          })
          .filter((r): r is SearchResult => r !== null);

        const seen = new Set<string>();
        const finalUrls: SearchResult[] = [...resultUrls, ...currentUrls].filter((r) => {
          const key = JSON.stringify(r);
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });

        return WWBrowserStorage.set(storageKey, finalUrls);
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
