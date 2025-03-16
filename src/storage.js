const _WW_STORE_CACHE = {
  item: {},
  phone: {},
  save: null,
  phoneAds: {},
  phoneHidden: null
};

const WWStorage = {
  getAdStoreKeys(id) {
    return [`ww2:${id.toUpperCase()}`]
      .concat(WWStorage.getAdPhone(id) ? [`ww2:phone:${WWStorage.getAdPhone(id)}`] : []);
  },
  getAdItem(id) {
    id = id.toUpperCase();
    if (_WW_STORE_CACHE.item[id]) {
      return _WW_STORE_CACHE.item[id];
    }

    const item = JSON.parse(localStorage.getItem(`ww2:${id}`) || '{}');
    _WW_STORE_CACHE.item[id] = item;
    return item;
  },
  setAdProp(id, prop, value) {
    id = id.toUpperCase();
    const item = this.getAdItem(id);
    item[prop] = value;
    localStorage.setItem(`ww2:${id}`, JSON.stringify(item));
    _WW_STORE_CACHE.item[id] = item;
  },
  getAdProp(id, prop) {
    id = id.toUpperCase();
    const item = this.getAdItem(id);
    return item[prop];
  },

  setAdVisibility(id, visible) {
    WWStorage.setAdProp(id, 'visibility', visible);
  },
  isAdVisible(id) {
    return WWStorage.getAdProp(id, 'visibility') === false;
  },

  setAdPhone(id, phone) {
    WWStorage.setAdProp(id, 'phone', phone);
  },
  getAdPhone(id) {
    return WWStorage.getAdProp(id, 'phone');
  },

  setAdNoPhone(id, value = true) {
    WWStorage.setAdProp(id, 'noPhone', value);
  },
  hasAdNoPhone(id) {
    return WWStorage.getAdProp(id, 'noPhone') === true;
  },

  addAdDuplicateInOtherLocation(id, link, old = true) {
    const list = WWStorage.getAdProp(id, 'duplicatesInOtherLoc') || [];
    list.push(link);
    WWStorage.setAdProp(id, 'duplicatesInOtherLoc', list);

    if (!old) {
      const list = WWStorage.getAdProp(id, 'duplicatesInOtherLocNotOld') || [];
      list.push(link);
      WWStorage.setAdProp(id, 'duplicatesInOtherLocNotOld', list);
    }
  },
  clearAdDuplicatesInOtherLocation(id) {
    WWStorage.setAdProp(id, 'duplicatesInOtherLoc', null);
    WWStorage.setAdProp(id, 'duplicatesInOtherLocNotOld', null);
  },
  hasAdDuplicatesInOtherLocation(id) {
    return !!WWStorage.getAdProp(id, 'duplicatesInOtherLoc');
  },
  getAdDuplicatesInOtherLocation(id) {
    return WWStorage.getAdProp(id, 'duplicatesInOtherLoc') || [];
  },
  getAdNotOldDuplicatesInOtherLocation(id) {
    return WWStorage.getAdProp(id, 'duplicatesInOtherLocNotOld') || [];
  },

  addAdDeadLink(id, link) {
    const list = WWStorage.getAdProp(id, 'deadLinks') || [];
    list.push(link);
    WWStorage.setAdProp(id, 'deadLinks', list);
  },
  clearAdDeadLinks(id) {
    WWStorage.setAdProp(id, 'deadLinks', null);
  },
  getAdDeadLinks(id) {
    return WWStorage.getAdProp(id, 'deadLinks') || [];
  },

  setInvestigatedTime(id, timestamp) {
    WWStorage.setAdProp(id, 'phoneTime', timestamp);
  },
  getInvestigatedTime(id) {
    return WWStorage.getAdProp(id, 'phoneTime');
  },

  setAdImagesInvestigatedTime(id, timestamp) {
    WWStorage.setAdProp(id, 'imagesTime', timestamp);
  },
  getAdImagesInvestigatedTime(id) {
    return WWStorage.getAdProp(id, 'imagesTime');
  },

  getPhoneItem(phone) {
    if (_WW_STORE_CACHE.phone[phone]) {
      return _WW_STORE_CACHE.phone[phone];
    }

    const item = JSON.parse(localStorage.getItem(`ww2:phone:${phone}`) || '{}');
    _WW_STORE_CACHE.phone[phone] = item;
    return item;
  },
  setPhoneProp(phone, prop, value) {
    const item = this.getPhoneItem(phone);
    item[prop] = value;
    localStorage.setItem(`ww2:phone:${phone}`, JSON.stringify(item));
    _WW_STORE_CACHE.phone[phone] = item;
  },
  getPhoneProp(phone, prop) {
    const item = this.getPhoneItem(phone);
    return item[prop];
  },

  setPhoneHidden(phone, h = true) {
    WWStorage.setPhoneProp(phone, 'hidden', h);
  },
  isPhoneHidden(phone) {
    return WWStorage.getPhoneProp(phone, 'hidden');
  },

  getPhoneAds(phone) {
    return WWStorage.getPhoneProp(phone, 'ads') || [];
  },
  addPhoneAd(phone, id, url) {
    if (!phone || !id || !url) {
      return;
    }

    const ads = WWStorage.getPhoneAds(phone);
    if (!ads.find(v => v.split('|')[0] === id)) { // url can be different due to seo
      ads.push(id + '|' + url);
      WWStorage.setPhoneProp(phone, 'ads', ads);
    }
  },
  removePhoneAd(phone, uuid) {
    if (!phone || !uuid) {
      return;
    }

    let ads = WWStorage.getPhoneAds(phone);
    if (ads.includes(uuid)) {
      ads = ads.filter(id => id !== uuid);
      WWStorage.setPhoneProp(phone, 'ads', ads);
    }
  },

  setPhoneHiddenReason(phone, reason) {
    WWStorage.setPhoneProp(phone, 'hideReason', reason)
  },
  getPhoneHiddenReason(phone) {
    return WWStorage.getPhoneProp(phone, 'hideReason');
  },

  getPhoneHeight(phone) {
    return WWStorage.getPhoneProp(phone, 'height');
  },
  getPhoneWeight(phone) {
    return WWStorage.getPhoneProp(phone, 'weight');
  },
  getPhoneAge(phone) {
    return WWStorage.getPhoneProp(phone, 'age');
  },

  getTempSaved() {
    if (_WW_STORE_CACHE.save) {
      return [..._WW_STORE_CACHE.save];
    }
    const save = JSON.parse(localStorage.getItem('ww:temp_save') || '[]');
    _WW_STORE_CACHE.save = save;
    return [...save];
  },
  clearTempSave() {
    localStorage.removeItem('ww:temp_save');
    _WW_STORE_CACHE.save = null;
  },
  toggleTempSave(id) {
    let items = WWStorage.getTempSaved();
    const adId = id.split('|')[0];

    if (items.includes(id)) {
      WWStorage.setAdProp(adId, 'fav', false);
      items = items.filter(it => it !== id);
    } else {
      WWStorage.setAdProp(adId, 'fav', true);
      items.push(id);
    }

    localStorage.setItem('ww:temp_save', JSON.stringify(items));
    _WW_STORE_CACHE.save = items;
  },
  isTempSaved(id) {
    return WWStorage.getTempSaved().includes(id);
  },

  setFocusMode(enabled) {
    localStorage.setItem('ww:focus_mode', enabled ? 'true' : 'false');
  },
  isFocusMode() {
    return localStorage.getItem('ww:focus_mode') === 'true';
  },

  setAutoHideEnabled(enabled) {
    localStorage.setItem('ww:auto-hide', enabled ? 'true' : 'false');
  },
  isAutoHideEnabled() {
    return localStorage.getItem('ww:auto-hide') === 'true';
  },

  setAutoHideCriteria(criteria, enabled, value) {
    const current = WWStorage.getAutoHideCriterias();
    if (enabled !== undefined) {
      current[criteria] = enabled;
    }
    if (value !== undefined) {
      current[criteria + 'Value'] = value;
    }
    localStorage.setItem('ww:auto-hide:criteria', JSON.stringify(current));
  },
  isAutoHideCriteriaEnabled(criteria) {
    return !!WWStorage.getAutoHideCriterias()[criteria];
  },
  getAutoHideCriterias() {
    return JSON.parse(localStorage.getItem('ww:auto-hide:criteria') || '{}');
  },

  hasBeenShownInfo() {
    return localStorage.getItem('ww:info-shown') === 'true';
  },
  setHasBeenShownInfo() {
    return localStorage.setItem('ww:info-shown', 'true');
  },

  async upgrade() {
    const version = localStorage.getItem('ww:storage:version');

    if (!version) {
      const allItems = {...localStorage};

      Object.entries(allItems).forEach(([key, value]) => {
        let match;
        try {
          if (match = key.match(/^ww:visibility:([^:]+)$/)) {
            WWStorage.setAdVisibility(match[1], value === 'false' ? false : true);
          }
          else if (match = key.match(/^ww:phone:([^:]+)$/)) {
            WWStorage.setAdPhone(match[1], value.trim());
          }
          else if (match = key.match(/^ww:phone:([^:]+):visible$/)) {
            WWStorage.setPhoneHidden(match[1].trim(), value === 'false');
          }
          else if (match = key.match(/^ww:no_phone:([^:]+)$/)) {
            WWStorage.setAdNoPhone(match[1].trim());
          }
          if (match) {
            localStorage.removeItem(match[0]);
          }
        } catch (e) {
          console.error(e);
        }
      });


      localStorage.setItem('ww:storage:version', '2');
    } else if (version === '2') {
      const allItems = {...localStorage};

      Object.entries(allItems).forEach(([key, value]) => {
        let match;
        try {
          if ((match = key.match(/^ww2:hidden-phones$/))) {
            JSON.parse(value).forEach((phone) => WWStorage.setPhoneHidden(phone));
          }
          else if ((match = key.match(/^ww2:phone-ads:([^:]+)$/))) {
            console.log(JSON.parse(value));
            JSON.parse(value).forEach(v => WWStorage.addPhoneAd(match[1], ...v.split('|')));
          }
          else if ((match = key.match(/^ww2:phone-h-reason:([^:]+)$/))) {
            WWStorage.setPhoneHiddenReason(match[1], value);
          }
          if (match) {
            localStorage.removeItem(match[0]);
          }
        } catch (e) {
          console.error(e);
        }
      });

      localStorage.setItem('ww:storage:version', '3');
    }
  }
};
