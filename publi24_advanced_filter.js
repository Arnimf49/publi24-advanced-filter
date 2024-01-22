if (typeof browser === "undefined") {
  var browser = chrome;
}

const runtime = browser.runtime;

const BLACKLISTED_LINKS = [
  'https://meiwakucheck.com/',
  'https://www.jpnumber.com/',
  'https://telefonforsaljare.nu/',
  'https://www.180.se/',
  'https://www.eniro.se/',
  'https://z1kk2ror.canina101.es/',
  'https://www.telefonforsaljare.nu/',
  'https://denwam.com/',
  'https://cinetesuna.ro/',
  'https://www.france-inverse.com/',
  'http://www.zibadpl.blogfa.com/',
  'https://www.telephoneannuaire.fr/',
  'https://nmqzg.forschungsstelle-ordensgeschichte.de/',
  'https://k6q4ubh5h.echantillon-lipton.fr/',
  'https://4qkhz6bjo.thiasbarber.fr/',
  'https://www.denwam.com/',
  'https://www.leelam.af/',
  'http://kto-zvonil.com.ua/',
]

const IS_AD_PAGE = !!document.querySelector('[itemtype="https://schema.org/Offer"]');

const RENDER_CACHE_KEY = {};

const TEMPLATE = Handlebars.templates.template;

Handlebars.registerHelper('isUndefined', function(value) {
  return value === undefined;
});

const filterLinks = (links) => {
  return links.filter(l => !BLACKLISTED_LINKS.some(b => l.indexOf(b) === 0))
}

function cleanupExistingRender(item) {
  const existing = item.querySelector('.ww-container');
  if (existing) {
    existing.parentNode.removeChild(existing);
  }
}

function getItemVisibility(id) {
  const wasItemHidden = localStorage.getItem(`ww:visibility:${id}`) === 'false';
  const wasPhoneHidden =  localStorage.getItem(`ww:phone:${id}`) ?
    localStorage.getItem(`ww:phone:${localStorage.getItem(`ww:phone:${id}`)}:visible`) === 'false' :
    false;

  return !wasItemHidden && !wasPhoneHidden;
}

function doRender(item, id, searchResults) {
  const phone = localStorage.getItem(`ww:phone:${id}`);
  const searchLinks = searchResults[`ww:search_results:${id}`];
  const filteredSearchLinks = filterLinks(searchLinks || []);

  const imageSearchLinks = searchResults[`ww:image_results:${id}`];
  const filteredImageSearchLinks = filterLinks(imageSearchLinks || []);

  const panelElement = document.createElement('div');
  panelElement.className = 'ww-container';
  panelElement.innerHTML = TEMPLATE({
    phone,
    searchLinks,
    filteredSearchLinks,
    imageSearchLinks,
    filteredImageSearchLinks,
  });

  item.appendChild(panelElement);
}

function setItemVisible(item, v) {
  const toggleVisibilityBtn = item.querySelector('[data-wwid="toggle-hidden"]');
  toggleVisibilityBtn.innerHTML = v ? 'Ascunde' : 'Ma-m răzgândit';
  item.style.opacity = v ? '1' : '0.3';
}

function registerVisibilityHandler(item, id) {
  const toggleVisibilityBtn = item.querySelector('[data-wwid="toggle-hidden"]');
  setItemVisible(item, getItemVisibility(id));

  toggleVisibilityBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let visible = getItemVisibility(id);
    visible = !visible;
    setItemVisible(item, visible);
    localStorage.setItem(`ww:visibility:${id}`, visible);

    const phoneNumber = localStorage.getItem(`ww:phone:${id}`);
    if (phoneNumber) {
      localStorage.setItem(`ww:phone:${phoneNumber}:visible`, visible);
    }
  };
}

async function readNumbersFromBase64Png(data) {
  const jimpImg = await Jimp.read(`data:image/png;base64,${data}`);

  return new Promise(res => {
    jimpImg.invert()
      .getBase64(Jimp.MIME_PNG, async (err, src) => {
        const tesseractReader = await Tesseract.createWorker('eng', 1, {
          corePath: runtime.getURL(`/tesseract/tesseract-core.wasm.js`),
          workerPath: runtime.getURL(`/tesseract/worker.min.js`),
          langPath: runtime.getURL(`/tesseract/`),
          gzip: false,
        });
        tesseractReader.setParameters({tessedit_char_whitelist: '0123456789'});

        const readResult = await tesseractReader.recognize(`${src}`);
        tesseractReader.terminate();

        res(readResult.data.text);
      });
  });

}

function registerInvestigateHandler(item, id) {
  const investigateBtn = item.querySelector('[data-wwid="investigate"]');

  investigateBtn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const phoneNumberEncrypted = IS_AD_PAGE
      ? document.querySelector('[id="EncryptedPhone"]')?.value
      : item.getAttribute('data-phencrypted');

    // Phone numbers are accessed by a separate call to the backend.
    // This gives an image result, the phone number being printed in png.
    const phoneNumberImgBase64 = await (await fetch('https://www.publi24.ro/DetailAd/PhoneNumberImages?Length=8', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        'EncryptedPhone': phoneNumberEncrypted,
        'body': '',
        'X-Requested-With': 'XMLHttpRequest'
      })
    })).text();

    const phoneNumber = await readNumbersFromBase64Png(phoneNumberImgBase64);
    localStorage.setItem(`ww:phone:${id}`, phoneNumber);

    if (localStorage.getItem(`ww:phone:${phoneNumber}:visible`) === 'false') {
      setItemVisible(item, false);
    }

    const encodedId = encodeURIComponent(id);
    const encodedPhoneNumber = encodeURIComponent(phoneNumber);
    window.open(`https://www.google.com/search?wwsid=${encodedId}&q=${encodedPhoneNumber}`);
  }
}

function registerInvestigateImgHandler(item, id) {
  const investigateImgBtn = item.querySelector('[data-wwid="investigate_img"]');

  const openImageInvestigation = (imgLink, index = 0) => {
    const encodedId = encodeURIComponent(id);
    const encodedLink = encodeURIComponent(imgLink);
    window.open(`https://www.google.com/?wwiid=${encodedId}&wwimg=${encodedLink}&wwindex=${index}`)
  }

  investigateImgBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    browser.storage.local.set({ [`ww:image_results:${id}`]: undefined });

    if (IS_AD_PAGE) {
      const imgs = document.querySelectorAll('[id="detail-gallery"] img');

      browser.storage.local.set({ [`ww:img_search_started_for`]: {wwid: id, count: imgs.length} }).then(() => {
        [...imgs].forEach((img, index) => {
          openImageInvestigation(img.getAttribute('src'), index);
        });
      });
    } else {
      const imgLink = item.querySelector('[class="listing-image"]').getAttribute('style')
        .replace(/.*(https:\/\/[^']+).*/, '$1');

      browser.storage.local.set({ [`ww:img_search_started_for`]: {wwid: id, count: 1} }).then(() => {
        openImageInvestigation(imgLink);
      });
    }
  }
}

function registerHandlers(item, id) {
  registerVisibilityHandler(item, id);
  registerInvestigateHandler(item, id);
  registerInvestigateImgHandler(item, id);
}

function registerItem(item, id) {
  const render = (searchResults) => {
    RENDER_CACHE_KEY[id] = JSON.stringify(searchResults);
    cleanupExistingRender(item);
    doRender(item, id, searchResults);
    registerHandlers(item, id);
  }

  browser.storage.local.get([`ww:search_results:${id}`, `ww:image_results:${id}`])
    .then(render);

  setInterval(() => {
    browser.storage.local.get([`ww:search_results:${id}`, `ww:image_results:${id}`]).then(r => {
      if (RENDER_CACHE_KEY[id] !== JSON.stringify(r)) {
        render(r);
      }
    });
  }, 800);
}

if (IS_AD_PAGE) {
  const id = document.body.querySelector('[data-url^="/DetailAd/IncrementViewHit"]')
    .getAttribute('data-url')
    .replace(/^.*?adid=([^&]+)&.*$/, "$1");
  const item = document.body.querySelector('[itemtype="https://schema.org/Offer"]');

  item.removeChild(item.lastElementChild);
  registerItem(item, id.toUpperCase());
} else {
  const items = document.body.querySelectorAll('[data-adid]');
  [...items].forEach((item) =>
    registerItem(item, item.getAttribute('data-adid'))
  );
}

