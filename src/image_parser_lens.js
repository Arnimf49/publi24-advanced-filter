if (typeof browser === "undefined") {
  var browser = chrome;
}

function getStorageLock() {
  return new Promise(r => {
    const interval = setInterval(() => {
      browser.storage.local.get(`ww:img_search_started_for`).then(data => {
        if (data[`ww:img_search_started_for`].locked) {
          return;
        }

        browser.storage.local.set({
          [`ww:img_search_started_for`]: {
            ...data[`ww:img_search_started_for`],
            locked: true,
          }
        });
        clearInterval(interval);
        r();
      })
    }, 50);
  });
}

function releaseStorageLock() {
  browser.storage.local.get(`ww:img_search_started_for`).then(data => {
    browser.storage.local.set({
      [`ww:img_search_started_for`]: {
        ...data[`ww:img_search_started_for`],
        locked: false,
      }
    });
  });
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

    getStorageLock().then(() => {
      browser.storage.local.get(`ww:image_results:${wwid}`, (data) => {
        data = [...(data[`ww:image_results:${wwid}`] || []), ...resultUrls];
        data = data.filter((item, pos) => data.indexOf(item) === pos);
        browser.storage.local.set({ [`ww:image_results:${wwid}`]: data });

        releaseStorageLock();
        setTimeout(done, Math.round(Math.random() * 100)); // randomized done helps avoid race conditions
      });
    });
  }, 500);
}

async function parseResults(wwid) {
  const searchExactBtn = document.body.querySelector('[aria-describedby="reverse-image-search-button-tooltip"]');

  const completeInstance = async () => {
    await browser.storage.local.get(`ww:img_search_started_for`).then(data => {
      browser.storage.local.set({
        [`ww:img_search_started_for`]: {
          wwid: data[`ww:img_search_started_for`].wwid,
          count: data[`ww:img_search_started_for`].count - 1,
        }
      });
      window.close();
    })
  }

  if (!searchExactBtn) {
    await completeInstance();
    window.close();
    return;
  }

  searchExactBtn.click();
  readImageLinks(wwid, () => completeInstance());
}

browser.storage.local.get(`ww:img_search_started_for`).then(data => {
  if (data[`ww:img_search_started_for`].count) {
    parseResults(data[`ww:img_search_started_for`].wwid);
  }
})
