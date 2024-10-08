if (typeof browser === "undefined") {
  var browser = chrome;
}

const IS_MOBILE_VIEW = ('ontouchstart' in document.documentElement);
let tries = 0;

function extractResultLinks() {
  const wwid = new URLSearchParams(window.location.search).get('wwsid');
  const results = IS_MOBILE_VIEW
    ? document.body.querySelectorAll('a[role="presentation"]')
    : document.body.querySelectorAll('[eid] [jsaction][jscontroller] > [href]');

  if (results.length === 0 && tries < 5) {
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
setInterval(extractResultLinks, 300);
