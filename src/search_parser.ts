import {WWBrowserStorage} from "./browser_storage";

let tries: number = 0;

function extractResultLinks(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const wwid: string | null = urlParams.get('wwsid');

  if (!wwid) {
    console.error("WWStorage ID (wwsid) not found in URL parameters.");
    clearInterval(interval);
    return;
  }

  const storageKey = `ww:search_results:${wwid}`;

  const results: NodeListOf<Element> =
    document.body.querySelectorAll<HTMLAnchorElement>('#rso a[data-ved]') ??
    document.body.querySelectorAll<Element>('[eid] [jsaction][jscontroller] > [href]');

  if (results.length === 0 && tries < 15) {
    tries++;
    return;
  }

  clearInterval(interval);

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
      const currentUrl = new URL(window.location.href);
      const q: string | null = currentUrl.searchParams.get('q');

      if (!q) {
        console.error("Query parameter 'q' not found in URL.");
        return;
      }

      if (q.includes('site:nimfomane.com')) {
        window.close();
      } else {
        currentUrl.searchParams.set('q', q + ' site:nimfomane.com');
        console.log("Redirecting to:", currentUrl.toString());
        window.location.href = currentUrl.toString();
      }
    })
    .catch((error: any) => {
      console.error("Error processing search results or redirecting:", error);
    });
}

const interval: number = window.setInterval(extractResultLinks, 50);
