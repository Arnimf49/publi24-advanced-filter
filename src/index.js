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
  'https://www.publi24.ro/cv?jobapplyid=',
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
  'escorte365.com',
  'anunt.online'
];

const PRIO_DOMAINS = [
  'publi24.ro',
  'www.publi24.ro',
  'nimfomane.com',
  'ddcforum.com',
];

const AD_LOAD_CACHE = {};

const IS_AD_PAGE = !!document.querySelector('[itemtype="https://schema.org/Offer"]');

const STORAGE_KEYS = (id) => [[`ww:search_results:${id}`, `ww:image_results:${id}`], WWStorage.getAdStoreKeys(id)];

const AD_TEMPLATE = Handlebars.templates.ad_template;
const PHONE_AND_TAGS_TEMPLATE = Handlebars.templates.phone_and_tags;
const ADS_TEMPLATE = Handlebars.templates.ads_template;
const FAVORITES_MODAL_TEMPLATE = Handlebars.templates.favorites_modal_template;
const DUPLICATES_MODAL_TEMPLATE = Handlebars.templates.ads_modal_template;
const SLIDER_TEMPLATE = Handlebars.templates.slider_template;
const GLOBAL_BUTTONS_TEMPLATE = Handlebars.templates.global_buttons_template;
const INFO_TEMPLATE = Handlebars.templates.info_template;
const HIDE_REASON_TEMPLATE = Handlebars.templates.hide_reason_template;
const SETTINGS_MODAL_TEMPLATE = Handlebars.templates.settings_modal_template;
const SETTINGS_TEMPLATE = Handlebars.templates.settings_template;
const FULL_SCREEN_LOADER_TEMPLATE = Handlebars.templates.full_screen_loader_template;
const MESSAGE_MODAL_TEMPLATE = Handlebars.templates.message_modal_template;

const modalsOpen = [];
let currentInvestigatePromise = Promise.resolve();
let investigateTimeout = 500;

const AUTO_HIDE_CRITERIA = {
  maxAge: {
    condition: ({maxAgeValue}, value) => maxAgeValue < value,
    value: 'age',
    reason: ({maxAgeValue}) => `peste ${maxAgeValue} de ani`,
  },
  minHeight: {
    condition: ({minHeightValue}, value) => minHeightValue > value,
    value: 'height',
    reason: ({minHeightValue}) => `sub ${minHeightValue}cm`,
  },
  maxHeight: {
    condition: ({maxHeightValue}, value) => maxHeightValue < value,
    value: 'height',
    reason: ({maxHeightValue}) => `peste ${maxHeightValue}cm`,
  },
  maxWeight: {
    condition: ({maxWeightValue}, value) => maxWeightValue < value,
    value: 'weight',
    reason: ({maxWeightValue}) => `peste ${maxWeightValue}kg`,
  },
  onlyTrips: {
    condition: (_, value) => value,
    value: 'onlyTrips',
    reason: () => `numai deplasări`,
  },
  showWeb: {
    condition: (_, value) => value,
    value: 'showWeb',
    reason: () => `oferă show web`,
  },
  botox: {
    condition: (_, value) => value,
    value: 'botox',
    reason: () => `siliconată`,
  },
  party: {
    condition: (_, value) => value,
    value: 'party',
    reason: () => `face party`,
  },
  total: {
    condition: (_, value) => value,
    value: 'total',
    reason: () => `servicii totale`,
  },
  trans: {
    condition: (_, value) => value,
    value: 'trans',
    reason: () => `transsexual`,
  },
  mature: {
    condition: (_, value) => value,
    value: 'mature',
    reason: () => `matură`,
  },
};

Handlebars.registerHelper('isUndefined', function(value) {
  return value === undefined;
});
Handlebars.registerHelper('isEmpty', function(value) {
  return value.length === 0;
});
Handlebars.registerHelper('inc', function(value) {
  return ++value;
});
Handlebars.registerHelper("len", function (array) {
  return array.length;
});

const filterLinks = (links, itemUrl) => {
  return links.filter(l => !BLACKLISTED_LINKS.some(b => l.indexOf(b) === 0) && itemUrl !== l)
}

const sortLinks = (links) => {
  return links.sort((l1, l2) => {
    const d1 = PRIO_DOMAINS.findIndex(d => l1.indexOf('//'+d) !== -1);
    const d2 = PRIO_DOMAINS.findIndex(d => l2.indexOf('//'+d) !== -1)
    if (d1 !== -1 && d2 !== -1) {
      return d1 - d2;
    }
    if (d2 !== -1) {
      return 1;
    }
    if (d1 !== -1) {
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

function processImageLinks(id, links, itemUrl) {
  const domainMap = {};
  const duplicatesInOtherLoc = WWStorage.getAdDuplicatesInOtherLocation(id);
  const duplicatesNotOldInOtherLoc = WWStorage.getAdNotOldDuplicatesInOtherLocation(id);
  const deadLinks = WWStorage.getAdDeadLinks(id);


  links
    .filter(link => {
      return !(link.indexOf("https://www.publi24.ro/") === 0 && link.indexOf("/anunt/") === -1) &&
        link !== itemUrl;
    })
    .forEach((link) => {
      try {
        const domain = new URL(link).hostname.replace('www.', '');
        const isDomainSafe = SAFE_LAST_DOMAIN_PARTS.some((part) => domain.includes(part) );
        const linkObj = {
          link,
          isDead: deadLinks.includes(link),
          isSafe:  isDomainSafe && !duplicatesInOtherLoc.includes(link),
          isSuspicious: duplicatesNotOldInOtherLoc.includes(link),
        };

        if (!domainMap[domain]) {
          domainMap[domain] = {links: [linkObj], isSafe: isDomainSafe };
        } else {
          domainMap[domain].links.push(linkObj);
        }
      } catch (error) {
        console.error(error);
      }
    });

  return Object.entries(domainMap)
    .map(([domain, { links, isSafe }]) => ({ domain, links, isSafe }))
    .sort(({isSafe: isSafeA, domain}, {isSafe: isSafeB}) => PRIO_DOMAINS.includes(domain) || isSafeA && !isSafeB ? -1 : 0);
}

function renderModal(html, renderOptions) {
  let itemRenderCleaners;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  modalsOpen.push(container);

  container.removeAd = (adElement) => {
    adElement.remove();
    adElement.stopRender();
  };

  document.body.style.overflow = 'hidden';

  const close = (event) => {
    if (event) {
      event.stopPropagation();
    }

    itemRenderCleaners.forEach(c => c());
    modalsOpen.pop();
    container.remove();
    window.removeEventListener('keydown',  closeOnKey);

    if (!modalsOpen.length) {
      document.body.style.overflow = "initial";
    }
  };
  const closeOnKey = (e) => {
    if (e.key === 'Escape' && modalsOpen[modalsOpen.length-1] === container) close();
  };

  window.addEventListener('keydown',  closeOnKey);

  const closeButton = container.querySelector('[data-wwid="close"]');
  closeButton.onclick = close;
  container.onclick = close;

  itemRenderCleaners = registerAdsInContext(container, {renderOptions});

  const registerAds = () => {
    itemRenderCleaners.forEach(c => c());
    itemRenderCleaners = registerAdsInContext(container, {renderOptions});
  }

  return {container, registerAds, close};
}

function renderGlobalLoader(longLoadingMessage) {
  const container = document.createElement('div');
  container.innerHTML = FULL_SCREEN_LOADER_TEMPLATE({});
  document.body.appendChild(container);
  document.body.style.overflow = 'hidden';

  const timeout = setTimeout(() => {
    container.querySelector('[data-wwid="ww-loader-message"]').innerHTML = longLoadingMessage;
  }, 5000);

  const close = () => {
    clearTimeout(timeout);
    document.body.removeChild(container);
    window.removeEventListener('keydown',  closeOnKey);
    document.body.style.overflow = "initial";
  };
  const closeOnKey = (e) => {
    if (e.key === 'Escape') close();
  };

  window.addEventListener('keydown',  closeOnKey);

  return {close};
}

function renderPhoneAndTags(phone, noPadding = false) {
  const age = WWStorage.getPhoneAge(phone);
  const height = WWStorage.getPhoneHeight(phone);
  const weight = WWStorage.getPhoneWeight(phone);
  const bmi = height && weight
    ? Math.round(weight / Math.pow(height / 100, 2) * 10) / 10
    : null;

  return PHONE_AND_TAGS_TEMPLATE({
    IS_MOBILE_VIEW,
    noPadding,
    phone,
    age,
    ageWarn: age ? age > 35 : false,
    height,
    weight,
    bmi,
    bmiWarn: bmi ? bmi <= 17 || bmi >= 23 : false,
  });
}

function renderAdElement(item, id, storage, renderOptions) {
  const itemUrl = getItemUrl(item);
  const phone = WWStorage.getAdPhone(id);

  // @TODO: Artifact from storage migration. To be removed in a following version.
  WWStorage.addPhoneAd(phone, id, itemUrl);

  const searchLinks = storage[`ww:search_results:${id}`];
  const filteredSearchLinks = sortLinks(filterLinks(searchLinks || [], itemUrl));
  const nimfomaneLink = filteredSearchLinks.find(l => l.indexOf('https://nimfomane.com/forum/topic/') === 0);
  const imageSearchLinks = storage[`ww:image_results:${id}`];
  const imageSearchDomains = imageSearchLinks ? processImageLinks(id, imageSearchLinks, itemUrl) : undefined;

  const now = Date.now();
  const phoneTime = WWStorage.getInvestigatedTime(id);
  const imageTime = WWStorage.getAdImagesInvestigatedTime(id);
  let phoneInvestigatedSinceDays, imageInvestigatedSinceDays;
  let phoneInvestigateStale, imageInvestigateStale;

  if (phoneTime) {
    const days = Math.floor((now - phoneTime) / 8.64e+7);
    phoneInvestigatedSinceDays = days === 0 ? 'recent' : days === 1 ? `de o zi` : `de ${days} zile`;
    phoneInvestigateStale = days > 15;
  }
  if (imageTime) {
    const days = Math.floor((now - imageTime) / 8.64e+7);
    imageInvestigatedSinceDays = days === 0 ? 'recent' : days === 1 ? `de o zi` : `de ${days} zile`;
    imageInvestigateStale = days > 15;
  }

  let hideReason = WWStorage.getPhoneHiddenReason(phone);
  let automaticHideReason = !!(hideReason && hideReason.match(/^automat:/));
  if (automaticHideReason) {
    hideReason = hideReason.replace('automat:', '');
  }

  const panelElement = document.createElement('div');
  panelElement.className = 'ww-container';
  panelElement.setAttribute('data-wwid', 'control-panel');
  panelElement.onclick = (e) => e.stopPropagation();
  panelElement.innerHTML = AD_TEMPLATE({
    IS_MOBILE_VIEW,
    IS_AD_PAGE,
    hasDuplicateAdsWithSamePhone: WWStorage.getPhoneAds(phone).length > 1,
    showDuplicates: renderOptions?.showDuplicates ?? true,
    numberOfAdsWithSamePhone: WWStorage.getPhoneAds(phone).length,
    isFav: WWStorage.isFavorite(phone),
    visible: getItemVisibility(id),
    hideReason,
    automaticHideReason,
    dueToPhoneHidden: isDueToPhoneHidden(id),
    hasNoPhone: WWStorage.hasAdNoPhone(id),
    phone,
    searchLinks,
    filteredSearchLinks,
    imageSearchDomains,
    nimfomaneLink,
    hasImagesInOtherLocation: WWStorage.hasAdDuplicatesInOtherLocation(id),
    phoneInvestigatedSinceDays,
    imageInvestigatedSinceDays,
    phoneInvestigateStale,
    imageInvestigateStale,
    phoneAndTags: renderPhoneAndTags(phone),
  });

  const container = (item.querySelector('.article-txt, .ww-inset') || item);
  container.appendChild(panelElement);

  container.setAttribute('data-wwphone', phone);

  if (!IS_AD_PAGE && item.hasAttribute('onclick')) {
    item.querySelector('.article-txt-wrap').onclick = (event) => event.stopPropagation();
    item.querySelector('.article-content-wrap').setAttribute('onclick', item.getAttribute('onclick'));
    item.removeAttribute('onclick');
  }
}

function setItemVisible(item, v) {
  const target = item.querySelector('.article-txt-wrap, .ww-inset');

  target.style.opacity = v ? '1' : '0.5';
  target.style.mixBlendMode = v ? 'initial' : 'luminosity';
}

function getScrollParent(node) {
  if (node == null || node === document.body) {
    return window;
  }

  if (node.scrollHeight > node.clientHeight) {
    return node;
  } else {
    return getScrollParent(node.parentNode);
  }
}

function renderHideReasonSelection(container, id, phoneNumber, preSelect, onReason, onRevert) {
  const reasonContainer = document.createElement('div');
  reasonContainer.innerHTML = HIDE_REASON_TEMPLATE({ showRevert: !!onRevert });
  reasonContainer.onclick = (e) => e.stopPropagation();

  container.appendChild(reasonContainer);
  const close = () => container.removeChild(reasonContainer);

  if (IS_MOBILE_VIEW || IS_AD_PAGE) {
    const bounding = container.getBoundingClientRect();
    if (bounding.top < 120) {
      getScrollParent(container).scrollBy({top: - (120 - bounding.top), behavior: "instant"});
    }
  }

  if (preSelect) {
    const selection = reasonContainer.querySelector(`[ww-reason="${preSelect}"]`);
    if (selection) {
      selection.classList.add('ww-reason-selected');
      WWStorage.setPhoneHiddenReason(phoneNumber, preSelect);
    }
  }

  reasonContainer.querySelectorAll('[ww-reason]').forEach((reasonButton) => {
    reasonButton.onclick = () => {
      const current = reasonContainer.querySelector('.ww-reason-selected');

      if (current) {
        current.classList.remove('ww-reason-selected');
      }

      reasonButton.classList.add('ww-reason-selected');
      WWStorage.setPhoneHiddenReason(phoneNumber, reasonButton.innerText);
      onReason(close, reasonButton.innerText);
    };
  });

  if (onRevert) {
    reasonContainer.querySelector('[ww-show]').onclick = () => {
      onRevert(close)
    };
  }
}

function renderHideReasonSelectionInItem(item, id, phoneNumber) {
  WWBrowserStorage.get([`ww:image_results:${id}`]).then(results => {
    const imageLinks = results[`ww:image_results:${id}`] || [];
    const processedLinks = processImageLinks(id, imageLinks, getItemUrl(item));
    const preSelect = processedLinks.some(({links}) => links.some(({isSafe}) => !isSafe))
      ? 'poze false' : null;

    renderHideReasonSelection(item, id, phoneNumber, preSelect, () => {
      renderAdItem(item, id);
    }, (close) => {
      setItemVisible(item, true);
      WWStorage.setPhoneHidden(phoneNumber, false);
      WWStorage.setAdVisibility(id, true);
      close();
    })
  })
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

    if (!visible && phoneNumber) {
      renderHideReasonSelectionInItem(item, id, phoneNumber);
    }
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
    const adPage = await loadInAdPage(item);
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

function removeDiacritics(text) {
  const diacriticMap = {
    'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ţ': 'T',
    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ţ': 't',
  };
  return text.replace(/[ĂÂÎȘȘŢȚăâîșșţț]/g, match => diacriticMap[match] || match)
}

async function investigateAdContent(item) {
  const page = await loadInAdPage(item);
  const content = removeDiacritics(getAdPageTitle(page) + ' ' + getAdPageDescription(page));

  const data = [];
  let match;

  const attemptApplyHeight = (height) => {
    if (height >= 135 && height <= 200) {
      data.push(['height', height]);
    }
  }
  const attemptApplyWeight = (weight) => {
    if (weight >= 35 && weight <= 145) {
      data.push(['weight', weight]);
    }
  }

  if ((match = content.match(/(1[.,'" ] ?[3-9]\d)/))) {
    const str = match[1].replace(/[,'" ]/, '.').replace(' ', '');
    attemptApplyHeight(Number.parseFloat(str) * 100)
  }
  if (!data.find(d => d[0] === 'height') && (match = content.match(/[^\d%](1[3-9]\d) ?[^\d%]/))) {
    attemptApplyHeight(Number.parseInt(match[1]));
  }
  if (!data.find(d => d[0] === 'height') && (match = content.match(/inaltimea? (1[3-9]\d)/i))) {
    attemptApplyHeight(Number.parseInt(match[1]));
  }

  if ((match = content.match(/(\d+) ?(de )?(kg|kilo)/i))) {
    attemptApplyWeight(Number.parseInt(match[1]));
  }
  if ((match = content.match(/kg ?(\d+)/i))) {
    attemptApplyWeight(Number.parseInt(match[1]));
  }

  if ((match = content.match(/(\d+) ?(de )?ani(?! de)/i))
    || (match = content.match(/anca (\d+)/i))
    || (match = content.match(/matura (\d+)/i))
    || (match = content.match(/(\d+) ?(yrs|years)/i))) {
    const age = Number.parseInt(match[1]);
    if (age >= 17 && age <= 70) {
      data.push(['age', age]);
    }
  }

  if (content.match(/(\W|^)(show web|web show|show la web|show erotic web|si webb?)(\W|$)/i)) {
    data.push(['showWeb', true]);
  }
  if (content.match(/(\W|^)(botox|siliconata|silicoane)(\W|$)/i)) {
    data.push(['botox', true]);
  }
  if (content.match(/(\W|^)(party)(\W|$)/i)) {
    data.push(['party', true]);
  }
  if (content.match(/(\W|^)(servtotale|servicii totale|tottal|(?<!(devii |fii ))total)(\W|$)|(\W|^)full (?!\s*(detail|of))/i)
    && !content.match(/(\W|^)(nu fac total|nu ofer total)(\W|$)/i)) {
    data.push(['total', true]);
  }
  if (content.match(/(\W|^)((doar|numai) (deplasar|depalsar|deplsar)(i{1,3}|e)|nu am locatie)(\W|$)/i)
    && !content.match(/(\W|^)(la mine|locatie proprie|si deplasar[ie]|si locatie|locatia mea|in locatie|nu fac deplasari)(\W|$)/i)) {
    data.push(['onlyTrips', true]);
  }
  if (content.match(/(\W|^)(trans|transsexuala?)(\W|$)/i)) {
    data.push(['trans', true]);
  }
  if (content.match(/(\W|^)(matura)(\W|$)/i)) {
    data.push(['mature', true]);
  }

  return data;
}

function applyAutoHiding(phoneNumber, id, contentData) {
  const criterias = WWStorage.getAutoHideCriterias();
  const matched = [];

  for (let [criteria, props] of Object.entries(AUTO_HIDE_CRITERIA)){
    if (!WWStorage.isAutoHideCriteriaEnabled(criteria)) {
      continue;
    }

    const data = contentData.find(([key]) => key === props.value);

    if (data && props.condition(criterias, data[1])) {
      matched.push(props.reason(criterias));
    }
  }

  if (matched.length) {
    WWStorage.setAdVisibility(id, false);
    WWStorage.setPhoneHidden(phoneNumber, true);
    WWStorage.setPhoneHiddenReason(phoneNumber, 'automat: ' + matched.join(' / '));
  }
}

async function investigateNumberAndSearch(item, id, search = true) {
  let windowRef;
  if (search) {
    // This is also opened here due to safari issues with window.open.
    windowRef = window.open();
  }

  const [phoneNumber, contentData] = await Promise.all([
    acquirePhoneNumber(item, id),
    investigateAdContent(item)
  ]);

  if (!phoneNumber) {
    return false;
  }

  contentData.forEach(([key, value]) =>
    WWStorage.setPhoneProp(phoneNumber, key, value));

  if (WWStorage.isPhoneHidden(phoneNumber)) {
    setItemVisible(item, false);
  } else if (WWStorage.isAutoHideEnabled()) {
    applyAutoHiding(phoneNumber, id, contentData);
  }

  if (search) {
    browser.storage.local.set({ [`ww:search_results:${id}`]: []}).then(() => {
      const encodedId = encodeURIComponent(id);
      const addUrlId = getItemUrl(item).match(/\/([^./]+)\.html/, "")[1];
      const encodedSearch = encodeURIComponent(`"${phoneNumber}" OR "${addUrlId}"`);
      windowRef.location = `https://www.google.com/search?wwsid=${encodedId}&q=${encodedSearch}`;
      WWStorage.setInvestigatedTime(id, Date.now());
    });

    if (IS_SAFARI_IOS) {
      setInterval(() => {
        if (windowRef.closed) {
          // On safari the browser storage api breaks after returning from another tab. Reload to reset.
          window.location.reload();
        }
      }, 300);
    }
  }

  return true;
}

function registerInvestigateHandler(item, id) {
  const investigateBtn = item.querySelector('[data-wwid="investigate"]');

  investigateBtn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    investigateBtn.disabled = true;
    await investigateNumberAndSearch(item, id);
    investigateBtn.disabled = false;
  }
}

function getItemUrl(itemOrUrl) {
  if (typeof itemOrUrl === 'string') {
    return itemOrUrl;
  }
  if (itemOrUrl.className.indexOf('article-item') === -1) {
    return location.toString();
  }
  return itemOrUrl.querySelector('.article-title a').href;
}

let pageLoadPromises = {};
let allPageLoadPromises = [];
let pageLoadRequests = 0;

async function loadInAdPage(itemOrId, _url) {
  const url = _url || getItemUrl(itemOrId);

  const returnFromCache = (url) => {
    if (AD_LOAD_CACHE[url] instanceof Error) {
      throw AD_LOAD_CACHE[url];
    } else {
      return AD_LOAD_CACHE[url];
    }
  }

  if (AD_LOAD_CACHE[url]) {
    return returnFromCache(url);
  }
  if (pageLoadPromises[url]) {
    await pageLoadPromises[url];
    await new Promise((r) => setTimeout(r,  200));
    return returnFromCache(url);
  }

  ++pageLoadRequests;

  if (pageLoadRequests > 20) {
    allPageLoadPromises = allPageLoadPromises.filter(promise => !promise.is_resolved);
    await Promise.all(allPageLoadPromises).then(() => {
      return new Promise((r) => setTimeout(r,  11000));
    })
  }

  const promise = fetch(url);
  pageLoadPromises[url] = promise;
  allPageLoadPromises.push(promise.then(() => {
    promise.is_resolved = true;
  }));
  const pageResponse = await promise;
  setTimeout(() => --pageLoadRequests, 10000);

  if (!pageResponse.ok) {
    const error = new Error(`Failed to load ${url}`);
    error.code = pageResponse.status;
    AD_LOAD_CACHE[url] = error;
    throw error;
  }

  const html = await pageResponse.text();
  const temp = document.createElement('div');
  temp.innerHTML = html;

  AD_LOAD_CACHE[url] = temp;

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
  const imageToLensUrl = (imgLink) => {
    const encodedLink = encodeURIComponent(imgLink);
    return `https://lens.google.com/uploadbyurl?url=${encodedLink}&hl=ro`;
  }
  const openImageInvestigation = (imgLink) => {
    window.open(imageToLensUrl(imgLink));
  }

  return async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!WWStorage.getAdPhone(id) && !(await investigateNumberAndSearch(item, id, false))) {
      return;
    }

    if (e.currentTarget) e.currentTarget.disabled = true;
    WWBrowserStorage.set(`ww:image_results:${id}`, null);

    let imgs;

    if (IS_AD_PAGE && IS_MOBILE_VIEW) {
      imgs = [...new Set(document.body.innerHTML.match(/https:\/\/s3\.publi24\.ro\/[^\/]+\/large\/[^.]+\.jpg/g))];
    }
    else if (IS_AD_PAGE) {
      imgs = [...document.body.querySelectorAll('[id="detail-gallery"] img')]
        .map(img => img.getAttribute('src'));

      // Maybe the post has only one picture. In that case gallery is not shown.
      if (imgs.length === 0) {
        imgs = [...document.body.querySelectorAll('.detailViewImg')]
          .map(img => img.getAttribute('src'));
      }
    }
    else {
      imgs = await acquireSliderImages(item);
    }

    const done = () => {
      WWStorage.setAdImagesInvestigatedTime(id, Date.now());
      analyzeFoundImages(id, item);
      if (e.currentTarget) e.currentTarget.disabled = false;
    }

    await WWBrowserStorage.set(`ww:img_search_started_for`, {
      wwid: id,
      count: imgs.length,
      imgs: imgs.map(url => imageToLensUrl(url)),
    });

    if (IS_MOBILE_VIEW) {
      openImageInvestigation(imgs[0]);
    }
    else {
      imgs.forEach(img => openImageInvestigation(img));
    }

    const interval = setInterval(async() => {
      const results = await WWBrowserStorage.get(`ww:img_search_started_for`);
      if (
        results[`ww:img_search_started_for`].count === 0
        // On safari the browser storage api breaks after returning from another tab. Reload to reset.
        || results.__from__cache
      ) {
        clearInterval(interval);
        done();
        if (IS_SAFARI_IOS) {
          window.location.reload();
        }
      }
    }, 300);
  };
}

function getItemLocation(item, itemIsOnAdPage = false) {
  let location;
  if (typeof item === "string") {
    location = item;
  } else if (IS_AD_PAGE || itemIsOnAdPage) {
    if (IS_MOBILE_VIEW) {
      location = item.querySelector('[class="location"]').textContent.trim();
    } else {
      location = item.querySelector('[itemtype="https://schema.org/Place"]').textContent.trim();
    }
  } else {
    location = item.querySelector('[class="article-location"]').textContent.trim();
  }

  return location.split(',').map(l => l.replace(/[ \n]+/g, '')).sort().join(', ');
}

async function analyzeFoundImages(id, item) {
  const results = await WWBrowserStorage.get(`ww:image_results:${id}`)
  const publi24AdLinks = results[`ww:image_results:${id}`]
    .filter(link => link.match(/^https:\/\/(www\.)?publi24\.ro\/.+\/anunt\/.+$/));

  WWStorage.clearAdDeadLinks(id);
  WWStorage.clearAdDuplicatesInOtherLocation(id);
  const currentAdLocation = getItemLocation(item);
  const currentAdDate = getAdPageDate(await loadInAdPage(item));

  await Promise.all(publi24AdLinks.map((l =>
    loadInAdPage(null, l).catch((e) => {
      console.error(e);
      return e.code;
    }))))
    .then((pages) => {
      pages
        .forEach((page, index) => {
          if (typeof page === 'number') {
            if (page === 410) {
              WWStorage.addAdDeadLink(id, publi24AdLinks[index]);
            }
            return;
          }

          const location = getItemLocation(page, true);

          if (location !== currentAdLocation) {
            const dateDiff = dayDiff(getAdPageDate(page), currentAdDate);
            WWStorage.addAdDuplicateInOtherLocation(id, publi24AdLinks[index], dateDiff < 2);
          }
        });
    })
}

function registerInvestigateImgHandler(item, id) {
  const investigateImgBtn = item.querySelector('[data-wwid="investigate_img"]');

  investigateImgBtn.onclick = createInvestigateImgClickHandler(id, item);
}

function adUuidParts(id) {
  return id.split('|');
}

function registerFavoriteHandler(item, id) {
  const tempSaveBtn = item.querySelector('[data-wwid="temp-save"]');

  tempSaveBtn.onclick = () => {
    WWStorage.toggleFavorite(WWStorage.getAdPhone(id));
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
    const {close: closeLoader} = renderGlobalLoader('La 20+ de anunțuri durează mai mult sa încarce, din cauză la limitari de Publi24.');

    const phone = WWStorage.getAdPhone(id);
    const duplicateUuids = WWStorage.getPhoneAds(phone);
    const itemData = await loadInAdsData(
      duplicateUuids,
      (uuid) => WWStorage.removePhoneAd(phone, uuid)
    );

    closeLoader();

    const html = DUPLICATES_MODAL_TEMPLATE({
      IS_MOBILE_VIEW,
      content: ADS_TEMPLATE({
        IS_MOBILE_VIEW,
        itemData,
      }),
      count: itemData.length,
      removed: duplicateUuids.length - itemData.length,
      phone,
    });
    const {container, close} = renderModal(html, {showDuplicates: false});

    const hideAllBtn = container.querySelector('[data-wwid="hide-all"]');
    hideAllBtn.onclick = (event) => {
      event.stopPropagation();

      duplicateUuids.forEach((adUuid) => WWStorage.setAdVisibility(adUuidParts(adUuid)[0], false));
      WWStorage.setPhoneHidden(phone);

      hideAllBtn.parentNode.removeChild(hideAllBtn);

      renderHideReasonSelection(
        container.querySelector('[data-wwid="container"]'),
        id, phone, null, close
      );
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

    document.body.style.overflow = 'hidden';

    const close = () => {
      document.body.removeChild(sliderContainer);
      modalsOpen.pop();
      window.removeEventListener('keydown',  closeOnKey);
      document.body.style.overflow = 'initial';
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
  }
}

function registerHandlers(item, id) {
  registerVisibilityHandler(item, id);

  if (WWStorage.getAdPhone(id)) {
    registerInvestigateHandler(item, id);
    registerInvestigateImgHandler(item, id);
    registerFavoriteHandler(item, id);
    registerDuplicatesModalHandler(item, id);
  }

  if (item.className.indexOf('article-item') !== -1) {
    registerOpenImagesSliderHandler(item, id);
  }
}

async function getStorageItems(browserKeys, localKeys) {
  const browserValues = await WWBrowserStorage.get(browserKeys);
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

function getAdPageDate(itemPage) {
  return new Date(itemPage.querySelector('[itemprop="validFrom"]')?.textContent.trim()
    .replace(/.*(\d+\.)(\d+\.)(\d+ \d+:\d+:\d+)/, "$1$2$3"))
}

function dayDiff(date, compareDate) {
  return Math.floor(((compareDate || new Date()).getTime() - date.getTime()) / 8.64e+7);
}

function diffDaysToDisplay(diffDays, date) {
  if (diffDays >= 2) {
    return `de ${diffDays} zile`;
  }

  let prefix = 'alaltăieri';
  if (date.getDate() === new Date().getDate()) {
    prefix = 'azi';
  } else if (date.getDate() === new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getDate()) {
    prefix = 'ieri';
  }

  return `${prefix} la ${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
}

function getAdPageDescription(itemPage) {
  return itemPage.querySelector('[itemscope] [itemprop="description"]').innerHTML
    .replace(/<[^>]*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/Publi24_\d+/, '')
    .trim();
}

function getAdPageTitle(itemPage) {
  return itemPage.querySelector('[itemscope] h1[itemprop="name"]').innerHTML;
}

async function loadInAdsData(adUuids, clean) {
  let locationParts = [];
  if (!IS_AD_PAGE) {
    const countyInput = document.querySelector('[data-faceted="county_name"]');
    const locationInput = document.querySelector('[data-faceted="city_name"]');

    if (countyInput?.value) {
      locationParts.push(countyInput.value.toLocaleLowerCase())
    }
    if (locationInput?.value) {
      locationParts.push(locationInput.value.toLocaleLowerCase());
    }
  }

  let itemData = await Promise.all(
    adUuids.map((adUuid) => {
      const [id, url] = adUuidParts(adUuid);

      return loadInAdPage(url)
        .catch((e) => {
          if (e.code !== 429 && clean) {
            clean(id + '|' + url);
          }
          throw e;
        })
        .then(async (itemPage) => {
          const date = getAdPageDate(itemPage);
          const dateDiffDays = dayDiff(date);
          const location = IS_MOBILE_VIEW
            ? itemPage.querySelector('[class="location"]')?.textContent.trim()
            : itemPage.querySelector('[itemtype="https://schema.org/Place"]')?.textContent.trim();

          return ({
            IS_MOBILE_VIEW,
            id,
            url,
            phone: WWStorage.getAdPhone(id),
            qrCode: WWStorage.getAdPhone(id) && await getPhoneQrCode(WWStorage.getAdPhone(id)),
            title: getAdPageTitle(itemPage),
            description: getAdPageDescription(itemPage).substring(0, 290),
            image: IS_MOBILE_VIEW
              ? itemPage.querySelector('[itemprop="associatedMedia"] li')?.style.background.match(/url\(['"]([^'"]+)['"]\)/)[1]
              : itemPage.querySelector('[itemprop="image"]')?.src,
            location,
            date: diffDaysToDisplay(dateDiffDays, date),
            timestamp: date.getTime(),
            isDateOld: dateDiffDays >= 2,
            isLocationDifferent: locationParts.some(l => !location.toLocaleLowerCase().includes(l))
          })
        })
        .catch(async (e) => {
          console.error(e);
          return null;
        })
    }));

  return itemData
    .filter((f) => !!f)
    .sort((a, b) => b.timestamp - a.timestamp);
}

async function loadInFirstAvailableAd(uuids, phone) {
  if (!uuids.length) {
    return null;
  }

  let itemData = await loadInAdsData(
    [uuids.shift()],
    (uuid) => WWStorage.removePhoneAd(phone, uuid),
  );

  if (!itemData.length) {
    return loadInFirstAvailableAd(uuids);
  }
  return itemData[0];
}

async function loadFavoritesData() {
  const phones = WWStorage.getFavorites();
  const data = {
    inLocation: [],
    notInLocation: [],
    noAds: [],
  };

  let promises = [];

  for (let phone of phones) {
    promises.push(loadInFirstAvailableAd(WWStorage.getPhoneAds(phone), phone).then((item) => {
      if (item) {
        if (item.isLocationDifferent) {
          data.notInLocation.push(item);
        } else {
          data.inLocation.push(item);
        }
      } else {
        data.noAds.push(phone);
      }
    }));
  }

  await Promise.all(promises);

  const sorter = (a, b) => b.timestamp - a.timestamp;
  data.inLocation = data.inLocation.sort(sorter);
  data.notInLocation = data.notInLocation.sort(sorter);

  return data;
}

function registerFavoritesButton(element) {
  element.querySelector('[data-ww="temp-save"]').onclick = async () => {
    const {close: closeLoader} = renderGlobalLoader('La 20+ de favorite durează mai mult să încarce favoritele, din cauza limitarilor de la Publi24.');
    const data = await loadFavoritesData();
    closeLoader();

    let html = FAVORITES_MODAL_TEMPLATE({
      isEmpty: !data.notInLocation.length && !data.inLocation.length && !data.noAds.length,
      inLocationCount: data.inLocation.length,
      inLocation: data.inLocation.length && ADS_TEMPLATE({
        itemData: data.inLocation,
        IS_MOBILE_VIEW,
      }),
      notInLocationCount: data.notInLocation.length,
      notInLocation: data.notInLocation.length && ADS_TEMPLATE({
        itemData: data.notInLocation,
        IS_MOBILE_VIEW,
      }),
      noAds: data.noAds.length && data.noAds.map(phone => ({
        phone,
        content: renderPhoneAndTags(phone, true),
      })),
      IS_MOBILE_VIEW
    });
    let {container, close} = renderModal(html);

    container.setAttribute('data-ww', 'favorites-modal');

    const clearFavoritesButton = container.querySelector('[data-wwid="clear-favorites"]');
    clearFavoritesButton.onclick = () => {
      WWStorage.clearFavorites();
      close();
    };

    [...container.querySelectorAll('[data-wwrmfav]')].forEach(button => {
      button.onclick = () => {
        const phone = button.getAttribute('data-wwrmfav');
        WWStorage.toggleFavorite(phone);
        button.closest('.article-item').remove();
      };
    });
  }
}

function registerSettingsButton(element) {
  element.querySelector('[data-ww="settings-button"]').onclick = () => {
    const {container} = renderModal(SETTINGS_MODAL_TEMPLATE({
      IS_MOBILE_VIEW,
    }));

    const render = () => {
      container.querySelector('[data-wwid="content"]').innerHTML = SETTINGS_TEMPLATE({
        focusMode: WWStorage.isFocusMode(),
        autoHide: WWStorage.isAutoHideEnabled(),
        ...WWStorage.getAutoHideCriterias(),
      });

      const toggleSwitch = (event) => event.currentTarget.querySelector('.ww-switch-container').classList.toggle('ww-switch-on');

      container.querySelector('[data-wwid="focus-mode-switch"]').onclick = (event) => {
        toggleSwitch(event);
        setTimeout(() => {
          WWStorage.setFocusMode(!WWStorage.isFocusMode());
          window.scrollTo({left: 0, top: 0});
          window.location.reload();
        }, 400);
      };

      container.querySelector('[data-wwid="auto-hiding"]').onclick = () => {
        WWStorage.setAutoHideEnabled(!WWStorage.isAutoHideEnabled());
        render();
      };

      container.querySelectorAll('[data-wwid="auto-hide-criteria"]').forEach(switcher => {
        const criteria = switcher.getAttribute('data-wwcriteria');
        const input = switcher.querySelector('input');

        switcher.onclick = () => {
          WWStorage.setAutoHideCriteria(criteria, !WWStorage.isAutoHideCriteriaEnabled(criteria));
          render();
        }

        if (input) {
          const onChange = () => {
            WWStorage.setAutoHideCriteria(criteria, undefined, input.type === 'number' ? Number.parseFloat(input.value) : input.value);
          };
          input.onkeydown = function (event) {
            if (event.key === "Enter") {
              this.blur();
            }
          };
          input.onclick = (e) => e.stopPropagation();
          input.oninput = onChange;

          if (!input.value) {
            input.value = input.getAttribute('data-wwdefault');
            onChange();
          }
        }
      })
    };

    render();
  };
}

function registerPhoneSearchButton(element) {
  element.querySelector('[data-ww="phone-search"]').onclick = () => {
    let duplicateUuids, phone, timeout;

    const html = DUPLICATES_MODAL_TEMPLATE({IS_MOBILE_VIEW, count: '~'});
    const {container, close, registerAds} = renderModal(html);

    const input = container.querySelector("input");
    input.oninput = () => {
      container.querySelector("[data-wwid='count']").innerHTML = "...";

      if (timeout) {clearTimeout(timeout)}
      timeout = setTimeout(async () => {
        phone = input.value.replace(/^\+?40/, '0').replace(/ +/g, '');

        duplicateUuids = WWStorage.getPhoneAds(phone) || [];
        const itemData = await loadInAdsData(
          duplicateUuids,
          (uuid) => WWStorage.removePhoneAd(phone, uuid)
        );

        container.querySelector("[data-wwid='content']").innerHTML = ADS_TEMPLATE({
          IS_MOBILE_VIEW,
          itemData,
        });
        container.querySelector("[data-wwid='count']").innerHTML = itemData.length;
        registerAds();
      }, 1500);
    };

    const hideAllBtn = container.querySelector('[data-wwid="hide-all"]');
    hideAllBtn.onclick = () => {
      if (duplicateUuids.length) {
        duplicateUuids.forEach((adUuid) => {
          WWStorage.setAdVisibility(adUuidParts(adUuid)[0], false);
        });
        WWStorage.setPhoneHidden(phone);
        close();
      }
    }
  };
}

function renderGlobalButtons() {
  const existing = document.body.querySelector('[data-ww="global-buttons"]');
  existing && existing.parentNode.removeChild(existing);

  const element = document.createElement('div');
  element.innerHTML = GLOBAL_BUTTONS_TEMPLATE({
    savesCount: WWStorage.getFavorites().length,
    IS_MOBILE_VIEW
  });
  element.setAttribute('data-ww', 'global-buttons');

  if (IS_MOBILE_VIEW) {
    document.querySelector('.section-bottom-nav').appendChild(element);
  } else {
    document.body.appendChild(element);
  }

  registerFavoritesButton(element);
  registerSettingsButton(element);
  registerPhoneSearchButton(element);
}

function registerGlobalButtons() {
  renderGlobalButtons();

  const siteGlobalButtons = document.querySelector('.page-actions-bottom');
  if (siteGlobalButtons) {
    siteGlobalButtons.parentNode.removeChild(siteGlobalButtons);
  }

  let lastCount = WWStorage.getFavorites().length;
  setInterval(() => {
    if (lastCount !== WWStorage.getFavorites().length) {
      lastCount = WWStorage.getFavorites().length;
      renderGlobalButtons()
    }
  }, 500);
}

function renderAdWithCleanupAndCache(item, id, searchResults, renderOptions) {
  cleanupAdRender(item);
  renderAdElement(item, id, searchResults, renderOptions);
  registerHandlers(item, id);
}

function renderAdItem(item, id, renderOptions) {
  getStorageItems(...STORAGE_KEYS(id))
    .then((r) => renderAdWithCleanupAndCache(item, id, r, renderOptions));
}

function registerAdItem(item, id, renderOptions) {
  renderAdItem(item, id, renderOptions);
  const renderCache = {};

  if (!WWStorage.getAdPhone(id) || WWStorage.hasAdNoPhone(id)) {
    currentInvestigatePromise = currentInvestigatePromise
      .then(() => investigateNumberAndSearch(item, id, false))
      // Wait a bit to avoid triggering rate limits.
      .then(() => new Promise(r => setTimeout(r, Math.min(2500, investigateTimeout *= 1.3))));
  }

  const interval = setInterval(() => {
    getStorageItems(...STORAGE_KEYS(id)).then(r => {
      if (renderCache[id] !== JSON.stringify(r)) {
        renderCache[id] = JSON.stringify(r);
        renderAdWithCleanupAndCache(item, id, r, renderOptions);
      }
    });
  }, 300 + Math.round(Math.random() * 100));

  const stopRender = () => clearInterval(interval);
  item.stopRender = stopRender;

  return stopRender;
}

function registerAdsInContext(context, {applyFocusMode = false, renderOptions} = {}) {
  let items = context.querySelectorAll('[data-articleid]');

  if (applyFocusMode && WWStorage.isFocusMode()) {
    items = [...items].filter((item) => {
      if (getItemVisibility(item.getAttribute('data-articleid'))) {
        return true;
      }
      item.style.display = 'none';
      return false;
    })
  }

  return [...items].map((item) => registerAdItem(item, item.getAttribute('data-articleid'), renderOptions));
}

async function optimizeFavorites() {
  const favs = WWStorage.getFavorites();
  for (let phone of favs) {
    const phoneAds = WWStorage.getPhoneAds(phone);

    if (
      phoneAds.length < 2 ||
      Date.now() - WWStorage.getLastTimeAdsOptimized(phone) < 2.16e+7 // 6 hours
    ) {
      continue;
    }

    let newestTime = Math.max();
    let newestUuid;

    for (let uuid of phoneAds) {
      const data = await loadInAdsData([uuid]);
      await new Promise(r => setTimeout(r, 2500));

      if (data.length && data[0].timestamp > newestTime) {
        newestTime = data[0].timestamp;
        newestUuid = uuid;
      }
    }

    if (newestUuid) {
      WWStorage.setPhoneAdFirst(phone, newestUuid);
      WWStorage.setOptimizedAdsNow(phone);
      console.log(`Optimized first ad for favorite ${phone}`);
    }
  }
}

function showInfo() {
  const interval = setInterval(() => {
    const firstPhone = document.querySelector('[data-wwid="phone-number"]');

    if (!firstPhone) {
      return;
    }

    const firstAd = firstPhone.closest('[data-articleid]');
    clearInterval(interval);

    window.scrollTo({top: 0, behavior: "instant"});
    firstAd.querySelector('.ww-buttons').scrollIntoView({behavior: 'instant', block: 'start'});
    window.scrollBy({ top: IS_MOBILE_VIEW ? -280 : -350, behavior: "instant" });

    setTimeout(() => {
      let shownStep = 0;
      const infoContainer = document.createElement('div');
      document.body.appendChild(infoContainer);
      document.body.style.overflow = 'hidden';

      const errorCleanup = (error) => {
        infoContainer.parentNode.removeChild(infoContainer);
        document.body.style.overflow = 'initial';
        console.error(error);
      }

      try {
        const elToCutout = (el) => {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.x - 2,
            y: rect.y - 2,
            yy: rect.y + rect.height + 2,
            xm: rect.x + rect.width / 2,
            xrc: rect.x + rect.width - 15,
            xlc: rect.x + 15,
            width: rect.width + 4,
            height: rect.height + 4,
          }
        };

        const adButtonsCutouts = [
          firstAd.querySelector('.ww-buttons button:nth-child(1)'),
          firstAd.querySelector('.ww-buttons button:nth-child(2)'),
          firstAd.querySelector('.ww-buttons button:nth-child(3)'),
          firstAd.querySelector('.ww-buttons button:nth-child(4)'),
          firstAd.querySelector('.art-img'),
        ].map(elToCutout);
        const globalButtonsCutouts = [
          document.querySelector('.ww-phone-search-button'),
          document.querySelector('.ww-saves-button'),
          document.querySelector('.ww-settings-button'),
        ].map(elToCutout);

        infoContainer.innerHTML = INFO_TEMPLATE({
          cutouts: adButtonsCutouts,
          adButtonsInfo: true,
          IS_MOBILE_VIEW
        });

        infoContainer.addEventListener('click', () => {
          try {
            if (shownStep === 1) {
              infoContainer.parentNode.removeChild(infoContainer);
              document.body.style.overflow = 'initial';
              return;
            }

            infoContainer.innerHTML = INFO_TEMPLATE({
              cutouts: globalButtonsCutouts,
              globalButtonsInfo: true,
              IS_MOBILE_VIEW
            });

            ++shownStep;
          } catch (error) {
            errorCleanup(error);
          }
        });
      } catch (error) {
        errorCleanup(error);
      }
    }, 600);
  }, 100);
}

// @TODO: Remove in a month.
if (!WWStorage.hasShownMessage('account-delete')) {
  if (WWStorage.getVersion()) {
    renderModal(MESSAGE_MODAL_TEMPLATE({IS_MOBILE_VIEW}));
  }
  WWStorage.setShownMessage('account-delete');
}

WWStorage.upgrade()
  .then(() => {
    console.log('Booting publi24-advanced-filter');

    if (IS_AD_PAGE) {
      const id = document.body.querySelector('[data-url^="/DetailAd/IncrementViewHit"]')
        .getAttribute('data-url')
        .replace(/^.*?adid=([^&]+)&.*$/, "$1");

      const item = document.body.querySelector('[itemtype="https://schema.org/Offer"]');
      item.setAttribute('data-articleid', id.toUpperCase());

      const container = document.createElement('div');
      container.classList.add('ww-inset')
      const skipClasses = ['featuredArticles', 'detailAd-login'];
      while (item.children.length) {
        if (skipClasses.some((c) => item.children[0].classList.contains(c))) {
          item.removeChild(item.children[0]);
        } else {
          container.appendChild(item.children[0]);
        }
      }
      item.appendChild(container);
      item.style.position = 'relative';

      registerAdItem(item, id.toUpperCase());
    } else {
      registerAdsInContext(document.body, {applyFocusMode: true});
      if (location.pathname.startsWith('/anunturi/matrimoniale')) {
        registerGlobalButtons();
      }
      optimizeFavorites();
      if (!WWStorage.hasBeenShownInfo()) {
        setTimeout(showInfo, 100);
        WWStorage.setHasBeenShownInfo();
      }
    }
  })
