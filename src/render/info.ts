import {modalRender} from "./modal";
import {IS_MOBILE_VIEW} from "../core/globals";
import {WWStorage} from "../core/storage";

declare const Handlebars: any;
const INFO_TEMPLATE = Handlebars.templates.info_template;
const MESSAGE_MODAL_TEMPLATE = Handlebars.templates.message_modal_template;

interface Cutout {
  x: number;
  y: number;
  yy: number;
  xm: number;
  xrc: number;
  xlc: number;
  width: number;
  height: number;
}

export const infoRender = {
  showInfo(): void {
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

      window.scrollTo({top: 0, behavior: "instant"});
      const buttonsContainer = firstAd.querySelector<HTMLElement>('.ww-buttons');
      if (buttonsContainer) {
        buttonsContainer.scrollIntoView({behavior: 'instant', block: 'start'});
      }
      window.scrollBy({top: IS_MOBILE_VIEW ? -280 : -350, behavior: "instant"});

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
          const elToCutout = (el: Element | null): Cutout | null => {
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

          const adButtonsCutouts: (Cutout | null)[] = [
            firstAd.querySelector('.ww-buttons button:nth-child(1)'),
            firstAd.querySelector('.ww-buttons button:nth-child(2)'),
            firstAd.querySelector('.ww-buttons button:nth-child(3)'),
            firstAd.querySelector('.ww-buttons button:nth-child(4)'),
            firstAd.querySelector('.art-img'),
          ].map(elToCutout).filter((c): c is Cutout => c !== null); // Filter out nulls

          const globalButtonsCutouts: (Cutout | null)[] = [
            document.querySelector('.ww-phone-search-button'),
            document.querySelector('.ww-saves-button'),
            document.querySelector('.ww-settings-button'),
          ].map(elToCutout).filter((c): c is Cutout => c !== null); // Filter out nulls

          infoContainer.innerHTML = INFO_TEMPLATE({
            cutouts: adButtonsCutouts,
            adButtonsInfo: true,
            IS_MOBILE_VIEW
          });

          infoContainer.addEventListener('click', () => {
            try {
              if (shownStep === 1) {
                if (infoContainer.parentNode) {
                  infoContainer.parentNode.removeChild(infoContainer);
                }
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
  },
};

// @TODO: Remove in a month.
if (!WWStorage.hasShownMessage('account-delete')) {
  if (WWStorage.getVersion()) {
    modalRender.renderModal(MESSAGE_MODAL_TEMPLATE({IS_MOBILE_VIEW}));
  }
  WWStorage.setShownMessage('account-delete');
}
