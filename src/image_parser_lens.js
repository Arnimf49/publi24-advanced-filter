if (typeof browser === "undefined") {
  var browser = chrome;
}

function readImageLinks(wwid, done) {
  const interval = setInterval(() => {
    const hasNoResultsIcon = !!document.querySelector('[alt="Failure info image"]');
    const linkItems = document.body.querySelectorAll('li > a');

    if (!hasNoResultsIcon && linkItems.length === 0) {
      return;
    }

    clearInterval(interval);

    const resultUrls = [...linkItems].map((n) => n.getAttribute('href'));

    browser.storage.local.get(`ww:image_results:${wwid}`, (data) => {
      data = [...(data[`ww:image_results:${wwid}`] || []), ...resultUrls];
      data = data.filter((item, pos) => data.indexOf(item) === pos);
      browser.storage.local.set({ [`ww:image_results:${wwid}`]: data });

      done().then(() => window.close())
    });
  }, 500);
}

function parseResults(wwid) {
    const searchExactBtn = document.body.querySelector('[aria-describedby="reverse-image-search-button-tooltip"]');

    if (searchExactBtn) {
      searchExactBtn.click();
      readImageLinks(wwid, async () => {
        await browser.storage.local.get(`ww:img_search_started_for`).then(data => {
          return browser.storage.local.set({
            [`ww:img_search_started_for`]: {
              wwid: data[`ww:img_search_started_for`].wwid,
              count: data[`ww:img_search_started_for`].count - 1
            }
          });
        })
      });
    }
}

browser.storage.local.get(`ww:img_search_started_for`).then(data => {
  if (data[`ww:img_search_started_for`]) {
    parseResults(data[`ww:img_search_started_for`].wwid);
  }
})
