import {IS_AD_PAGE} from "./core/globals";
import {WWStorage} from "./core/storage";
import {renderer} from "./core/renderer";
import {favorites} from "./core/favorites";
import {IS_MOBILE_VIEW, IS_SAFARI_IOS} from "../common/globals";
import {misc} from "./core/misc";
import {iosUtils} from "./core/iosUtils";

const waitForSiteLoad = () => new Promise<void>(resolve => {
  const start = Date.now();
  const interval = setInterval(() => {
    if (
      document.body &&
      (
        document.querySelector('.site-copyright, .footer, #footer')
        || Date.now() - start > 300
      )
    ) {
      if (IS_SAFARI_IOS) {
        // Allow css loading.
        setTimeout(resolve, 150);
      } else {
        resolve();
      }
      clearInterval(interval);
    }
  }, 5)
});

const initializeAdPage = async () => {
  document.body.classList.add('onAdPage');

  const idElement = document.body.querySelector<HTMLElement>('[data-url^="/DetailAd/IncrementViewHit"]');
  const id = idElement!
    .getAttribute('data-url')!
    .replace(/^.*?adid=([^&]+)&.*$/, "$1");

  const item = document.body.querySelector<HTMLElement>('[itemtype="https://schema.org/Offer"], .content-data .detail-left');
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
};

const initializeListingPage = async () => {
  renderer.registerAdsInContext(document.body, { applyFocusMode: true, isFromListing: true });
  renderer.renderNextVisibleAdButton();

  if (location.pathname.startsWith('/anunturi/matrimoniale')) {
    renderer.renderGlobalButtons();
  }

  favorites.optimizeFavorites().catch(console.error);

  if (!WWStorage.hasBeenShownInfo()) {
    renderer.renderInfo();
    WWStorage.setHasBeenShownInfo();
  }

  iosUtils.focusListingAdIfNeeded();
};

WWStorage.upgrade()
  .then(waitForSiteLoad)
  .then(() => {
    console.log('Booting publi24-advanced-filter');

    try {
      document.body.classList.add(misc.getPubliTheme());
      Array.from(document.getElementsByClassName('theme-button')).forEach(child => {
        child.addEventListener('click', () => window.location.reload());
      });
    } catch (error) {
      console.error(error);
    }

    if (IS_MOBILE_VIEW) {
      document.body.classList.add('onMobile');
    }

    if (IS_AD_PAGE()) {
      return initializeAdPage();
    } else {
      return initializeListingPage();
    }
  })
  .catch(console.error);
