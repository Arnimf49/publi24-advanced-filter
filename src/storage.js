const _WW_STORE_CACHE = {item: {}, save: null, phoneAds: {}, phoneHidden: null};

const WWStorage = {
  getAdStoreKeys(id) {
    return [`ww2:${id.toUpperCase()}`, `ww2:hidden-phones`]
      .concat(WWStorage.getAdPhone(id) ? [`ww2:phone-h-reason:${WWStorage.getAdPhone(id)}`] : []);
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

  getHiddenPhones() {
    if (_WW_STORE_CACHE.phoneHidden) {
      return _WW_STORE_CACHE.phoneHidden;
    }
    const hidden = JSON.parse(localStorage.getItem(`ww2:hidden-phones`) || '[]');
    _WW_STORE_CACHE.phoneHidden = hidden;
    return hidden;
  },
  setPhoneHidden(phone, h = true) {
    let hidden = WWStorage.getHiddenPhones();
    if (!hidden.includes(phone) && h) {
      hidden.push(phone);
    } else if (hidden.includes(phone) && !h) {
      hidden = hidden.filter(p => p !== phone)
    }
    localStorage.setItem(`ww2:hidden-phones`, JSON.stringify(hidden));
    _WW_STORE_CACHE.phoneHidden = hidden;
  },
  isPhoneHidden(phone) {
    return WWStorage.getHiddenPhones().includes(phone);
  },

  getPhoneAds(phone) {
    if (_WW_STORE_CACHE.phoneAds[phone]) {
      return _WW_STORE_CACHE.phoneAds[phone];
    }
    const phoneAds = JSON.parse(localStorage.getItem(`ww2:phone-ads:${phone}`) || '[]');
    _WW_STORE_CACHE.phoneAds[phone] = phoneAds;
    return phoneAds;
  },
  addPhoneAd(phone, id, url) {
    if (!phone || !id || !url) {
      return;
    }

    const ads = WWStorage.getPhoneAds(phone);
    if (!ads.find(v => v.split('|')[0] === id)) { // url can be different due to seo
      ads.push(id + '|' + url);
      localStorage.setItem(`ww2:phone-ads:${phone}`, JSON.stringify(ads));
      _WW_STORE_CACHE.phoneAds[phone] = ads;
    }
  },
  removePhoneAd(phone, uuid) {
    if (!phone || !uuid) {
      return;
    }

    let ads = WWStorage.getPhoneAds(phone);
    if (ads.includes(uuid)) {
      ads = ads.filter(id => id !== uuid);
      localStorage.setItem(`ww2:phone-ads:${phone}`, JSON.stringify(ads));
      _WW_STORE_CACHE.phoneAds[phone] = ads;
    }
  },

  setPhoneHiddenReason(phone, reason) {
    localStorage.setItem(`ww2:phone-h-reason:${phone}`, reason);
  },
  getPhoneHiddenReason(phone) {
    return localStorage.getItem(`ww2:phone-h-reason:${phone}`);
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
    }
  }
};
