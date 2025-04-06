import {adRender} from "./render/ad";
import {globalRender} from "./render/global";
import {infoRender} from "./render/info";
import {IS_AD_PAGE} from "./core/globals";
import {WWStorage} from "./core/storage";

declare const Handlebars: any;

Handlebars.registerHelper('isUndefined', (value: unknown): boolean => {
  return value === undefined;
});

Handlebars.registerHelper('isEmpty', (value: string | any[]): boolean => {
  return value.length === 0;
});

Handlebars.registerHelper('inc', (value: number): number => {
  return ++value;
});

Handlebars.registerHelper("len", (array: any[]): number => {
  return array.length;
});

WWStorage.upgrade()
  .then(() => {
    console.log('Booting publi24-advanced-filter');

    if (IS_AD_PAGE) {
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

      adRender.registerAdItem(item!, id.toUpperCase());
    } else {
      adRender.registerAdsInContext(document.body, { applyFocusMode: true });
      if (location.pathname.startsWith('/anunturi/matrimoniale')) {
        globalRender.registerGlobalButtons();
      }
      globalRender.optimizeFavorites();
      if (!WWStorage.hasBeenShownInfo()) {
        setTimeout(infoRender.showInfo, 100);
        WWStorage.setHasBeenShownInfo();
      }
    }
  });
