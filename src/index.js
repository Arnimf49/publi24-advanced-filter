if (typeof browser === "undefined") {
  var browser = chrome;
}

const runtime = browser.runtime;

const TESSERACT_PATH = `/library/tesseract/`;

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

const SAFE_LAST_DOMAIN_PARTS = [
  '.ro',
  'nimfomane.com',
  'ddcforum.com',
  'escorte.pro',
  'escortsromania.net',
  'excorte.net',
  'brailaescorte.com',
  'sexyro.com',
  'xlamma.com',
];

const IS_AD_PAGE = !!document.querySelector('[itemtype="https://schema.org/Offer"]');

const STORAGE_KEYS = (id) => [[`ww:search_results:${id}`, `ww:image_results:${id}`], [`ww:visibility:${id}`, `ww:no_phone:${id}`]];
const RENDER_CACHE_KEY = {};

const AD_TEMPLATE = Handlebars.templates.ad_template;
const ADS_TEMPLATE = Handlebars.templates.ads_template;
const SLIDER_TEMPLATE = Handlebars.templates.slider_template;
const SAVES_BUTTON_TEMPLATE = Handlebars.templates.saves_button_template;

const modalsOpen = [];

Handlebars.registerHelper('isUndefined', function(value) {
  return value === undefined;
});
Handlebars.registerHelper('inc', function(value) {
  return ++value;
});

const filterLinks = (links) => {
  return links.filter(l => !BLACKLISTED_LINKS.some(b => l.indexOf(b) === 0))
}

const sortLinks = (links) => {
  return links.sort((l1, l2) => {
    if (l1.indexOf('https://nimfomane.com/forum') === -1) {
      return 1;
    }
    if (l2.indexOf('https://nimfomane.com/forum') === -1) {
      return -1;
    }

    return l1.localeCompare(l2);
  })
}

function cleanupAdRender(item) {
  const existing = item.querySelector('.ww-container');
  if (existing) {
    existing.parentNode.removeChild(existing);
  }
}

function isDueToPhoneHidden(id) {
  const wasItemHidden = localStorage.getItem(`ww:visibility:${id}`) === 'false';
  const wasPhoneHidden =  localStorage.getItem(`ww:phone:${id}`) ?
    localStorage.getItem(`ww:phone:${localStorage.getItem(`ww:phone:${id}`)}:visible`) === 'false' :
    false;

  return !wasItemHidden && wasPhoneHidden;
}

function getItemVisibility(id) {
  const wasItemHidden = localStorage.getItem(`ww:visibility:${id}`) === 'false';
  const wasPhoneHidden =  localStorage.getItem(`ww:phone:${id}`) ?
    localStorage.getItem(`ww:phone:${localStorage.getItem(`ww:phone:${id}`)}:visible`) === 'false' :
    false;

  return !wasItemHidden && !wasPhoneHidden;
}

function extractUniqueDomains(links) {
  const domainMap = {};

  links.forEach((link, index) => {
    const domain = new URL(link).hostname.replace('www.', '');
    if (!domainMap[domain]) {
      domainMap[domain] = {
        links: [link],
        isSafe: SAFE_LAST_DOMAIN_PARTS.some((part) => domain.includes(part) )
      };
    } else {
      domainMap[domain].links.push(link);
    }
  });

  return Object.entries(domainMap).map(([domain, { links, isSafe }]) => ({ domain, links, isSafe }));
}


function renderAdElement(item, id, storage) {
  const searchLinks = storage[`ww:search_results:${id}`];
  const filteredSearchLinks = sortLinks(filterLinks(searchLinks || []));
  const nimfomaneLink = filteredSearchLinks.find(l => l.indexOf('https://nimfomane.com/forum/topic/') === 0);
  const imageSearchLinks = storage[`ww:image_results:${id}`] || [];
  const imageSearchDomains = extractUniqueDomains(imageSearchLinks);

  const panelElement = document.createElement('div');
  panelElement.className = 'ww-container';
  panelElement.onclick = (e) => e.stopPropagation();
  panelElement.innerHTML = AD_TEMPLATE({
    isAdPage: IS_AD_PAGE,
    isTempSaved: isTempSaved(itemToTempSaveId(item)),
    visible: getItemVisibility(id),
    dueToPhoneHidden: isDueToPhoneHidden(id),
    hasNoPhone: storage.local[`ww:no_phone:${id}`] === 'true',
    phone: localStorage.getItem(`ww:phone:${id}`),
    searchLinks,
    filteredSearchLinks,
    imageSearchDomains,
    nimfomaneLink
  });

  (item.querySelector('.article-txt') || item).appendChild(panelElement);
}

function setItemVisible(item, v) {
  const toggleVisibilityBtn = item.querySelector('[data-wwid="toggle-hidden"]');
  toggleVisibilityBtn.innerHTML = v ? 'Ascunde' : 'Ma-m răzgândit';
  item.style.opacity = v ? '1' : '0.3';
}

function createVisibilityClickHandler(item, id) {
  return async function (e) {
    e.preventDefault();
    e.stopPropagation();

    let visible = getItemVisibility(id);
    visible = !visible;
    this.disabled = true;

    let phoneNumber = localStorage.getItem(`ww:phone:${id}`) || await acquirePhoneNumber(item, id);
    if (phoneNumber) {
      localStorage.setItem(`ww:phone:${phoneNumber}:visible`, visible);
    }

    setItemVisible(item, visible);
    localStorage.setItem(`ww:visibility:${id}`, visible);
    this.disabled = false;
  };
}

function registerVisibilityHandler(item, id) {
  const toggleVisibilityBtn = item.querySelector('[data-wwid="toggle-hidden"]');
  setItemVisible(item, getItemVisibility(id));

  toggleVisibilityBtn.onclick = createVisibilityClickHandler(item, id);
}

async function readNumbersFromBase64Png(data) {
  const jimpImg = await Jimp.read(`data:image/png;base64,${data}`);

  return new Promise(res => {
    jimpImg.invert()
      .getBase64(Jimp.MIME_PNG, async (err, src) => {
        const tesseractReader = await Tesseract.createWorker('eng', 1, {
          corePath: runtime.getURL(`${TESSERACT_PATH}tesseract-core.wasm.js`),
          workerPath: runtime.getURL(`${TESSERACT_PATH}worker.min.js`),
          langPath: runtime.getURL(TESSERACT_PATH),
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

async function investigateNumber(item, id) {
  const phoneNumber = await acquirePhoneNumber(item, id);

  if (!phoneNumber) {
    localStorage.setItem(`ww:no_phone:${id}`, 'true');
    return;
  }

  if (localStorage.getItem(`ww:phone:${phoneNumber}:visible`) === 'false') {
    setItemVisible(item, false);
  }

  const encodedId = encodeURIComponent(id);
  const encodedPhoneNumber = encodeURIComponent(phoneNumber);
  window.open(`https://www.google.com/search?wwsid=${encodedId}&q=${encodedPhoneNumber}`);
}

function registerInvestigateHandler(item, id) {
  const investigateBtn = item.querySelector('[data-wwid="investigate"]');

  investigateBtn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    investigateBtn.disabled = true;
    await investigateNumber(item, id);
    investigateBtn.disabled = false;
  }
}

function getItemUrl(itemOrUrl) {
  if (IS_AD_PAGE) {
    return location.toString();
  }
  if (typeof itemOrUrl === 'string') {
    return itemOrUrl;
  }
  return itemOrUrl.getAttribute('onclick').replace(/^.*'(http[^']+)'.*/, '$1');
}

async function loadInAdPage(itemOrId) {
  const url = getItemUrl(itemOrId);
  const pageResponse = await fetch(url);

  if (!pageResponse.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  const html = await pageResponse.text();
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp;
}

async function acquireEncryptedPhoneNumber(item) {
  const adPage = await loadInAdPage(item);
  return adPage.querySelector('[id="EncryptedPhone"]')?.value;
}

async function acquireSliderImages(item) {
  const adPage = await loadInAdPage(item);
  const items = [...adPage.querySelectorAll('[id="detail-gallery"] img')]
    .map((item) => item.getAttribute('src').replace('/top/', '/extralarge/'));

  if (items.length) {
    return items;
  }

  return [...adPage.querySelectorAll('.imgZone img')]
    .map((item) => item.getAttribute('src'));
}

function createInvestigateImgClickHandler(id, images) {
  const openImageInvestigation = (imgLink, index = 0) => {
    const encodedId = encodeURIComponent(id);
    const encodedLink = encodeURIComponent(imgLink);
    window.open(`https://www.google.com/?wwiid=${encodedId}&wwimg=${encodedLink}&wwindex=${index}`)
  }

  return (e) => {
    e.preventDefault();
    e.stopPropagation();

    browser.storage.local.set({ [`ww:image_results:${id}`]: undefined });

    let imgs;

    if (images && images.length) {
      imgs = images;
    }
    else if (IS_AD_PAGE) {
      imgs = document.body.querySelectorAll('[id="detail-gallery"] img');

      // Maybe the post has only one picture. In that case gallery is not shown.
      if (imgs.length === 0) {
        imgs = document.body.querySelectorAll('[class="detailViewImg "]');
      }
    }

    browser.storage.local.set({ [`ww:img_search_started_for`]: {wwid: id, count: imgs.length} }).then(() => {
      [...imgs].forEach((img, index) => {
        openImageInvestigation(img.getAttribute('src'), index);
      });
    });
  };
}

function registerInvestigateImgHandler(item, id) {
  const investigateImgBtn = item.querySelector('[data-wwid="investigate_img"]');

  investigateImgBtn.onclick = createInvestigateImgClickHandler(id, item.querySelectorAll('.art-img img'));
}

function itemToTempSaveId(item) {
  return item.getAttribute('data-articleid') + '|' + getItemUrl(item);
}

function tempSaveValueParts(id) {
  return id.split('|');
}

function getTempSaved() {
  return JSON.parse(localStorage.getItem('ww:temp_save') || '[]');
}

function toggleTempSave(id) {
  let items = getTempSaved();

  if (items.includes(id)) {
    items = items.filter(it => it !== id);
  } else {
    items.push(id);
  }

  localStorage.setItem('ww:temp_save', JSON.stringify(items));
}

function isTempSaved(id) {
  return getTempSaved().includes(id);
}

function registerTemporarySaveHandler(item, id) {
  const tempSaveBtn = item.querySelector('[data-wwid="temp-save"]');
  const tempSaveId = itemToTempSaveId(item);

  tempSaveBtn.onclick = () => {
    toggleTempSave(tempSaveId);
    renderAdItem(item, id);

    const modalParent = item.closest('[data-ww="favorites-modal"]');
    if (modalParent && typeof modalParent.removeAd === 'function') {
      modalParent.removeAd(item);
    }
  }
}

function registerOpenImagesSliderHandler(item, id) {
  const button = item.querySelector('.art-img a');

  button.onclick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const images = await acquireSliderImages(item);
    const visible = getItemVisibility(id);

    const sliderContainer = document.createElement('div');
    sliderContainer.id = '_ww_slider';
    sliderContainer.innerHTML = SLIDER_TEMPLATE({images, visible});
    modalsOpen.push(sliderContainer);

    document.body.appendChild(sliderContainer);
    new Splide( '#_ww_slider .splide', { focus: 'center', type: 'loop', keyboard: 'global' }).mount();

    const close = () => {
      document.body.removeChild(sliderContainer);
      modalsOpen.pop();
      window.removeEventListener('keydown',  closeOnKey);
    };
    const closeOnKey = (e) => {
      if (e.key === 'Escape' && modalsOpen[modalsOpen.length-1] === sliderContainer) close();
    };

    window.addEventListener('keydown',  closeOnKey);

    const visibilityButton = sliderContainer.querySelector('[data-wwid="toggle-hidden"]');
    const visibilityHandler = createVisibilityClickHandler(item, id);
    visibilityButton.onclick = function (e) {
      e.stopPropagation();
      visibilityHandler.apply(this, [e]);
      close();
    };

    const analyzeImagesButton = sliderContainer.querySelector('[data-wwid="analyze-images"]');
    const imageInvestigateHandler = createInvestigateImgClickHandler(id, sliderContainer.querySelectorAll('li:not(.splide__slide--clone) img'));
    analyzeImagesButton.onclick = async (e) => {
      e.stopPropagation();
      if (!localStorage.getItem(`ww:phone:${id}`)) {
        await investigateNumber(item, id);
      }
      imageInvestigateHandler.apply(this, [e]);
    };

    const closeButton = sliderContainer.querySelector('[data-wwid="close"]');
    closeButton.onclick = close;
    sliderContainer.onclick = close;

    sliderContainer.querySelectorAll('.splide__arrow')
      .forEach((el) => el.addEventListener('click', (e) => e.stopPropagation()));
  }
}

function registerHandlers(item, id) {
  registerVisibilityHandler(item, id);
  registerInvestigateHandler(item, id);
  registerInvestigateImgHandler(item, id);
  registerTemporarySaveHandler(item, id);

  if (!IS_AD_PAGE) {
    registerOpenImagesSliderHandler(item, id);
  }
}

async function getStorageItems(browserKeys, localKeys) {
  const browserValues = await browser.storage.local.get(browserKeys);
  browserValues.local = {};
  localKeys.forEach(k => browserValues.local[k] = localStorage.getItem(k))
  return browserValues;
}

async function loadTempSaveAdsData() {
  const items = getTempSaved().reverse();
  let itemData = await Promise.all(
    items.map((tempSaveId) => {
      const [id, url] = tempSaveValueParts(tempSaveId);
      return loadInAdPage(url)
        .then((itemPage) => ({
          id,
          url,
          phone: localStorage.getItem(`ww:phone:${id}`),
          title: itemPage.querySelector('[itemscope] h1[itemprop="name"]').innerHTML,
          description: itemPage.querySelector('[itemscope] [itemprop="description"]').innerHTML,
          image: itemPage.querySelector('[itemprop="image"]').src,
        }))
        .catch(async (e) => {
          console.error(e);
          toggleTempSave(id + '|' + url);
          return null;
        });
    }));

  itemData = itemData.filter((f) => !!f);

  for (let i = 0; i < itemData.length; i++) {
    if (!itemData[i].phone) {
      continue;
    }
    let duplicateIndex = itemData.findIndex((f, j) => j > i && f.phone === itemData[i].phone);
    if (duplicateIndex !== -1) {
      const duplicate = itemData[duplicateIndex];
      duplicate.duplicate = true;
      for (let j = duplicateIndex; j > i + 1; j--) {
        itemData[j] = itemData[j - 1];
      }
      itemData[i + 1] = duplicate;
    }
  }

  return itemData;
}

async function renderTemporarySavesModal() {
  let itemRenderCleaners;
  const container = document.createElement('div');
  container.setAttribute('data-ww', 'favorites-modal');
  container.innerHTML = ADS_TEMPLATE({itemData: await loadTempSaveAdsData()});
  document.body.appendChild(container);
  modalsOpen.push(container);

  container.removeAd = (adElement) => {
    adElement.remove();
    adElement.stopRender();
  };

  const close = () => {
    itemRenderCleaners.forEach(c => c());
    document.body.removeChild(container);
    modalsOpen.pop();
    window.removeEventListener('keydown',  closeOnKey);
  };
  const closeOnKey = (e) => {
    if (e.key === 'Escape' && modalsOpen[modalsOpen.length-1] === container) close();
  };

  window.addEventListener('keydown',  closeOnKey);
  const closeButton = container.querySelector('[data-wwid="close"]');
  closeButton.onclick = close;
  container.onclick = close;

  itemRenderCleaners = registerAdsInContext(container);
}

function renderTemporarySavesButton() {
  const existing = document.body.querySelector('[data-ww="saves-button"]');
  existing && existing.parentNode.removeChild(existing);

  const saves = getTempSaved();
  if (saves.length === 0) {
    return;
  }

  const element = document.createElement('div');
  element.innerHTML = SAVES_BUTTON_TEMPLATE({count: saves.length});
  element.setAttribute('data-ww', 'saves-button');
  document.body.appendChild(element);

  element.querySelector('button').onclick = renderTemporarySavesModal;
}

function registerTemporarySavesButton() {
  renderTemporarySavesButton();

  let lastCount = getTempSaved().length;
  setInterval(() => {
    if (lastCount !== getTempSaved().length) {
      lastCount = getTempSaved().length;
      renderTemporarySavesButton()
    }
  }, 1000);
}

function renderAdWithCleanupAndCache(item, id, searchResults) {
  RENDER_CACHE_KEY[id] = JSON.stringify(searchResults);
  cleanupAdRender(item);
  renderAdElement(item, id, searchResults);
  registerHandlers(item, id);
}

function renderAdItem(item, id) {
  getStorageItems(...STORAGE_KEYS(id))
    .then((r) => renderAdWithCleanupAndCache(item, id, r));
}

function registerAdItem(item, id) {
  renderAdItem(item, id);

  const interval = setInterval(() => {
    getStorageItems(...STORAGE_KEYS(id)).then(r => {
      if (RENDER_CACHE_KEY[id] !== JSON.stringify(r)) {
        renderAdWithCleanupAndCache(item, id, r);
      }
    });
  }, 800);

  const stopRender = () => clearInterval(interval);
  item.stopRender = stopRender;

  return stopRender;
}

function registerAdsInContext(context) {
  const items = context.querySelectorAll('[data-articleid]');
  return [...items].map((item) => registerAdItem(item, item.getAttribute('data-articleid')));
}

if (IS_AD_PAGE) {
  const id = document.body.querySelector('[data-url^="/DetailAd/IncrementViewHit"]')
    .getAttribute('data-url')
    .replace(/^.*?adid=([^&]+)&.*$/, "$1");
  const item = document.body.querySelector('[itemtype="https://schema.org/Offer"]');
  item.setAttribute('data-articleid', id);

  item.removeChild(item.lastElementChild);
  item.removeChild(item.lastElementChild);
  registerAdItem(item, id.toUpperCase());
} else {
  registerAdsInContext(document.body);
  registerTemporarySavesButton();
}
