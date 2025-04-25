import {adData} from "./adData";
import {adActions} from "./adActions";
import {IS_AD_PAGE, IS_MOBILE_VIEW} from "./globals";
import {WWStorage} from "./storage";
import * as ReactDOM from "react-dom/client";
import AdPanelRoot from "../component/AdPanel/AdPanelRoot";
import GlobalButtonsRoot from "../component/GlobalButtons/GlobalButtonsRoot";
import InfoOverlay, {CutoutRect} from "../component/InfoOverlay/InfoOverlay";

interface RenderOptions {
  showDuplicates?: boolean;
}

function renderAdElement(item: HTMLElement, id: string, renderOptions?: RenderOptions): () => void {
  if (!IS_AD_PAGE && item.hasAttribute('onclick')) {
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
  renderOptions?: RenderOptions;
}

export const renderer = {
  registerAdItem(item: HTMLElement, id: string, renderOptions?: RenderOptions): () => void {
    if (!WWStorage.getAdPhone(id) || WWStorage.hasAdNoPhone(id)) {
      CURRENT_INVESTIGATE_PROMISE = CURRENT_INVESTIGATE_PROMISE
        .then(() => adActions.investigateNumberAndSearch(item, id, false))
        // Wait a bit to avoid triggering rate limits.
        .then(() => new Promise(r => setTimeout(r, Math.min(2500, INVESTIGATE_TIMEOUT *= 1.3))));
    }

    return renderAdElement(item, id, renderOptions);
  },

  registerAdsInContext(context: HTMLElement | Document, {
    applyFocusMode = false,
    renderOptions
  }: RegisterAdsOptions = {}): Array<() => void> {
    let itemsNodeList = context.querySelectorAll<HTMLElement>('[data-articleid]');
    let items = Array.from(itemsNodeList);

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
      return renderer.registerAdItem(item, articleId, renderOptions);
    });
  },

  renderGlobalButtons(): void {
    const element = document.createElement('div');
    element.setAttribute('data-ww', 'global-buttons');
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
  },

  renderInfo(): void {
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const firstPhone = document.querySelector<HTMLElement>('[data-wwid="phone-number"]');

      if (!firstPhone) {
        return;
      }

      const firstAd = firstPhone.closest<HTMLElement>('[data-articleid]');
      if (!firstAd) {
        clearInterval(interval); // Stop if the ad element isn't found
        return;
      }

      clearInterval(interval);

      // Wait for things around to load.
      setTimeout(() => {
        const buttonsContainer = firstAd.querySelector<HTMLElement>('[data-wwid="control-panel"]');
        if (buttonsContainer) {
          buttonsContainer.scrollIntoView({behavior: 'instant', block: 'start'});
        }
        window.scrollBy({top: IS_MOBILE_VIEW ? -320 : -350, behavior: "instant"});

        // Wait for docking elements to finish animation.
        setTimeout(() => {
          let shownStep: number = 0;
          const infoContainer = document.createElement('div');
          document.body.appendChild(infoContainer);
          document.body.style.overflow = 'hidden';

          const errorCleanup = (error: any): void => {
            if (infoContainer.parentNode) {
              infoContainer.parentNode.removeChild(infoContainer);
            }
            document.body.style.overflow = 'initial';
            console.error(error);
          }

          try {
            const elToCutout = (el: Element | null): CutoutRect | null => {
              if (!el) return null;
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

            const adButtonsCutouts: CutoutRect[] = [
              firstAd.querySelector('[data-wwid="toggle-hidden"]'),
              firstAd.querySelector('[data-wwid="fav-toggle"]'),
              firstAd.querySelector('[data-wwid="investigate"]'),
              firstAd.querySelector('[data-wwid="investigate_img"]'),
              firstAd.querySelector('.art-img'),
            ].map(elToCutout).filter((c): c is CutoutRect => c !== null);

            const globalButtonsCutouts: CutoutRect[] = [
              document.querySelector('[data-wwid="phone-search"]'),
              document.querySelector('[data-wwid="favs-button"]'),
              document.querySelector('[data-wwid="settings-button"]'),
            ].map(elToCutout).filter((c): c is CutoutRect => c !== null);

            const root = ReactDOM.createRoot(infoContainer);
            root.render(<InfoOverlay cutouts={adButtonsCutouts} adButtonsInfo={true}/>);

            infoContainer.addEventListener('click', () => {
              try {
                if (shownStep === 1) {
                  root.unmount();
                  document.body.style.overflow = 'initial';
                  return;
                }

                root.render(<InfoOverlay cutouts={globalButtonsCutouts} globalButtonsInfo={true}/>)

                ++shownStep;
              } catch (error) {
                errorCleanup(error);
              }
            });
          } catch (error) {
            errorCleanup(error);
          }
        }, 700);
      }, 500);
    }, 100);
  },
};
