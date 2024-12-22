if (typeof browser === "undefined") {
  var browser = chrome;
}

const IS_MOBILE_VIEW = ('ontouchstart' in document.documentElement);

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

function getDesktopExactLink() {
  return document.body.querySelector('[aria-describedby="reverse-image-search-button-tooltip"]');
}

async function readImageLinksDesktop(wwid, done) {
  const searchExactBtn = getDesktopExactLink();
  searchExactBtn.click();

  const interval = setInterval(() => {
    const hasNoResultsIcon = !!document.querySelector('[alt="Failure info image"]');
    const linkItems = document.body.querySelectorAll('li > a');

    if (!hasNoResultsIcon && linkItems.length === 0) {
      return;
    }

    clearInterval(interval);

    const resultUrls = [...linkItems].map((n) => n.getAttribute('href'));
    done(resultUrls);
  }, 500);
}

function getMobileExactLink() {
  return document.querySelector('[role="navigation"] [role="listitem"]:nth-child(4) a');
}

function readImageLinksMobile(wwid, done) {
  const exactLink = getMobileExactLink();
  exactLink.click();

  setTimeout(() => {
    const interval = setInterval(() => {
      const hasNoResultsIcon = !!document.querySelector('[alt="Failure info image"], [id="OotqVd"]');
      const linkItems = document.body.querySelectorAll('[id="rso"] [href]');

      if (!hasNoResultsIcon && linkItems.length === 0) {
        return;
      }

      clearInterval(interval);

      const resultUrls = [...linkItems].map((n) => n.getAttribute('href'));
      done(resultUrls);
    }, 500);
  }, 300);
}

async function parseResults(wwid) {
  const callback = (results) => {
    getStorageLock().then(() => {
      browser.storage.local.get(`ww:image_results:${wwid}`, (data) => {
        data = [...(data[`ww:image_results:${wwid}`] || []), ...results];
        data = data.filter((item, pos) => data.indexOf(item) === pos);
        browser.storage.local.set({ [`ww:image_results:${wwid}`]: data });

        releaseStorageLock();
        setTimeout(async () => {
          await browser.storage.local.get(`ww:img_search_started_for`).then(data => {
            browser.storage.local.set({
              [`ww:img_search_started_for`]: {
                wwid: data[`ww:img_search_started_for`].wwid,
                count: data[`ww:img_search_started_for`].count - 1,
              }
            });
            console.log('Done. Found: ' + results.length);
            window.close();
          })
        }, Math.round(Math.random() * 100)); // randomized done helps avoid race conditions
      });
    });
  }

  console.log('Running')

  if (getMobileExactLink()) {
    console.log('.. on mobile')
    readImageLinksMobile(wwid, callback);
  } else if (getDesktopExactLink()) {
    console.log('.. on desktop')
    readImageLinksDesktop(wwid, callback)
  }
}

browser.storage.local.get(`ww:img_search_started_for`).then(data => {
  if (data[`ww:img_search_started_for`].count) {
    parseResults(data[`ww:img_search_started_for`].wwid);
  }
})
