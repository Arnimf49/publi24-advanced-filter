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

  const resultUrls = [...results].map((n) => {
    return n.getAttribute('href');
  });

  browser.storage.local.set({ [`ww:search_results:${wwid}`]: resultUrls })
    .then(() => window.close());
}

// @TODO: Improve to wait for elements.
setInterval(extractResultLinks, 50);
