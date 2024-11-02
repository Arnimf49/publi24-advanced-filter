const WWStorage = {
  getAdStoreKey(id) {
    return `ww2:${id}`;
  },
  setAdProp(id, prop, value) {
    const item = JSON.parse(localStorage.getItem(`ww2:${id}`) || '{}');
    item[prop] = value;
    localStorage.setItem(`ww2:${id}`, JSON.stringify(item));
  },
  getAdProp(id, prop) {
    const item = JSON.parse(localStorage.getItem(`ww2:${id}`) || '{}');
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

  setPhoneHidden(phone, h) {
    let hidden = JSON.parse(localStorage.getItem(`ww2:hidden-phones`) || '[]');
    if (!hidden.includes(phone) && h) {
      hidden.push(phone);
    } else if (hidden.includes(phone) && !h) {
      hidden = hidden.filter(p => p !== phone)
    }
    localStorage.setItem(`ww2:hidden-phones`, JSON.stringify(hidden));
  },
  isPhoneHidden(phone) {
    const hidden = JSON.parse(localStorage.getItem(`ww2:hidden-phones`) || '[]');
    return hidden.includes(phone);
  },

  getPhoneAds(phone) {
    return JSON.parse(localStorage.getItem(`ww2:phone-ads:${phone}`) || '[]')
  },
  addPhoneAd(phone, id, url) {
    if (!phone || !id || !url) {
      return;
    }

    const ads = WWStorage.getPhoneAds(phone);
    const value = id + '|' + url;
    if (!ads.includes(value)) {
      ads.push(value);
      localStorage.setItem(`ww2:phone-ads:${phone}`, JSON.stringify(ads));
    }
  },

  getTempSaved() {
    return JSON.parse(localStorage.getItem('ww:temp_save') || '[]');
  },
  clearTempSave() {
    localStorage.removeItem('ww:temp_save');
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
  },
  isTempSaved(id) {
    return WWStorage.getTempSaved().includes(id);
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
