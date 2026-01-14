import {WWBrowserStorage} from "./core/browserStorage";
import {addSearchLoader, addContinueButton, withRetry} from "./core/searchUI";
import {IS_MOBILE_VIEW} from "../common/globals";

let tries: number = 0;
let isManual: boolean = false;

const currentUrl = new URL(window.location.href);
const q: string | null = currentUrl.searchParams.get('q');
const isSecondSearch = q?.includes('site:nimfomane.com');
const topOffset = IS_MOBILE_VIEW ? 50 : 20;

function extractResultLinks(wwid: string) {
  const storageKey = `ww:search_results:${wwid}`;

  const results: NodeListOf<Element> =
    document.body.querySelectorAll<HTMLAnchorElement>('#rso a[data-ved]') ??
    document.body.querySelectorAll<Element>('[eid] [jsaction][jscontroller] > [href]');

  if (results.length === 0 && tries < 15) {
    tries++;
    return false;
  }

  WWBrowserStorage.get(storageKey)
    .then((data) => {
      const currentUrls: string[] = data[storageKey] || [];

      const resultUrls: string[] = Array.from(results)
        .map((n: Element) => (n as HTMLAnchorElement).getAttribute('href'))
        .filter((href: string | null): href is string => href !== null);

      const finalUrls: string[] = [...new Set([...resultUrls, ...currentUrls])];

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
