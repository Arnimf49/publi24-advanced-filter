import {adData} from "../core/adData";
import {linksFilter} from "../core/linksFilter";
import {misc} from "../core/misc";
import {adActions} from "../core/adActions";
import {modalRender, MODALS_OPEN} from "./modal";
import {IS_AD_PAGE, IS_MOBILE_VIEW, IS_SAFARI_IOS} from "../core/globals";
import {WWBrowserStorage} from "../core/browser_storage";
import {WWStorage} from "../core/storage";

declare const Splide: any;

interface ItemElement extends HTMLElement {
  stopRender?: () => void;
}

interface StorageData {
  [key: string]: any;
  local?: Record<string, string | null>;
}

interface RenderOptions {
  showDuplicates?: boolean;
}

declare const Handlebars: any;
const AD_TEMPLATE = Handlebars.templates.ad_template;
const PHONE_AND_TAGS_TEMPLATE = Handlebars.templates.phone_and_tags;
const SLIDER_TEMPLATE = Handlebars.templates.slider_template;
const HIDE_REASON_TEMPLATE = Handlebars.templates.hide_reason_template;
const DUPLICATES_MODAL_TEMPLATE = Handlebars.templates.ads_modal_template;
const ADS_TEMPLATE = Handlebars.templates.ads_template;

function cleanupAdRender(item: ItemElement): void {
  const existing = item.querySelector<HTMLElement>('.ww-container');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
}

function renderAdElement(item: ItemElement, id: string, storage: StorageData, renderOptions?: RenderOptions): void {
  const itemUrl = adData.getItemUrl(item);
  const phone = WWStorage.getAdPhone(id) || '';

  // @TODO: Artifact from storage migration. To be removed in a following version.
  WWStorage.addPhoneAd(phone, id, itemUrl);

  const searchLinks: string[] | undefined = storage[`ww:search_results:${id}`];
  const filteredSearchLinks = linksFilter.sortLinks(linksFilter.filterLinks(searchLinks || [], itemUrl));
  const nimfomaneLink = filteredSearchLinks.find(l => l.indexOf('https://nimfomane.com/forum/topic/') === 0);
  const imageSearchLinks: string[] | undefined = storage[`ww:image_results:${id}`];
  const imageSearchDomains = imageSearchLinks ? linksFilter.processImageLinks(id, imageSearchLinks, itemUrl) : undefined;

  const now = Date.now();
  const phoneTime = WWStorage.getInvestigatedTime(id);
  const imageTime = WWStorage.getAdImagesInvestigatedTime(id);
  let phoneInvestigatedSinceDays: string | undefined, imageInvestigatedSinceDays: string | undefined;
  let phoneInvestigateStale: boolean | undefined, imageInvestigateStale: boolean | undefined;

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
  if (automaticHideReason && hideReason) {
    hideReason = hideReason.replace('automat:', '');
  }

  const panelElement = document.createElement('div');
  panelElement.className = 'ww-container';
  panelElement.setAttribute('data-wwid', 'control-panel');
  panelElement.onclick = (e: MouseEvent) => e.stopPropagation();
  panelElement.innerHTML = AD_TEMPLATE({
    IS_MOBILE_VIEW,
    IS_AD_PAGE,
    hasDuplicateAdsWithSamePhone: WWStorage.getPhoneAds(phone).length > 1,
    showDuplicates: renderOptions?.showDuplicates ?? true,
    numberOfAdsWithSamePhone: WWStorage.getPhoneAds(phone).length,
    isFav: WWStorage.isFavorite(phone),
    visible: adData.getItemVisibility(id),
    hideReason,
    automaticHideReason,
    dueToPhoneHidden: adData.isDueToPhoneHidden(id),
    hasNoPhone: WWStorage.hasAdNoPhone(id),
    phone,
    searchLinks, // Pass the original, possibly undefined array
    filteredSearchLinks,
    imageSearchDomains,
    nimfomaneLink,
    hasImagesInOtherLocation: WWStorage.hasAdDuplicatesInOtherLocation(id),
    phoneInvestigatedSinceDays,
    imageInvestigatedSinceDays,
    phoneInvestigateStale,
    imageInvestigateStale,
    phoneAndTags: adRender.renderPhoneAndTags(phone),
  });

  const container = (item.querySelector<HTMLElement>('.article-txt, .ww-inset') || item);
  container.appendChild(panelElement);

  container.setAttribute('data-wwphone', phone || ''); // Ensure attribute value is string

  if (!IS_AD_PAGE && item.hasAttribute('onclick')) {
    const txtWrap = item.querySelector<HTMLElement>('.article-txt-wrap');
    if (txtWrap) {
      txtWrap.onclick = (event: MouseEvent) => event.stopPropagation();
    }
    const contentWrap = item.querySelector<HTMLElement>('.article-content-wrap');
    const originalOnclick = item.getAttribute('onclick');
    if (contentWrap && originalOnclick) {
      contentWrap.setAttribute('onclick', originalOnclick);
    }
    item.removeAttribute('onclick');
  }
}

function renderHideReasonSelection(
  container: HTMLElement,
  _: string,
  phoneNumber: string,
  preSelect: string | null,
  onReason: (close: () => void, reason: string) => void,
  onRevert?: (close: () => void) => void
): void {
  const reasonContainer = document.createElement('div');
  reasonContainer.innerHTML = HIDE_REASON_TEMPLATE({ showRevert: !!onRevert });
  reasonContainer.onclick = (e: MouseEvent) => e.stopPropagation();

  container.appendChild(reasonContainer);
  const close = () => {
    if (reasonContainer.parentNode === container) {
      container.removeChild(reasonContainer);
    }
  };

  if (IS_MOBILE_VIEW || IS_AD_PAGE) {
    const bounding = container.getBoundingClientRect();
    if (bounding.top < 120) {
      const scrollParent = misc.getScrollParent(container);
      scrollParent?.scrollBy({top: - (120 - bounding.top), behavior: "instant"});
    }
  }

  if (preSelect) {
    const selection = reasonContainer.querySelector<HTMLElement>(`[ww-reason="${preSelect}"]`);
    if (selection) {
      selection.classList.add('ww-reason-selected');
      WWStorage.setPhoneHiddenReason(phoneNumber, preSelect);
    }
  }

  reasonContainer.querySelectorAll<HTMLElement>('[ww-reason]').forEach((reasonButton) => {
    reasonButton.onclick = () => {
      const current = reasonContainer.querySelector<HTMLElement>('.ww-reason-selected');

      if (current) {
        current.classList.remove('ww-reason-selected');
      }

      reasonButton.classList.add('ww-reason-selected');
      const reasonText = reasonButton.innerText;
      WWStorage.setPhoneHiddenReason(phoneNumber, reasonText);
      onReason(close, reasonText);
    };
  });

  if (onRevert) {
    const showButton = reasonContainer.querySelector<HTMLElement>('[ww-show]');
    if (showButton) {
      showButton.onclick = () => {
        onRevert(close);
      };
    }
  }
}

function renderHideReasonSelectionInItem(item: ItemElement, id: string, phoneNumber: string): void {
  WWBrowserStorage.get([`ww:image_results:${id}`]).then((results: any) => {
    const imageLinks: string[] = results[`ww:image_results:${id}`] || [];
    const processedLinks = linksFilter.processImageLinks(id, imageLinks, adData.getItemUrl(item));
    const preSelect = processedLinks?.some(({links}) => links.some(({isSafe}) => !isSafe))
      ? 'poze false' : null;

    renderHideReasonSelection(item, id, phoneNumber, preSelect, () => {
      renderAdItem(item, id);
    }, (close) => {
      adActions.setItemVisible(item, true);
      WWStorage.setPhoneHidden(phoneNumber, false);
      WWStorage.setAdVisibility(id, true);
      close();
    })
  })
}

function createVisibilityClickHandler(item: ItemElement, id: string): (this: GlobalEventHandlers, e: MouseEvent) => Promise<void> {
  return async function (this: GlobalEventHandlers, e: MouseEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();

    let visible = adData.getItemVisibility(id);
    visible = !visible;
    (this as HTMLButtonElement).disabled = true;

    let phoneNumber = WWStorage.getAdPhone(id) || await adData.acquirePhoneNumber(item, id);
    if (phoneNumber) {
      WWStorage.setPhoneHidden(phoneNumber, !visible);
    }

    adActions.setItemVisible(item, visible);
    WWStorage.setAdVisibility(id, visible);
    (this as HTMLButtonElement).disabled = false;

    if (!visible && phoneNumber) {
      renderHideReasonSelectionInItem(item, id, phoneNumber);
    }
  };
}

function registerVisibilityHandler(item: ItemElement, id: string): void {
  const toggleVisibilityBtn = item.querySelector<HTMLElement>('[data-wwid="toggle-hidden"]');
  adActions.setItemVisible(item, adData.getItemVisibility(id));

  if (toggleVisibilityBtn) {
    toggleVisibilityBtn.onclick = createVisibilityClickHandler(item, id);
  }
}

function registerInvestigateHandler(item: ItemElement, id: string): void {
  const investigateBtn = item.querySelector<HTMLButtonElement>('[data-wwid="investigate"]');

  if (investigateBtn) {
    investigateBtn.onclick = async (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      investigateBtn.disabled = true;
      await adActions.investigateNumberAndSearch(item, id);
      investigateBtn.disabled = false;
    }
  }
}

function createInvestigateImgClickHandler(id: string, item: ItemElement): (this: GlobalEventHandlers, e: MouseEvent) => Promise<void> {
  const imageToLensUrl = (imgLink: string): string => {
    const encodedLink = encodeURIComponent(imgLink);
    return `https://lens.google.com/uploadbyurl?url=${encodedLink}&hl=ro`;
  }
  const openImageInvestigation = (imgLink: string): void => {
    window.open(imageToLensUrl(imgLink));
  }

  return async function (this: GlobalEventHandlers, e: MouseEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();

    if (!WWStorage.getAdPhone(id) && !(await adActions.investigateNumberAndSearch(item, id, false))) {
      return;
    }

    if (this) (this as HTMLButtonElement).disabled = true;
    await WWBrowserStorage.set(`ww:image_results:${id}`, null);

    let imgs: string[] = [];

    if (IS_AD_PAGE && IS_MOBILE_VIEW) {
      const matches = document.body.innerHTML.match(/https:\/\/s3\.publi24\.ro\/[^\/]+\/large\/[^.]+\.(jpg|webp|png)/g);
      imgs = matches ? [...new Set(matches)] : [];
    }
    else if (IS_AD_PAGE) {
      // @ts-ignore
      imgs = [...document.body.querySelectorAll<HTMLImageElement>('[id="detail-gallery"] img')]
        .map(img => img.getAttribute('src'))
        .filter((src): src is string => !!src); // Type guard to filter out nulls

      // Maybe the post has only one picture. In that case gallery is not shown.
      if (imgs.length === 0) {
        // @ts-ignore
        imgs = [...document.body.querySelectorAll<HTMLImageElement>('.detailViewImg')]
          .map(img => img.getAttribute('src'))
          .filter((src): src is string => !!src); // Type guard
      }
    }
    else {
      imgs = await adData.acquireSliderImages(item);
    }

    const done = (): void => {
      WWStorage.setAdImagesInvestigatedTime(id, Date.now());
      adActions.analyzeFoundImages(id, item);
      if (this) (this as HTMLButtonElement).disabled = false;
    }

    await WWBrowserStorage.set(`ww:img_search_started_for`, {
      wwid: id,
      count: imgs.length,
      imgs: imgs.map(url => imageToLensUrl(url)),
    });

    if (IS_MOBILE_VIEW && imgs.length > 0) {
      openImageInvestigation(imgs[0]);
    }
    else {
      imgs.forEach(img => openImageInvestigation(img));
    }

    const interval = setInterval(async() => {
      const results = await WWBrowserStorage.get(`ww:img_search_started_for`);
      const searchData = results[`ww:img_search_started_for`];
      if (
        !searchData || searchData.count === 0
        // On safari the browser storage api breaks after returning from another tab. Reload to reset.
        || (results as any).__from__cache
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

function registerInvestigateImgHandler(item: ItemElement, id: string): void {
  const investigateImgBtn = item.querySelector<HTMLButtonElement>('[data-wwid="investigate_img"]');

  if (investigateImgBtn) {
    investigateImgBtn.onclick = createInvestigateImgClickHandler(id, item);
  }
}

function registerFavoriteHandler(item: ItemElement, id: string): void {
  const tempSaveBtn = item.querySelector<HTMLButtonElement>('[data-wwid="temp-save"]');

  if (tempSaveBtn) {
    tempSaveBtn.onclick = () => {
      const phone = WWStorage.getAdPhone(id);
      if (phone) {
        WWStorage.toggleFavorite(phone);
      }
      renderAdItem(item, id);

      const modalParent = item.closest<HTMLElement & { removeAd?: (item: ItemElement) => void }>('[data-ww="favorites-modal"]');
      if (modalParent && typeof modalParent.removeAd === 'function') {
        modalParent.removeAd(item);
      }
    }
  }
}

function registerDuplicatesModalHandler(item: ItemElement, id: string): void {
  const duplicatesBtn = item.querySelector<HTMLButtonElement>('[data-wwid="duplicates"]');

  if (!duplicatesBtn) {
    return;
  }

  duplicatesBtn.onclick = async () => {
    const {close: closeLoader} = modalRender.renderGlobalLoader('La 20+ de anunțuri durează mai mult sa încarce, din cauză la limitari de Publi24.');

    const phone = WWStorage.getAdPhone(id);

    if (!phone) {
      return;
    }

    const duplicateUuids = WWStorage.getPhoneAds(phone);
    const itemData = await adData.loadInAdsData(
      duplicateUuids,
      (uuid: string) => WWStorage.removePhoneAd(phone, uuid)
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
    const {container, close} = modalRender.renderModal(html, {showDuplicates: false});

    const hideAllBtn = container.querySelector<HTMLButtonElement>('[data-wwid="hide-all"]');
    if (hideAllBtn) {
      hideAllBtn.onclick = (event: MouseEvent) => {
        event.stopPropagation();

        duplicateUuids.forEach((adUuid) => {
          const parts = adData.uuidParts(adUuid);
          if (parts.length > 0) {
            WWStorage.setAdVisibility(parts[0], false);
          }
        });
        WWStorage.setPhoneHidden(phone);

        if (hideAllBtn.parentNode) {
          hideAllBtn.parentNode.removeChild(hideAllBtn);
        }

        const modalContainer = container.querySelector<HTMLElement>('[data-wwid="container"]');
        if (modalContainer) {
          renderHideReasonSelection(
            modalContainer,
            id, phone, null, () => close()
          );
        }
      }
    }
  }
}

function registerOpenImagesSliderHandler(item: ItemElement, id: string): void {
  const button = item.querySelector<HTMLAnchorElement>('.art-img a');

  if (!button) return;

  button.onclick = async (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const images = await adData.acquireSliderImages(item);
    const visible = adData.getItemVisibility(id);

    const sliderContainer = document.createElement('div');
    sliderContainer.id = '_ww_slider';
    sliderContainer.innerHTML = SLIDER_TEMPLATE({images, visible, IS_MOBILE_VIEW});
    MODALS_OPEN.push(sliderContainer);

    document.body.appendChild(sliderContainer);
    document.body.style.overflow = 'hidden';

    const splideElement = sliderContainer.querySelector<HTMLElement>('.splide');
    if (!splideElement) return; // Guard against missing element

    const splide = new Splide( splideElement, { focus: 'center', type: 'loop', keyboard: 'global' });

    const onKeyDown = function (event: KeyboardEvent): void {
      if (event.key.toLowerCase() === 'a') {
        splide.go('-1');
      } else if (event.key.toLowerCase() === 'd') {
        splide.go('+1');
      }
    };
    window.addEventListener("keydown", onKeyDown);

    splide.mount();

    const close = (): void => {
      if (sliderContainer.parentNode === document.body) {
        document.body.removeChild(sliderContainer);
      }
      MODALS_OPEN.pop();
      window.removeEventListener('keydown',  closeOnKey);
      window.removeEventListener('keydown',  onKeyDown);
      document.body.style.overflow = 'initial';
    };
    const closeOnKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && MODALS_OPEN[MODALS_OPEN.length-1] === sliderContainer) close();
    };

    window.addEventListener('keydown',  closeOnKey);

    const visibilityButton = sliderContainer.querySelector<HTMLButtonElement>('[data-wwid="toggle-hidden"]');
    const visibilityHandler = createVisibilityClickHandler(item, id);
    if (visibilityButton) {
      visibilityButton.onclick = function (e: MouseEvent) {
        e.stopPropagation();
        visibilityHandler.apply(this, [e]);
        close();
      };
    }

    const analyzeImagesButton = sliderContainer.querySelector<HTMLButtonElement>('[data-wwid="analyze-images"]');
    const imageInvestigateHandler = createInvestigateImgClickHandler(id, item);
    if (analyzeImagesButton) {
      analyzeImagesButton.onclick = async function(e: MouseEvent) {
        e.stopPropagation();
        await imageInvestigateHandler.apply(this as HTMLButtonElement, [e]);
        close();
      };
    }

    const closeButton = sliderContainer.querySelector<HTMLButtonElement>('[data-wwid="close"]');
    if (closeButton) closeButton.onclick = close;
    sliderContainer.onclick = close;

    sliderContainer.querySelectorAll<HTMLElement>('.splide__arrow')
      .forEach((el) => el.addEventListener('click', (e: MouseEvent) => e.stopPropagation()));
  }
}

function registerHandlers(item: ItemElement, id: string): void {
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

async function getStorageItems(browserKeys: string[], localKeys: string[]): Promise<StorageData> {
  const browserValues = await WWBrowserStorage.get(browserKeys);
  browserValues.local = {};
  localKeys.forEach(k => browserValues.local[k] = localStorage.getItem(k))
  return browserValues;
}


function renderAdWithCleanupAndCache(item: ItemElement, id: string, searchResults: StorageData, renderOptions?: RenderOptions): void {
  cleanupAdRender(item);
  renderAdElement(item, id, searchResults, renderOptions);
  registerHandlers(item, id);
}

const STORAGE_KEYS = (id: string): [string[], string[]] => [[`ww:search_results:${id}`, `ww:image_results:${id}`], WWStorage.getAdStoreKeys(id)];

function renderAdItem(item: ItemElement, id: string, renderOptions?: RenderOptions): void {
  getStorageItems(...STORAGE_KEYS(id))
    .then((r) => renderAdWithCleanupAndCache(item, id, r, renderOptions));
}

let CURRENT_INVESTIGATE_PROMISE: Promise<any> = Promise.resolve();
let INVESTIGATE_TIMEOUT: number = 500;

interface RegisterAdsOptions {
  applyFocusMode?: boolean;
  renderOptions?: RenderOptions;
}

export const adRender = {
  renderPhoneAndTags(phone: string, noPadding: boolean = false): string {
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
  },

  registerAdItem(item: ItemElement, id: string, renderOptions?: RenderOptions): () => void {
    renderAdItem(item, id, renderOptions);
    const renderCache: Record<string, string> = {};

    if (!WWStorage.getAdPhone(id) || WWStorage.hasAdNoPhone(id)) {
      CURRENT_INVESTIGATE_PROMISE = CURRENT_INVESTIGATE_PROMISE
        .then(() => adActions.investigateNumberAndSearch(item, id, false))
        // Wait a bit to avoid triggering rate limits.
        .then(() => new Promise(r => setTimeout(r, Math.min(2500, INVESTIGATE_TIMEOUT *= 1.3))));
    }

    const interval = setInterval(() => {
      getStorageItems(...STORAGE_KEYS(id)).then(r => {
        const stringifiedResult = JSON.stringify(r);
        if (renderCache[id] !== stringifiedResult) {
          renderCache[id] = stringifiedResult;
          renderAdWithCleanupAndCache(item, id, r, renderOptions);
        }
      });
    }, 300 + Math.round(Math.random() * 100));

    const stopRender = (): void => clearInterval(interval);
    item.stopRender = stopRender;

    return stopRender;
  },

  registerAdsInContext(context: HTMLElement | Document, {
    applyFocusMode = false,
    renderOptions
  }: RegisterAdsOptions = {}): Array<() => void> {
    let itemsNodeList = context.querySelectorAll<ItemElement>('[data-articleid]');
    let items: ItemElement[] = Array.from(itemsNodeList);

    if (applyFocusMode && WWStorage.isFocusMode()) {
      items = items.filter((item) => {
        const articleId = item.getAttribute('data-articleid');
        if (articleId && adData.getItemVisibility(articleId)) {
          return true;
        }
        item.style.display = 'none';
        return false;
      })
    }

    return items.map((item) => {
      const articleId = item.getAttribute('data-articleid');
      if (!articleId) {
        console.error("Item missing data-articleid", item);
        return () => {
        };
      }
      return adRender.registerAdItem(item, articleId, renderOptions);
    });
  }
};
