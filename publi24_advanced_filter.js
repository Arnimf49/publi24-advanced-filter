if (typeof browser === "undefined") {
  var browser = chrome;
}

const runtime = browser.runtime;

const BLACKLISTED_LINKS = [
  'https://meiwakucheck.com/',
  'https://www.jpnumber.com/',
  'https://telefonforsaljare.nu/',
  'https://www.180.se/',
  'https://www.180.dk/',
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
  'https://www.hitta.se/',
  'https://chonso.mobifone.vn/',
  'http://chonso.mobifone.vn/',
  'https://denwacho.net/',
  'https://www.telefonforsaljare.nu/',
  'https://sunat.ro/',
  'https://www.telefoncontact.online/',
  'https://www.telefonreclamatii.online/',
  'https://www.contact-telefon.online/',
  'https://mobile.inelenco.com/',
  'https://genealogic.review/',
  'https://www.merinfo.se/',
  'https://telefon-kontakte.ch/',
  'http://www.telefonforsaljare.nu/',
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

const sortLinks = (links) => {
  return links.sort((l1, l2) => {
    if (l1.indexOf('https://nimfomane.com/forum') === -1) {
      return 1;
    }

    return l1.localeCompare(l2);
  })
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

function doRender(item, id, storage) {
  const phone = localStorage.getItem(`ww:phone:${id}`);
  const visible = getItemVisibility(id);
  const searchLinks = storage[`ww:search_results:${id}`];
  const hasNoPhone = storage.local[`ww:no_phone:${id}`] === 'true';
  const filteredSearchLinks = sortLinks(filterLinks(searchLinks || []));
  const nimfomaneLink = filteredSearchLinks.find(l => l.indexOf('https://nimfomane.com/forum/topic/') === 0);

  const imageSearchLinks = storage[`ww:image_results:${id}`];
  const filteredImageSearchLinks = sortLinks(filterLinks(imageSearchLinks || []));

  const panelElement = document.createElement('div');
  panelElement.className = 'ww-container';
  panelElement.onclick = (e) => e.stopPropagation();
  panelElement.innerHTML = TEMPLATE({
    visible,
    phone,
    hasNoPhone,
    searchLinks,
    filteredSearchLinks,
    imageSearchLinks,
    filteredImageSearchLinks,
    nimfomaneLink
  });

  (item.querySelector('.article-txt') || item).appendChild(panelElement);
}

function setItemVisible(item, v) {
  const toggleVisibilityBtn = item.querySelector('[data-wwid="toggle-hidden"]');
  toggleVisibilityBtn.innerHTML = v ? 'Ascunde' : 'Ma-m răzgândit';
  item.style.opacity = v ? '1' : '0.3';
}

function registerVisibilityHandler(item, id) {
  const toggleVisibilityBtn = item.querySelector('[data-wwid="toggle-hidden"]');
  setItemVisible(item, getItemVisibility(id));

  toggleVisibilityBtn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let visible = getItemVisibility(id);
    visible = !visible;
    toggleVisibilityBtn.disabled = true;

    let phoneNumber = localStorage.getItem(`ww:phone:${id}`) || await acquirePhoneNumber(item, id);
    if (phoneNumber) {
      localStorage.setItem(`ww:phone:${phoneNumber}:visible`, visible);
    }

    setItemVisible(item, visible);
    localStorage.setItem(`ww:visibility:${id}`, visible);
    toggleVisibilityBtn.disabled = false;
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

async function acquirePhoneNumber(item, id) {
  const phoneNumberEncrypted = IS_AD_PAGE
    ? document.querySelector('[id="EncryptedPhone"]')?.value
    : await acquireEncryptedPhoneNumber(item);

  if (!phoneNumberEncrypted) {
    return false;
  }

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

  return phoneNumber;
}

function registerInvestigateHandler(item, id) {
  const investigateBtn = item.querySelector('[data-wwid="investigate"]');

  investigateBtn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    investigateBtn.disabled = true;

    const phoneNumber = await acquirePhoneNumber(item, id);

    if (!phoneNumber) {
      localStorage.setItem(`ww:no_phone:${id}`, 'true');
      investigateBtn.disabled = false;
      return;
    }

    if (localStorage.getItem(`ww:phone:${phoneNumber}:visible`) === 'false') {
      setItemVisible(item, false);
    }

    const encodedId = encodeURIComponent(id);
    const encodedPhoneNumber = encodeURIComponent(phoneNumber);
    window.open(`https://www.google.com/search?wwsid=${encodedId}&q=${encodedPhoneNumber}`);
    investigateBtn.disabled = false;
  }
}

async function acquireEncryptedPhoneNumber(item) {
  const url = item.getAttribute('onclick').replace(/^.*\.href='([^']+)'.*/, '$1');
  const pageResponse = await fetch(url);
  const html = await pageResponse.text();
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.querySelector('[id="EncryptedPhone"]')?.value;
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
      let imgs = document.querySelectorAll('[id="detail-gallery"] img');

      // Maybe the post has only one picture. In that case gallery is not shown.
      if (imgs.length === 0) {
        imgs = document.querySelectorAll('[class="detailViewImg "]');
      }

      browser.storage.local.set({ [`ww:img_search_started_for`]: {wwid: id, count: imgs.length} }).then(() => {
        [...imgs].forEach((img, index) => {
          openImageInvestigation(img.getAttribute('src'), index);
        });
      });
    } else {
      const imgLink = item.querySelector('img').getAttribute('src');

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

async function getStorageItems(browserKeys, localKeys) {
  const browserValues = await browser.storage.local.get(browserKeys);
  browserValues.local = {};
  localKeys.forEach(k => browserValues.local[k] = localStorage.getItem(k))
  return browserValues;
}

function registerItem(item, id) {
  const render = (searchResults) => {
    RENDER_CACHE_KEY[id] = JSON.stringify(searchResults);
    cleanupExistingRender(item);
    doRender(item, id, searchResults);
    registerHandlers(item, id);
  }

  const storageKeys = [[`ww:search_results:${id}`, `ww:image_results:${id}`], [`ww:visibility:${id}`, `ww:no_phone:${id}`]];
  getStorageItems(...storageKeys)
    .then(render);

  setInterval(() => {
    getStorageItems(...storageKeys).then(r => {
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
  item.removeChild(item.lastElementChild);
  registerItem(item, id.toUpperCase());
} else {
  const items = document.body.querySelectorAll('[data-articleid]');
  [...items].forEach((item) =>
    registerItem(item, item.getAttribute('data-articleid'))
  );
}

