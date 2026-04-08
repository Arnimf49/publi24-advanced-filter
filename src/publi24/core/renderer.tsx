import React from "react";
import {adData} from "./adData";
import {adActions} from "./adActions";
import {IS_AD_PAGE} from "./globals";
import {WWStorage} from "./storage";
import * as ReactDOM from "react-dom/client";
import AdPanelRoot from "../component/AdPanel/AdPanelRoot";
import GlobalButtonsRoot from "../component/GlobalButtons/GlobalButtonsRoot";
import TutorialOverlay from "../component/TutorialOverlay/TutorialOverlay";
import {IS_MOBILE_VIEW} from "../../common/globals";
import {misc} from "./misc";
import AdsModalRoot from "../component/Common/Partials/AdsModal/AdsModalRoot";

interface RenderOptions {
  showDuplicates?: boolean;
}

function renderAdElement(item: HTMLElement, id: string, renderOptions?: RenderOptions): () => void {
  if (!IS_AD_PAGE() && item.hasAttribute('onclick')) {
    const txtWrap = item.querySelector<HTMLElement>('.article-txt-wrap');
    if (txtWrap) {
      txtWrap.onclick = (event: MouseEvent) => event.stopPropagation();
    }

    const contentWrap = item.querySelector<HTMLElement>('.article-content-wrap');
    const originalOnclick = item.onclick;
    item.onclick = null;

    if (contentWrap && originalOnclick) {
      contentWrap.onclick = originalOnclick;
    }
  }

  const panelElement = document.createElement('div');
  panelElement.onclick = (e: MouseEvent) => e.stopPropagation();
  const root = ReactDOM.createRoot(panelElement);
  root.render(<AdPanelRoot id={id} item={item} renderOptions={renderOptions}/>);

  const container = (item.querySelector<HTMLElement>('.article-txt, .ww-inset') || item);
  container.appendChild(panelElement);

  const hideReasonContainer = document.createElement('div');
  hideReasonContainer.setAttribute('data-wwid', 'hide-reason-container');
  hideReasonContainer.onclick = (e) => e.stopPropagation();
  item.appendChild(hideReasonContainer);

  return () => root.unmount();
}

let CURRENT_INVESTIGATE_PROMISE: Promise<any> = Promise.resolve();
let INVESTIGATE_TIMEOUT: number = 500;

interface RegisterAdsOptions {
  applyFocusMode?: boolean;
  isFromListing?: boolean;
  renderOptions?: RenderOptions;
}

export const renderer = {
  registerAdItem(item: HTMLElement, id: string, renderOptions?: RenderOptions): () => void {
    const phone = WWStorage.getAdPhone(id);

    if (phone && WWStorage.isPhoneHidden(phone)) {
      adActions.resetExpiredHides(phone, id);
    }

    if (
      !phone
      || WWStorage.hasAdNoPhone(id)
      || adData.isStaleAnalyze(id)
    ) {
      CURRENT_INVESTIGATE_PROMISE = CURRENT_INVESTIGATE_PROMISE
        .then(() => adActions.investigateNumberAndSearch(item, id, false))
        // Wait a bit to avoid triggering rate limits.
        .then(() => new Promise(r => setTimeout(r, Math.min(2500, INVESTIGATE_TIMEOUT *= 1.3))));
    }

    if (phone) {
      WWStorage.addPhoneAd(phone, id, adData.getItemUrl(item));
    }

    return renderAdElement(item, id, renderOptions);
  },

  registerAdsInContext(context: HTMLElement | Document, {
    applyFocusMode = false,
    isFromListing = false,
    renderOptions
  }: RegisterAdsOptions = {}): Array<() => void> {
    let itemsNodeList = context.querySelectorAll<HTMLElement>('[data-articleid]');
    let items = Array.from(itemsNodeList);
    let hiddenCount = 0;

    if (applyFocusMode && WWStorage.isFocusMode()) {
      items = items.filter((item) => {
        const articleId = item.getAttribute('data-articleid');
        if (articleId && adData.getItemVisibility(articleId)) {
          return true;
        }
        item.style.display = 'none';
        hiddenCount++;
        return false;
      })

      if (hiddenCount > 0 && isFromListing) {
        const list = context.querySelector('.article-list');
        const pager = context.querySelector('.article-list ul.pagination');
        const hiddenIndicator = document.createElement('div');
        hiddenIndicator.setAttribute('data-wwid', 'hidden-count-indicator');
        hiddenIndicator.className = 'article-item';
        hiddenIndicator.style.textAlign = 'center';
        hiddenIndicator.style.padding = '20px';
        hiddenIndicator.style.color = '#666';
        hiddenIndicator.textContent = `${hiddenCount} anunțuri ascunse de tot`;
        list!.insertBefore(hiddenIndicator, pager!);
      }
    }

    return items.map((item) => {
      const articleId = item.getAttribute('data-articleid');

      if (!articleId) {
        console.error("Item missing data-articleid", item);
        return () => {};
      }

      if (isFromListing) {
        try {
          const lastSeen = adActions.adSeen(item, articleId);

          if (
            WWStorage.isAdDeduplicationEnabled()
            && adData.hasAdNewerDuplicate(articleId)
            && lastSeen !== undefined
          ) {
            item.style.display = 'none';
          }
        } catch (error) {
          console.error(error);
        }
      }

      return renderer.registerAdItem(item, articleId, renderOptions);
    });
  },

  renderGlobalButtons(): void {
    const element = document.createElement('div');
    element.setAttribute('data-ww', 'global-buttons');
    element.classList.add('ww-global-buttons-root');
    const root = ReactDOM.createRoot(element);
    root.render(<GlobalButtonsRoot/>);

    if (IS_MOBILE_VIEW) {
      document.querySelector('.section-bottom-nav')?.appendChild(element);
    } else {
      document.body.appendChild(element);
    }

    const siteGlobalButtons = document.querySelector('.page-actions-bottom');
    if (siteGlobalButtons && siteGlobalButtons.parentNode) {
      siteGlobalButtons.parentNode.removeChild(siteGlobalButtons);
    }
    const siteSaveSearch = document.querySelector('.save-search-wrap');
    if (siteSaveSearch && siteSaveSearch.parentNode) {
      siteSaveSearch.parentNode.removeChild(siteSaveSearch);
    }
  },

  renderNextVisibleAdButton() {
    const paginationArrows = document.querySelectorAll<HTMLLinkElement>('.pagination .arrow');
    const lastArrowLink = paginationArrows.length ? paginationArrows[paginationArrows.length - 1].querySelector('a') : null;
    const currentPageMatch = window.location.search.match(/[?&]pag=(\d+)/);
    const currentPage = currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;
    const arrowHref = lastArrowLink?.getAttribute('href') || '';
    const arrowPageMatch = arrowHref.match(/[?&]pag=(\d+)/);
    const arrowPage = arrowPageMatch ? parseInt(arrowPageMatch[1], 10) : 1;
    const nextPageArrow = lastArrowLink && arrowPage > currentPage ? lastArrowLink : null;

    if (!nextPageArrow) {
      console.warn('Failed to register next visible ad button. Missing next page arrow.')
      return;
    }

    if (WWStorage.isFindNextVisibleAd()) {
      return;
    }

    const list = document.querySelector('.article-list');

    if (!list) {
      console.warn('Failed to register next visible ad button. Missing article list.')
      return;
    }

    const button = document.createElement('button');
    button.classList.add('mainbg', 'radius');
    button.setAttribute('data-wwid', 'next-visible-ad');
    button.innerHTML = 'următorul anunț vizibil / nou';
    button.style.margin = 'auto';
    button.style.display = 'block';
    if (misc.getPubliTheme() === 'dark') {
      button.style.background = '#9fc2fa';
      button.style.setProperty('color', '#111', 'important');
    }
    if (IS_MOBILE_VIEW) {
      button.style.marginTop = '-15px';
    }

    list.appendChild(button);

    button.addEventListener('click', () => {
      WWStorage.setFindNextVisibleAd();
      nextPageArrow.click();
    });
  },

  renderAdsModal(phone: string): () => void {
    const element = document.createElement('div');
    element.setAttribute('data-ww', 'ads-modal-container');
    document.body.appendChild(element);

    const root = ReactDOM.createRoot(element);

    const cleanup = () => {
      root.unmount();
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };

    root.render(<AdsModalRoot phone={phone} close={cleanup} />);

    return cleanup;
  },

  renderInfo(): void {
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      let firstAd = Array.from(document.querySelectorAll<HTMLElement>('[data-articleid]')).find(el => {
        return WWStorage.getAdPhone(el.getAttribute('data-articleid')!);
      })
      let articleId = firstAd?.getAttribute('data-articleid');

      if (!firstAd || !articleId) {
        return;
      }

      clearInterval(interval);

      const previousDisplay = firstAd.style.display;
      const wasHidden = previousDisplay === 'none';
      let unmountAdPanel: (() => void) | null = null;

      if (wasHidden) {
        unmountAdPanel = renderer.registerAdItem(firstAd, articleId);
      }

      firstAd.style.display = '';
      WWStorage.setAdTutorial(articleId, true);

      const infoContainer = document.createElement('div');
      document.body.appendChild(infoContainer);
      document.body.style.overflow = 'hidden';

      const root = ReactDOM.createRoot(infoContainer);

      const cleanup = (): void => {
        WWStorage.delAdProp(articleId, 'tutorial');
        firstAd.style.display = previousDisplay;
        if (unmountAdPanel) {
          unmountAdPanel();
        }
        root.unmount();
        if (infoContainer.parentNode) {
          infoContainer.parentNode.removeChild(infoContainer);
        }
        document.body.style.overflow = 'initial';
      };

      try {
        root.render(<TutorialOverlay firstAd={firstAd} onComplete={cleanup} />);
      } catch (error) {
        cleanup();
        console.error(error);
      }
    }, 100);
  },
};
