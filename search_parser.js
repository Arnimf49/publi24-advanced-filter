if (typeof browser === "undefined") {
  var browser = chrome;
}

function extractResultLinks() {
  const wwid = new URLSearchParams(window.location.search).get('wwsid');
  const results = document.body.querySelectorAll('[href^="https://translate.google.com/"]');

  if (results.length === 0) {
    return;
  }

  const resultUrls = [...results].map((n) => {
    const href = n.getAttribute('href');
    const parts = new URLSearchParams(href.split('?').pop());
    return decodeURIComponent(parts.get('u'));
  });

  browser.storage.local.set({ [`ww:search_results:${wwid}`]: resultUrls })
    .then(() => window.close());
}

// @TODO: Improve to wait for elements.
setInterval(extractResultLinks, 500);
