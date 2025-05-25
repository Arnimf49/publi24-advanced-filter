import {IS_AD_PAGE} from "./core/globals";
import {WWStorage} from "./core/storage";
import {renderer} from "./core/renderer";
import {favorites} from "./core/favorites";
import {IS_MOBILE_VIEW} from "../common/globals";

WWStorage.upgrade()
  .then(() => {
    console.log('Booting publi24-advanced-filter');

    if (IS_MOBILE_VIEW) {
      document.body.classList.add('onMobile');
    }

    if (IS_AD_PAGE) {
      document.body.classList.add('onAdPage');

      const idElement = document.body.querySelector<HTMLElement>('[data-url^="/DetailAd/IncrementViewHit"]');
      const id = idElement!
        .getAttribute('data-url')!
        .replace(/^.*?adid=([^&]+)&.*$/, "$1");

      const item = document.body.querySelector<HTMLElement>('[itemtype="https://schema.org/Offer"]');
      item!.setAttribute('data-articleid', id.toUpperCase());

      const container = document.createElement('div');
      container.classList.add('ww-inset');
      const skipClasses: string[] = ['featuredArticles', 'detailAd-login'];

      while (item!.children.length > 0) {
        const childElement = item!.children[0];
        if (skipClasses.some((c: string): boolean => childElement.classList.contains(c))) {
          item!.removeChild(childElement);
        } else {
          container.appendChild(childElement);
        }
      }
      item!.appendChild(container);
      item!.style.position = 'relative';

      renderer.registerAdItem(item!, id.toUpperCase());
    } else {
      renderer.registerAdsInContext(document.body, { applyFocusMode: true });
      renderer.renderNextVisibleAdButton();

      if (location.pathname.startsWith('/anunturi/matrimoniale')) {
        renderer.renderGlobalButtons();
      }

      favorites.optimizeFavorites();

      if (!WWStorage.hasBeenShownInfo()) {
        renderer.renderInfo();
        WWStorage.setHasBeenShownInfo();
      }
    }
  })
  .catch(console.error);
