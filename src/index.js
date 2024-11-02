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
  'https://www.telnavi.jp/',
  'https://www.reverseau.com/',
  'https://www.telguarder.com/',
  'https://information.com/people/',
  'https://health.information.com/reverse-phone-lookup/',
  'https://www.reverseaustralia.com/',
  'https://unmask.com/',
  'https://www.e-aidem.com/',
  'https://phone-book.tw/',
  'https://escorte.lol/',
  'https://haisalut.ro/',
  'https://tel-search.net/',
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
  'escorte-cluj.com',
];

const IS_MOBILE_VIEW = ('ontouchstart' in document.documentElement);
const IS_AD_PAGE = !!document.querySelector('[itemtype="https://schema.org/Offer"]');

const STORAGE_KEYS = (id) => [[`ww:search_results:${id}`, `ww:image_results:${id}`], [WWStorage.getAdStoreKey(id)]];

const AD_TEMPLATE = Handlebars.templates.ad_template;
const ADS_TEMPLATE = Handlebars.templates.ads_template;
const FAVORITES_MODAL_TEMPLATE = Handlebars.templates.favorites_modal_template;
const DUPLICATES_MODAL_TEMPLATE = Handlebars.templates.duplicates_modal_template;
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
  const wasItemHidden = WWStorage.isAdVisible(id);
  const wasPhoneHidden =  WWStorage.getAdPhone(id) ?
    WWStorage.isPhoneHidden(WWStorage.getAdPhone(id)) :
    false;

  return !wasItemHidden && wasPhoneHidden;
}

function getItemVisibility(id) {
  const wasItemHidden = WWStorage.isAdVisible(id);
  const wasPhoneHidden =  WWStorage.getAdPhone(id) ?
    WWStorage.isPhoneHidden(WWStorage.getAdPhone(id)) :
    false;

  return !wasItemHidden && !wasPhoneHidden;
}

function processImageLinks(links, itemUrl) {
  const domainMap = {};

  links
    .filter(link => {
      return !(link.indexOf("https://www.publi24.ro/") === 0 && link.match(/\/\?q=|&q=/)) &&
        link !== itemUrl;
    })
    .forEach((link) => {
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

  return Object.entries(domainMap)
    .map(([domain, { links, isSafe }]) => ({ domain, links, isSafe }))
    .sort(({isSafe: isSafeA}, {isSafe: isSafeB}) => isSafeA && !isSafeB ? -1 : 0);
}

function renderModal(html) {
  let itemRenderCleaners;

  const container = document.createElement('div');
  container.innerHTML = html;
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

  return {container, close};
}


function renderAdElement(item, id, storage) {
  const itemUrl = getItemUrl(item);
  const phone = WWStorage.getAdPhone(id);

  // @TODO: Artifact from storage migration. To be removed in a following version.
  WWStorage.addPhoneAd(phone, id, itemUrl);

  const searchLinks = storage[`ww:search_results:${id}`];
  const filteredSearchLinks = sortLinks(filterLinks(searchLinks || []));
  const nimfomaneLink = filteredSearchLinks.find(l => l.indexOf('https://nimfomane.com/forum/topic/') === 0);
  const imageSearchLinks = storage[`ww:image_results:${id}`];
  const imageSearchDomains = imageSearchLinks ? processImageLinks(imageSearchLinks, itemUrl) : undefined;

  const panelElement = document.createElement('div');
  panelElement.className = 'ww-container';
  panelElement.onclick = (e) => e.stopPropagation();
  panelElement.innerHTML = AD_TEMPLATE({
    IS_MOBILE_VIEW,
    IS_AD_PAGE,
    hasDuplicateAdsWithSamePhone: WWStorage.getPhoneAds(phone).length > 1,
    numberOfAdsWithSamePhone: WWStorage.getPhoneAds(phone).length,
    isTempSaved: WWStorage.isTempSaved(itemToTempSaveId(item)),
    visible: getItemVisibility(id),
    dueToPhoneHidden: isDueToPhoneHidden(id),
    hasNoPhone: WWStorage.hasAdNoPhone(id),
    phone,
    searchLinks,
    filteredSearchLinks,
    imageSearchDomains,
    nimfomaneLink
  });

  (item.querySelector('.article-txt') || item).appendChild(panelElement);
}

function setItemVisible(item, v) {
  item.style.opacity = v ? '1' : '0.3';
}

function createVisibilityClickHandler(item, id) {
  return async function (e) {
    e.preventDefault();
    e.stopPropagation();

    let visible = getItemVisibility(id);
    visible = !visible;
    this.disabled = true;

    let phoneNumber = WWStorage.getAdPhone(id) || await acquirePhoneNumber(item, id);
    if (phoneNumber) {
      WWStorage.setPhoneHidden(phoneNumber, !visible);
    }

    setItemVisible(item, visible);
    WWStorage.setAdVisibility(id, visible);
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
  let phone;

  if (IS_MOBILE_VIEW) {
    const adPage = await loadInAdPage(item, id);
    const phoneNumber = adPage.innerHTML.match(/var cnt = ['"](\d+)['"]/);

    if (phoneNumber) {
      phone = phoneNumber[1];
    }
  } else {
    const phoneNumberEncrypted = IS_AD_PAGE
      ? document.querySelector('[id="EncryptedPhone"]')?.value
      : await acquireEncryptedPhoneNumber(item);

    if (phoneNumberEncrypted) {
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

      phone = await readNumbersFromBase64Png(phoneNumberImgBase64);
    }
  }

  if (!phone) {
    WWStorage.setAdNoPhone(id);
    return false;
  }

  WWStorage.setAdPhone(id, phone.trim());
  WWStorage.addPhoneAd(phone.trim(), id, getItemUrl(item))

  if (WWStorage.hasAdNoPhone(id)) {
    WWStorage.setAdNoPhone(id, false);
  }

  return phone.trim();
}

async function investigateNumber(item, id, open = true) {
  const phoneNumber = await acquirePhoneNumber(item, id);

  if (!phoneNumber) {
    return false;
  }

  if (WWStorage.isPhoneHidden(phoneNumber)) {
    setItemVisible(item, false);
  }

  if (open) {
    const encodedId = encodeURIComponent(id);
    const encodedPhoneNumber = encodeURIComponent(phoneNumber);
    window.open(`https://www.google.com/search?wwsid=${encodedId}&q=${encodedPhoneNumber}`);
  }

  return true;
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

  if (IS_MOBILE_VIEW) {
    return [...new Set(adPage.innerHTML.match(/https:\/\/s3\.publi24\.ro\/[^.]+\.jpg/g))];
  }

  const items = [...adPage.querySelectorAll('[id="detail-gallery"] img')]
    .map((item) => item.getAttribute('src').replace('/top/', '/extralarge/'));

  if (items.length) {
    return items;
  }

  return [...adPage.querySelectorAll('.imgZone img')]
    .map((item) => item.getAttribute('src'));
}

function createInvestigateImgClickHandler(id, item) {
  const openImageInvestigation = (imgLink, index = 0) => {
    const encodedId = encodeURIComponent(id);
    const encodedLink = encodeURIComponent(imgLink);
    window.open(`https://lens.google.com/uploadbyurl?url=${encodedLink}&wwiid=${encodedId}&wwindex=${index}`)
  }

  return async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!WWStorage.getAdPhone(id) && !(await investigateNumber(item, id, false))) {
      return;
    }

    browser.storage.local.set({ [`ww:image_results:${id}`]: undefined });

    let imgs;

    if (IS_AD_PAGE && IS_MOBILE_VIEW) {
      imgs = [...new Set(document.body.innerHTML.match(/https:\/\/s3\.publi24\.ro\/[^\/]+\/large\/[^.]+\.jpg/g))];
    }
    else if (IS_AD_PAGE) {
      imgs = [...document.body.querySelectorAll('[id="detail-gallery"] img')]
        .map(img => img.getAttribute('src'));

      // Maybe the post has only one picture. In that case gallery is not shown.
      if (imgs.length === 0) {
        imgs = [...document.body.querySelectorAll('[class="detailViewImg "]')]
          .map(img => img.getAttribute('src'));
      }
    }
    else {
      imgs = await acquireSliderImages(item);
    }

    browser.storage.local.set({ [`ww:img_search_started_for`]: {wwid: id, count: imgs.length} }).then(() => {
      if (!IS_MOBILE_VIEW) {
        imgs.forEach((img, index) => openImageInvestigation(img, index));
      } else {
        // Open tabs for investigate one by one since on mobile opening all at once does not work.
        let index = 0;
        const openNext = () => {
          if (!imgs[index]) {
            document.removeEventListener('visibilitychange', openNext);
          }
          else if (document.visibilityState === 'visible') {
            openImageInvestigation(imgs[index], index++);
          }
        };
        document.addEventListener('visibilitychange', openNext);
        openNext();
      }
    });
  };
}

function registerInvestigateImgHandler(item, id) {
  const investigateImgBtn = item.querySelector('[data-wwid="investigate_img"]');

  investigateImgBtn.onclick = createInvestigateImgClickHandler(id, item);
}

function itemToTempSaveId(item) {
  return item.getAttribute('data-articleid') + '|' + getItemUrl(item);
}

function adUuidParts(id) {
  return id.split('|');
}

function registerTemporarySaveHandler(item, id) {
  const tempSaveBtn = item.querySelector('[data-wwid="temp-save"]');
  const tempSaveId = itemToTempSaveId(item);

  tempSaveBtn.onclick = () => {
    WWStorage.toggleTempSave(tempSaveId);
    renderAdItem(item, id);

    const modalParent = item.closest('[data-ww="favorites-modal"]');
    if (modalParent && typeof modalParent.removeAd === 'function') {
      modalParent.removeAd(item);
    }
  }
}

function registerDuplicatesModalHandler(item, id) {
  const duplicatesBtn = item.querySelector('[data-wwid="duplicates"]');

  if (!duplicatesBtn) {
    return;
  }

  duplicatesBtn.onclick = async () => {
    const phone = WWStorage.getAdPhone(id);
    const duplicateUuids = WWStorage.getPhoneAds(phone);

    const html = DUPLICATES_MODAL_TEMPLATE({
      IS_MOBILE_VIEW,
      content: ADS_TEMPLATE({
        IS_MOBILE_VIEW,
        itemData: await loadInAdsData(duplicateUuids),
      }),
      count: duplicateUuids.length,
      phone,
    });
    const {container, close} = renderModal(html);

    const hideAllBtn = container.querySelector('[data-wwid="hide-all"]');
    hideAllBtn.onclick = () => {
      duplicateUuids.forEach((adUuid) => {
        WWStorage.setAdVisibility(adUuidParts(adUuid)[0], false);
      });
      WWStorage.setPhoneHidden(phone);
      close();
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
    sliderContainer.innerHTML = SLIDER_TEMPLATE({images, visible, IS_MOBILE_VIEW});
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
    const imageInvestigateHandler = createInvestigateImgClickHandler(id, item);
    analyzeImagesButton.onclick = async (e) => {
      e.stopPropagation();
      await imageInvestigateHandler.apply(this, [e]);
      close();
    };

    const closeButton = sliderContainer.querySelector('[data-wwid="close"]');
    closeButton.onclick = close;
    sliderContainer.onclick = close;

    sliderContainer.querySelectorAll('.splide__arrow')
      .forEach((el) => el.addEventListener('click', (e) => e.stopPropagation()));

    setTimeout(() => {
      // We can pre-analyze the ad if the user looks at the picture. They are most likely interested.
      if (!WWStorage.getAdPhone(id)) {
        acquirePhoneNumber(item, id);
      }
    }, 10);
  }
}

function registerHandlers(item, id) {
  registerVisibilityHandler(item, id);
  registerInvestigateHandler(item, id);
  registerInvestigateImgHandler(item, id);
  registerTemporarySaveHandler(item, id);
  registerDuplicatesModalHandler(item, id);

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

async function getPhoneQrCode(phone) {
  return new Promise((res, rej) => {
    try {
      QRCode.toDataURL(`tel:${phone}`, (err, url) => {
        if (err) {
          rej(err);
        } else {
          res(url);
        }
      });
    } catch (error) {
      rej(error);
    }
  });
}

async function loadInAdsData(adUuids) {
  let itemData = await Promise.all(
    adUuids.map((adUuid) => {
      const [id, url] = adUuidParts(adUuid);

      return loadInAdPage(url)
        .then(async (itemPage) => ({
          IS_MOBILE_VIEW,
          id,
          url,
          phone: WWStorage.getAdPhone(id),
          qrCode: WWStorage.getAdPhone(id) && await getPhoneQrCode(WWStorage.getAdPhone(id)),
          title: itemPage.querySelector('[itemscope] h1[itemprop="name"]').innerHTML,
          description: itemPage.querySelector('[itemscope] [itemprop="description"]').innerHTML
            .replace(/<[^>]*>/gi, ' ')
            .replace(/\s+/g, ' ')
            .replace(/Publi24_\d+/, '')
            .trim().substring(0, 290),
          image: IS_MOBILE_VIEW
            ? itemPage.querySelector('[itemprop="associatedMedia"] li').style.background.match(/url\(['"]([^'"]+)['"]\)/)[1]
            : itemPage.querySelector('[itemprop="image"]').src,
          location: IS_MOBILE_VIEW
            ? itemPage.querySelector('[class="location"]')?.textContent.trim()
            : itemPage.querySelector('[itemtype="https://schema.org/Place"]')?.textContent.trim(),
          date: itemPage.querySelector('[itemprop="validFrom"]')?.textContent.trim(),
        }))
        .catch(async (e) => {
          console.error(e);
          WWStorage.toggleTempSave(id + '|' + url);
          return null;
        });
    }));

  return itemData.filter((f) => !!f);
}

async function loadTempSaveAdsData() {
  const adUuids = WWStorage.getTempSaved().reverse();
  let itemData = loadInAdsData(adUuids);

  for (let i = 0; i < itemData.length; i++) {
    if (!itemData[i].phone) {
      continue;
    }
    let duplicateIndex = itemData.findIndex((f, j) => j > i && f.phone.trim() === itemData[i].phone.trim());
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
  let html = FAVORITES_MODAL_TEMPLATE({content: ADS_TEMPLATE({itemData: await loadTempSaveAdsData(), IS_MOBILE_VIEW}), IS_MOBILE_VIEW});
  let {container, close} = renderModal(html);

  container.setAttribute('data-ww', 'favorites-modal');

  const clearFavoritesButton = container.querySelector('[data-wwid="clear-favorites"]');
  clearFavoritesButton.onclick = () => {
    WWStorage.clearTempSave();
    close();
  };
}

function renderTemporarySavesButton() {
  const existing = document.body.querySelector('[data-ww="saves-button"]');
  existing && existing.parentNode.removeChild(existing);

  const saves = WWStorage.getTempSaved();
  if (saves.length === 0) {
    return;
  }

  const element = document.createElement('div');
  element.innerHTML = SAVES_BUTTON_TEMPLATE({count: saves.length, IS_MOBILE_VIEW});
  element.setAttribute('data-ww', 'saves-button');
  document.body.appendChild(element);

  element.querySelector('button').onclick = renderTemporarySavesModal;
}

function registerTemporarySavesButton() {
  renderTemporarySavesButton();

  let lastCount = WWStorage.getTempSaved().length;
  setInterval(() => {
    if (lastCount !== WWStorage.getTempSaved().length) {
      lastCount = WWStorage.getTempSaved().length;
      renderTemporarySavesButton()
    }
  }, 1000);
}

function renderAdWithCleanupAndCache(item, id, searchResults) {
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
  const renderCache = {};

  const interval = setInterval(() => {
    getStorageItems(...STORAGE_KEYS(id)).then(r => {
      if (renderCache[id] !== JSON.stringify(r)) {
        renderCache[id] = JSON.stringify(r);
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

WWStorage.upgrade()
  .then(() => {
    if (IS_AD_PAGE) {
      const id = document.body.querySelector('[data-url^="/DetailAd/IncrementViewHit"]')
        .getAttribute('data-url')
        .replace(/^.*?adid=([^&]+)&.*$/, "$1");
      const item = document.body.querySelector('[itemtype="https://schema.org/Offer"]');
      item.setAttribute('data-articleid', id);

      if (!IS_MOBILE_VIEW) {
        item.removeChild(item.lastElementChild);
      }
      item.removeChild(item.lastElementChild);
      registerAdItem(item, id.toUpperCase());
    } else {
      registerAdsInContext(document.body);
      if (location.pathname.startsWith('/anunturi/matrimoniale')) {
        registerTemporarySavesButton();
      }
    }
  })
