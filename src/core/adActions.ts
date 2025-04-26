import {adData} from "./adData";
import {misc} from "./misc";
import {dateLib} from "./dateLib";
import {IS_AD_PAGE, IS_MOBILE_VIEW, IS_SAFARI_IOS} from "./globals";
import {WWBrowserStorage} from "./browserStorage";
import {AutoHideCriterias, WWStorage} from "./storage";

export type AdContentTuple = [string, number | boolean];

export interface AutoHideCriteriaProps {
  condition: (criterias: AutoHideCriterias, value: any) => boolean;
  value: string;
  reason: (criterias: AutoHideCriterias) => string;
}

const AUTO_HIDE_CRITERIA: { [key in keyof AutoHideCriterias]: AutoHideCriteriaProps } = {
  maxAge: {
    condition: ({maxAgeValue}: AutoHideCriterias, value: number): boolean => !!maxAgeValue && maxAgeValue < value,
    value: 'age',
    reason: ({maxAgeValue}: AutoHideCriterias): string => `peste ${maxAgeValue} de ani`,
  },
  minHeight: {
    condition: ({minHeightValue}: AutoHideCriterias, value: number): boolean => !!minHeightValue && minHeightValue > value,
    value: 'height',
    reason: ({minHeightValue}: AutoHideCriterias): string => `sub ${minHeightValue}cm`,
  },
  maxHeight: {
    condition: ({maxHeightValue}: AutoHideCriterias, value: number): boolean => !!maxHeightValue && maxHeightValue < value,
    value: 'height',
    reason: ({maxHeightValue}: AutoHideCriterias): string => `peste ${maxHeightValue}cm`,
  },
  maxWeight: {
    condition: ({maxWeightValue}: AutoHideCriterias, value: number): boolean => !!maxWeightValue && maxWeightValue < value,
    value: 'weight',
    reason: ({maxWeightValue}: AutoHideCriterias): string => `peste ${maxWeightValue}kg`,
  },
  onlyTrips: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'onlyTrips',
    reason: (): string => `numai deplasări`,
  },
  showWeb: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'showWeb',
    reason: (): string => `oferă show web`,
  },
  botox: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'botox',
    reason: (): string => `siliconată`,
  },
  party: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'party',
    reason: (): string => `face party`,
  },
  total: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'total',
    reason: (): string => `servicii totale`,
  },
  trans: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'trans',
    reason: (): string => `transsexual`,
  },
  mature: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'mature',
    reason: (): string => `matură`,
  },
};

async function investigateAdContent(item: Element): Promise<AdContentTuple[]> {
  const pageResult = await adData.loadInAdPage(item);
  if (pageResult instanceof Error) {
    // Or handle error differently if needed, TS requires check
    console.error("Failed to load ad page:", pageResult);
    return [];
  }
  const page = pageResult as DocumentFragment | HTMLElement; // Type assertion after check
  const content: string = misc.removeDiacritics(adData.getPageTitle(page) + ' ' + adData.getPageDescription(page));

  const data: AdContentTuple[] = [];
  let match: RegExpMatchArray | null;

  const attemptApplyHeight = (height: number): void => {
    if (height >= 135 && height <= 200) {
      data.push(['height', height]);
    }
  }
  const attemptApplyWeight = (weight: number): void => {
    if (weight >= 35 && weight <= 145) {
      data.push(['weight', weight]);
    }
  }

  if ((match = content.match(/(1[.,'" ] ?[3-9]\d)/))) {
    const str: string = match[1].replace(/[,'" ]/, '.').replace(' ', '');
    attemptApplyHeight(Number.parseFloat(str) * 100);
  }
  if (!data.find(d => d[0] === 'height') && (match = content.match(/[^\d%](1[3-9]\d) ?[^\d%]/))) {
    attemptApplyHeight(Number.parseInt(match[1], 10));
  }
  if (!data.find(d => d[0] === 'height') && (match = content.match(/inaltimea? (1[3-9]\d)/i))) {
    attemptApplyHeight(Number.parseInt(match[1], 10));
  }

  if ((match = content.match(/(\d+) ?(de )?(kg|kilo)/i))) {
    attemptApplyWeight(Number.parseInt(match[1], 10));
  }
  if ((match = content.match(/kg ?(\d+)/i))) {
    attemptApplyWeight(Number.parseInt(match[1], 10));
  }

  if ((match = content.match(/(\d+) ?(de )?ani(?! de)/i))
    || (match = content.match(/anca (\d+)/i))
    || (match = content.match(/matura (\d+)/i))
    || (match = content.match(/(\d+) ?(yrs|years)/i))) {
    const age = Number.parseInt(match[1], 10);
    if (age >= 17 && age <= 70) {
      data.push(['age', age]);
    }
  }

  if (content.match(/(\W|^)(show web|web show|show la web|show erotic web|si webb?)(\W|$)/i)) {
    data.push(['showWeb', true]);
  }
  if (content.match(/(\W|^)(botox|siliconata|silicoane)(\W|$)/i)) {
    data.push(['botox', true]);
  }
  if (content.match(/(\W|^)(party)(\W|$)/i)) {
    data.push(['party', true]);
  }
  if (content.match(/(\W|^)(servtotale|servicii totale|tottal|(?<!(devii |fii ))total)(\W|$)|(\W|^)full (?!\s*(detail|of))/i)
    && !content.match(/(\W|^)(nu fac total|nu ofer total)(\W|$)/i)) {
    data.push(['total', true]);
  }
  if (content.match(/(\W|^)((doar|numai) (deplasar|depalsar|deplsar)(i{1,3}|e)|nu am locatie)(\W|$)/i)
    && !content.match(/(\W|^)(la mine|locatie proprie|si deplasar[ie]|si locatie|locatia mea|in locatie|nu fac deplasari)(\W|$)/i)) {
    data.push(['onlyTrips', true]);
  }
  if (content.match(/(\W|^)(trans|transsexuala?)(\W|$)/i)) {
    data.push(['trans', true]);
  }
  if (content.match(/(\W|^)(matura)(\W|$)/i)) {
    data.push(['mature', true]);
  }

  return data;
}

function applyAutoHiding(phoneNumber: string, id: string, contentData: AdContentTuple[]): void {
  const criterias: AutoHideCriterias = WWStorage.getAutoHideCriterias();
  const matched: string[] = [];

  for (let [criteria, props] of Object.entries(AUTO_HIDE_CRITERIA)) {
    if (!WWStorage.isAutoHideCriteriaEnabled(criteria as keyof AutoHideCriterias)) {
      continue;
    }

    const dataItem = contentData.find(([key]) => key === props.value);

    if (dataItem && props.condition(criterias, dataItem[1])) {
      matched.push(props.reason(criterias));
    }
  }

  if (matched.length) {
    WWStorage.setAdVisibility(id, false);
    WWStorage.setPhoneHidden(phoneNumber, true);
    WWStorage.setPhoneHiddenReason(phoneNumber, 'automat: ' + matched.join(' / '));
  }
}

export const adActions = {
  setItemVisible(item: HTMLElement, v: boolean): void {
    const target = item.querySelector<HTMLElement>('.article-txt-wrap, .ww-inset');

    if (target) {
      target.style.opacity = v ? '1' : '0.5';
      target.style.mixBlendMode = v ? 'initial' : 'luminosity';
    }
  },

  async investigateNumberAndSearch(item: HTMLElement, id: string, search: boolean = true): Promise<boolean> {
    let windowRef: Window | null = null;
    if (search) {
      windowRef = window.open();
    }

    const [phoneNumberResult, contentData] = await Promise.all([
      adData.acquirePhoneNumber(item, id),
      investigateAdContent(item)
    ]);

    if (!phoneNumberResult) {
      return false;
    }
    const phoneNumber: string = phoneNumberResult;

    contentData.forEach(([key, value]: AdContentTuple) =>
      WWStorage.setPhoneProp(phoneNumber, key, value));

    if (WWStorage.isPhoneHidden(phoneNumber)) {
      adActions.setItemVisible(item, false);
    } else if (WWStorage.isAutoHideEnabled()) {
      applyAutoHiding(phoneNumber, id, contentData);
    }

    if (search && windowRef) {
      WWBrowserStorage.set(`ww:search_results:${id}`, []).then(() => {
        const encodedId: string = encodeURIComponent(id);
        const urlMatch: RegExpMatchArray | null = adData.getItemUrl(item).match(/\/([^./]+)\.html/);
        const addUrlId: string = urlMatch ? urlMatch[1] : ''; // Handle potential null match
        const encodedSearch: string = encodeURIComponent(`"${phoneNumber}" OR "${addUrlId}"`);
        windowRef!.location.href = `https://www.google.com/search?wwsid=${encodedId}&q=${encodedSearch}`;
        WWStorage.setInvestigatedTime(id, Date.now());
      });

      if (IS_SAFARI_IOS) {
        setInterval(() => {
          if (windowRef?.closed) {
            window.location.reload();
          }
        }, 300);
      }
    }

    return true;
  },

  async analyzeFoundImages(id: string, item: Element): Promise<void> {
    const results: { [key: string]: string[] } = await WWBrowserStorage.get(`ww:image_results:${id}`);
    const imageLinks: string[] = results[`ww:image_results:${id}`] || [];
    const publi24AdLinks: string[] = imageLinks
      .filter((link: string) => link.match(/^https:\/\/(www\.)?publi24\.ro\/.+\/anunt\/.+$/));

    WWStorage.clearAdDeadLinks(id);
    WWStorage.clearAdDuplicatesInOtherLocation(id);
    const currentAdLocation: string = adData.getItemLocation(item);
    const pageResultForDate = await adData.loadInAdPage(item);
    if (pageResultForDate instanceof Error) {
      console.error("Failed to load ad page for date:", pageResultForDate);
      return;
    }
    const currentAdDate: Date = adData.getPageDate(pageResultForDate as DocumentFragment | HTMLElement);

    const pageResults = await Promise.all(publi24AdLinks.map((link: string) =>
      adData.loadInAdPage(null, link).catch((e) => {
        console.error(e);
        return {error: true, code: e.code};
      })
    ));

    pageResults.forEach((pageResult, index: number) => {
      if (typeof pageResult === 'object' && pageResult !== null && (pageResult as any).error) {
        if ((pageResult as any).code === 410) {
          WWStorage.addAdDeadLink(id, publi24AdLinks[index]);
        }
        return;
      }

      const page = pageResult as DocumentFragment | HTMLElement;

      const location: string = adData.getItemLocation(page, true);

      if (location !== currentAdLocation) {
        const pageDate: Date = adData.getPageDate(page);
        const dateDiff: number = dateLib.dayDiff(pageDate, currentAdDate);
        WWStorage.addAdDuplicateInOtherLocation(id, publi24AdLinks[index], dateDiff < 2);
      }
    });
  },

  createInvestigateImgClickHandler(id: string, item: HTMLElement): (this: GlobalEventHandlers, e: MouseEvent) => Promise<void> {
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
  },

  scrollIntoView(element: HTMLDivElement) {
    const panel = element.querySelector<HTMLElement>('[data-wwid="control-panel"]');
    if (panel) {
      panel.scrollIntoView({behavior: 'instant', block: 'start'});
    }
    window.scrollBy({top: IS_MOBILE_VIEW ? -320 : -350, behavior: "instant"});
  }
}
