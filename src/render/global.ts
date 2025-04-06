import {AdData, adData} from "../core/adData";
import {adRender} from "./ad";
import {modalRender} from "./modal";
import {IS_MOBILE_VIEW} from "../core/globals";
import {WWStorage} from "../core/storage";

interface FavoritesData {
  inLocation: AdData[];
  notInLocation: AdData[];
  noAds: string[];
}

declare const Handlebars: any;
const GLOBAL_BUTTONS_TEMPLATE = Handlebars.templates.global_buttons_template;
const ADS_TEMPLATE = Handlebars.templates.ads_template;
const FAVORITES_MODAL_TEMPLATE = Handlebars.templates.favorites_modal_template;
const DUPLICATES_MODAL_TEMPLATE = Handlebars.templates.ads_modal_template;
const SETTINGS_MODAL_TEMPLATE = Handlebars.templates.settings_modal_template;
const SETTINGS_TEMPLATE = Handlebars.templates.settings_template;

async function loadFavoritesData(): Promise<FavoritesData> {
  const phones = WWStorage.getFavorites();
  const data: FavoritesData = {
    inLocation: [],
    notInLocation: [],
    noAds: [],
  };

  let promises: Promise<void>[] = [];

  for (let phone of phones) {
    promises.push(adData.loadInFirstAvailableAd(WWStorage.getPhoneAds(phone), phone).then((item) => {
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

  const sorter = (a: AdData, b: AdData): number => b.timestamp - a.timestamp;
  data.inLocation = data.inLocation.sort(sorter);
  data.notInLocation = data.notInLocation.sort(sorter);

  return data;
}

function registerFavoritesButton(element: HTMLElement): void {
  const button = element.querySelector<HTMLButtonElement>('[data-ww="temp-save"]');
  if (!button) return;

  button.onclick = async () => {
    const {close: closeLoader} = modalRender.renderGlobalLoader('La 20+ de favorite durează mai mult să încarce favoritele, din cauza limitarilor de la Publi24.');
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
        content: adRender.renderPhoneAndTags(phone, true),
      })),
      IS_MOBILE_VIEW
    });
    let {container, close} = modalRender.renderModal(html);

    container.setAttribute('data-ww', 'favorites-modal');

    const clearFavoritesButton = container.querySelector<HTMLButtonElement>('[data-wwid="clear-favorites"]');
    if (clearFavoritesButton) {
      clearFavoritesButton.onclick = () => {
        WWStorage.clearFavorites();
        close();
      };
    }

    container.querySelectorAll<HTMLButtonElement>('[data-wwrmfav]').forEach(button => {
      button.onclick = () => {
        const phone = button.getAttribute('data-wwrmfav');
        if (phone) {
          WWStorage.toggleFavorite(phone);
        }
        button.closest('.article-item')?.remove();
      };
    });
  }
}

function registerSettingsButton(element: HTMLElement): void {
  const settingsButton = element.querySelector<HTMLButtonElement>('[data-ww="settings-button"]');
  if (!settingsButton) return;

  settingsButton.onclick = () => {
    const { container } = modalRender.renderModal(SETTINGS_MODAL_TEMPLATE({
      IS_MOBILE_VIEW,
    }));

    const render = (): void => {
      const contentContainer = container.querySelector<HTMLElement>('[data-wwid="content"]');
      if (!contentContainer) return;

      contentContainer.innerHTML = SETTINGS_TEMPLATE({
        focusMode: WWStorage.isFocusMode(),
        autoHide: WWStorage.isAutoHideEnabled(),
        ...WWStorage.getAutoHideCriterias(),
      });

      const toggleSwitch = (event: Event): void => {
        const target = event.currentTarget as HTMLElement | null;
        target?.querySelector('.ww-switch-container')?.classList.toggle('ww-switch-on');
      };

      const focusModeSwitch = container.querySelector<HTMLElement>('[data-wwid="focus-mode-switch"]');
      if (focusModeSwitch) {
        focusModeSwitch.onclick = (event: MouseEvent) => {
          toggleSwitch(event);
          setTimeout(() => {
            WWStorage.setFocusMode(!WWStorage.isFocusMode());
            window.scrollTo({ left: 0, top: 0 });
            window.location.reload();
          }, 400);
        };
      }

      const autoHidingSwitch = container.querySelector<HTMLElement>('[data-wwid="auto-hiding"]');
      if (autoHidingSwitch) {
        autoHidingSwitch.onclick = () => {
          WWStorage.setAutoHideEnabled(!WWStorage.isAutoHideEnabled());
          render();
        };
      }

      container.querySelectorAll<HTMLElement>('[data-wwid="auto-hide-criteria"]').forEach((switcher: HTMLElement) => {
        const criteria = switcher.getAttribute('data-wwcriteria');
        const input = switcher.querySelector<HTMLInputElement>('input');

        if (!criteria) return;

        switcher.onclick = () => {
          WWStorage.setAutoHideCriteria(criteria, !WWStorage.isAutoHideCriteriaEnabled(criteria));
          render();
        }

        if (input) {
          const onChange = (): void => {
            WWStorage.setAutoHideCriteria(criteria, undefined, input.type === 'number' ? Number.parseFloat(input.value) : input.value);
          };
          input.onkeydown = function (event: KeyboardEvent): void {
            if (event.key === "Enter") {
              (this as HTMLElement).blur();
            }
          };
          input.onclick = (e: MouseEvent) => e.stopPropagation();
          input.oninput = onChange;

          if (!input.value) {
            const defaultValue = input.getAttribute('data-wwdefault');
            if (defaultValue !== null) {
              input.value = defaultValue;
              onChange();
            }
          }
        }
      });
    };

    render();
  };
}


function registerPhoneSearchButton(element: HTMLElement): void {
  const searchButton = element.querySelector<HTMLButtonElement>('[data-ww="phone-search"]');
  if (!searchButton) return;

  searchButton.onclick = () => {
    let duplicateUuids: string[] = [];
    let phone: string;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const html = DUPLICATES_MODAL_TEMPLATE({ IS_MOBILE_VIEW, count: '~' });
    const { container, close, registerAds } = modalRender.renderModal(html);

    const input = container.querySelector<HTMLInputElement>("input");
    const countElement = container.querySelector<HTMLElement>("[data-wwid='count']");
    const contentElement = container.querySelector<HTMLElement>("[data-wwid='content']");

    if (!input || !countElement || !contentElement) return;

    input.oninput = () => {
      countElement.innerHTML = "...";

      if (timeout) { clearTimeout(timeout) }
      timeout = setTimeout(async () => {
        phone = input.value.replace(/^\+?40/, '0').replace(/ +/g, '');

        duplicateUuids = WWStorage.getPhoneAds(phone) || [];
        const itemData = await adData.loadInAdsData(
          duplicateUuids,
          (uuid: string) => WWStorage.removePhoneAd(phone, uuid)
        );

        contentElement.innerHTML = ADS_TEMPLATE({
          IS_MOBILE_VIEW,
          itemData,
        });
        countElement.innerHTML = String(itemData.length);
        if (registerAds) {
          registerAds();
        }
      }, 1500);
    };

    const hideAllBtn = container.querySelector<HTMLButtonElement>('[data-wwid="hide-all"]');
    if (hideAllBtn) {
      hideAllBtn.onclick = () => {
        if (duplicateUuids.length && phone) {
          duplicateUuids.forEach((adUuid) => {
            const parts = adData.uuidParts(adUuid);
            if (parts.length > 0) {
              WWStorage.setAdVisibility(parts[0], false);
            }
          });
          WWStorage.setPhoneHidden(phone);
          close();
        }
      }
    }
  };
}

function renderGlobalButtons(): void {
  const existing = document.body.querySelector<HTMLElement>('[data-ww="global-buttons"]');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const element = document.createElement('div');
  element.innerHTML = GLOBAL_BUTTONS_TEMPLATE({
    savesCount: WWStorage.getFavorites().length,
    IS_MOBILE_VIEW
  });
  element.setAttribute('data-ww', 'global-buttons');

  if (IS_MOBILE_VIEW) {
    document.querySelector('.section-bottom-nav')?.appendChild(element);
  } else {
    document.body.appendChild(element);
  }

  registerFavoritesButton(element);
  registerSettingsButton(element);
  registerPhoneSearchButton(element);
}

export const globalRender = {
  async optimizeFavorites(): Promise<void> {
    const favs = WWStorage.getFavorites();
    for (let phone of favs) {
      const phoneAds = WWStorage.getPhoneAds(phone);

      if (
        phoneAds.length < 2 ||
        Date.now() - WWStorage.getLastTimeAdsOptimized(phone) < 2.16e+7 // 6 hours
      ) {
        continue;
      }

      let newestTime = -Infinity;
      let newestUuid: string | undefined;

      for (let uuid of phoneAds) {
        const data = await adData.loadInAdsData([uuid]);
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
  },

  registerGlobalButtons(): void {
    renderGlobalButtons();

    const siteGlobalButtons = document.querySelector('.page-actions-bottom');
    if (siteGlobalButtons && siteGlobalButtons.parentNode) {
      siteGlobalButtons.parentNode.removeChild(siteGlobalButtons);
    }

    let lastCount = WWStorage.getFavorites().length;
    setInterval(() => {
      const currentCount = WWStorage.getFavorites().length;
      if (lastCount !== currentCount) {
        lastCount = currentCount;
        renderGlobalButtons()
      }
    }, 500);
  },
};
