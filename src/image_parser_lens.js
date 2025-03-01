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
    const hasNoResultsIcon = !!document.querySelector('[alt="Failure info image"], [alt="Imagine cu informații despre eroare"]');
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
  const xpath = "//*[text()='Potriviri exacte']";
  const matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  return matchingElement;
}

function readImageLinksMobile(wwid, done) {
  new Promise(r => {
    const interval = setInterval(() => {
      const link = getMobileExactLink();
      if (link) {
        link.click();
        clearInterval(interval);
        r();
      }
    }, 100);
  }).then(() => {
    setTimeout(() => {
      let attempt = 0;

      const interval = setInterval(() => {
        const hasNoResultsIcon = !!document.querySelector('[alt="Failure info image"], [alt="Imagine cu informații despre eroare"], [id="OotqVd"], [data-psd-lens-error-card]');
        const linkItems = document.body.querySelectorAll('[id="rso"] [href]');

        if ((!hasNoResultsIcon && attempt < 50) && linkItems.length === 0) {
          ++attempt;
          return;
        }

        clearInterval(interval);

        const resultUrls = [...linkItems].map((n) => n.getAttribute('href'));
        done(resultUrls);
      }, 100);
    }, 800);
  });
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
            const newCount = data[`ww:img_search_started_for`].count - 1;
            const imgs = data[`ww:img_search_started_for`].imgs;

            browser.storage.local.set({
              [`ww:img_search_started_for`]: {
                wwid: data[`ww:img_search_started_for`].wwid,
                imgs,
                count: newCount,
              }
            });
            console.log('Done. Found: ' + results.length);
            console.log('Found: ' + results.join('\n'));

            if (IS_MOBILE_VIEW && newCount !== 0) {
              window.location = imgs[imgs.length - newCount];
            } else {
              window.close();
            }
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

function addLoader(percent) {
  const loader = document.createElement('div');
  document.body.appendChild(loader);

  loader.style.background = 'rgb(87 82 82)';
  loader.style.position = 'fixed';
  loader.style.top = '60px';
  loader.style.width = 'calc(100% - 50px)';
  loader.style.left = '50%';
  loader.style.transform = 'translateX(-50%)';
  loader.style.height = '22px';
  loader.style.padding = '4px';
  loader.style.borderRadius = '4px';
  loader.style.boxShadow = '2px 2px 12px 2px  rgba(0,0,0,0.4)';

  const progress = document.createElement('div');
  loader.appendChild(progress);

  progress.style.width = `${percent}%`;
  progress.style.height = '100%';
  progress.style.background = 'rgb(97 147 59)';
  progress.style.borderRadius = '4px';

  const text = document.createElement('div');
  text.innerHTML = 'căutare după poze ..';
  loader.appendChild(text);

  text.style.position = 'absolute';
  text.style.top = '50%';
  text.style.left = '50%';
  text.style.transform = 'translate(-50%, -50%)';
  text.style.color = 'white';
  text.style.mixBlendMode = 'overlay';
  text.style.fontWeight = 'bold';
}

browser.storage.local.get(`ww:img_search_started_for`).then(data => {
  if (data[`ww:img_search_started_for`].count) {
    parseResults(data[`ww:img_search_started_for`].wwid);

    if (IS_MOBILE_VIEW) {
      const count = data[`ww:img_search_started_for`].count;
      const length = data[`ww:img_search_started_for`].imgs.length;
      addLoader((length - count + 1) / length * 100);
    }
  }
})
