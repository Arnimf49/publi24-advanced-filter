let tries = 0;

function extractResultLinks() {
  const wwid = new URLSearchParams(window.location.search).get('wwsid');
  const results =
    document.body.querySelectorAll('#rso a[data-ved]') ||
    document.body.querySelectorAll('[eid] [jsaction][jscontroller] > [href]');

  if (results.length === 0 && tries < 15) {
    ++tries;
    return;
  }

  clearInterval(interval);

  browser.storage.local.get(`ww:search_results:${wwid}`).then(data => {
    const currentUrls = data[`ww:search_results:${wwid}`];
    const resultUrls = [...results].map((n) => {
      return n.getAttribute('href');
    });
    const final = [...new Set([...resultUrls, ...currentUrls])];

    browser.storage.local.set({ [`ww:search_results:${wwid}`]: final })
      .then(() => {
        const url = new URL(window.location);
        const q = url.searchParams.get('q');

        if (q.indexOf('site:nimfomane.com') !== -1) {
          window.close();
        } else {
          url.searchParams.set('q', q + ' site:nimfomane.com');
          console.log(url.toString());
          window.location = url.toString();
        }
      });
  });
}

// @TODO: Improve to wait for elements.
const interval = setInterval(extractResultLinks, 50);
