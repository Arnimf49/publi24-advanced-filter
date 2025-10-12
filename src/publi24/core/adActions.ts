import {adData} from "./adData";
import {misc} from "./misc";
import {dateLib} from "./dateLib";
import {IS_AD_PAGE} from "./globals";
import {WWBrowserStorage} from "./browserStorage";
import {AutoHideCriterias, WWStorage} from "./storage";
import {IS_MOBILE_VIEW, IS_SAFARI_IOS} from "../../common/globals";
import {AUTO_HIDE_CRITERIA} from "./hideReasons";
import {utils} from "../../common/utils";

export type AdContentTuple = [string, number | boolean];


async function investigateAdContent(item: Element): Promise<AdContentTuple[]> {
  const pageResult = await adData.loadInAdPage(item);
  if (pageResult instanceof Error) {
    // Or handle error differently if needed, TS requires check
    console.error("Failed to load ad page:", pageResult);
    return [];
  }
  const page = pageResult as DocumentFragment | HTMLElement; // Type assertion after check
  const content: string = misc.removeDiacritics(adData.getPageTitle(page) + ' ' + adData.getPageDescription(page));

  utils.debugLog('Analyzing content', {content: content.trim().substring(0, 200) + '...'});

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

  if (content.match(/(\W|^)(show\s+web|web\s+show|show\s+la\s+web|show\s+erotic\s+web|si\s+webb?)(\W|$)/i)) {
    data.push(['showWeb', true]);
  }
  if (content.match(/(\W|^)(botox|siliconata|silicoane)(\W|$)/i)) {
    data.push(['botox', true]);
  }
  if (content.match(/(\W|^)(party)(\W|$)/i)) {
    data.push(['party', true]);
  }
  if (content.match(/(\W|^)(cu sau fara(?!\s+jucarii)|cum\s+vrei\s+tu|cum\s+te\s+simti\s+mai\s+bine|totale\s+fara[,.;]|cu\s+tot\s+ce\s+vrei)(\W|$)/i)) {
    data.push(['btsRisc', true]);
  }
  if (content.match(/(\W|^)((doa?r|numai|decat)\s+(deplasar|depalsar|deplsar)(i{1,4}|e)|nu am locatie)(\W|$)/i)
    && !content.match(/(\W|^)(la\s+mine|locatie\s+proprie|si\s+deplasar[ie]|si\s+locatie|locatia\s+mea|in\s+locatie|nu\s+fac\s+deplasari)(\W|$)/i)) {
    data.push(['onlyTrips', true]);
  }
  if (content.match(/(\W|^)(ts|trans|transs?exuala?)(\W|$)/i)) {
    data.push(['trans', true]);
  }
  if (content.match(/(\W|^)(matura)(\W|$)/i)) {
    data.push(['mature', true]);
  }

  return data;
}

function applyAutoHiding(phoneNumber: string, id: string, contentData: AdContentTuple[]): void {
  utils.debugLog('applyAutoHiding called', {phoneNumber, id, contentDataKeys: contentData.map(([k]) => k)});

  const criterias: AutoHideCriterias = WWStorage.getAutoHideCriterias();
  const matched: string[] = [];
  const matchedCriteria: any[] = [];

  for (let [criteria, props] of Object.entries(AUTO_HIDE_CRITERIA)) {
    if (!WWStorage.isAutoHideCriteriaEnabled(criteria as keyof AutoHideCriterias)) {
      continue;
    }

    const dataItem = contentData.find(([key]) => key === props.value);
    utils.debugLog(`Checking ${criteria}`, {dataItem, condition: !!dataItem && props.condition(criterias, dataItem[1])});

    if (dataItem && props.condition(criterias, dataItem[1])) {
      matched.push(props.reason(criterias));
      matchedCriteria.push(props);
      utils.debugLog(`Matched criteria: ${criteria}`, props.reason(criterias));
    }
  }

  if (matched.length) {
    utils.debugLog('Auto-hiding ad', {matched, phoneNumber});
    WWStorage.setAdVisibility(id, false);
    WWStorage.setPhoneHidden(phoneNumber, true);
    WWStorage.setPhoneHiddenReason(phoneNumber, 'automat: ' + matched.join(' / '));

    const expirableCriteria = matchedCriteria.find(props => props.expireDays);
    if (expirableCriteria) {
      const resetTimestamp = Date.now() + (expirableCriteria.expireDays * 24 * 60 * 60 * 1000);
      WWStorage.setPhoneHideResetAt(phoneNumber, resetTimestamp);
      utils.debugLog('Set hideResetAt', {phoneNumber, resetTimestamp, expireDays: expirableCriteria.expireDays});
    }
  } else {
    utils.debugLog('No auto-hide criteria matched', {phoneNumber, availableData: contentData});
  }
}

export const adActions = {
  resetExpiredHides(phone: string, id: string): boolean {
    utils.debugLog('checkExpiredHide called', {phone});

    const hideResetAt = WWStorage.getPhoneHideResetAt(phone);
    const hideReason = WWStorage.getPhoneHiddenReason(phone);
    utils.debugLog('Hide reset check', {phone, hideResetAt, hideReason, now: Date.now()});

    if (!hideResetAt) {
      utils.debugLog('No hideResetAt timestamp, hide will not expire', {phone});
      return false;
    }

    if (Date.now() >= hideResetAt) {
      utils.debugLog('Resetting expired hide', {phone, hideResetAt, hideReason});
      WWStorage.setPhoneHidden(phone, false);
      WWStorage.setAdVisibility(id, true);
      return true;
    }

    utils.debugLog('Hide not yet expired', {phone, timeLeft: hideResetAt - Date.now()});
    return false;
  },

  setItemVisible(item: HTMLElement, v: boolean): void {
    const target = item.querySelector<HTMLElement>('.article-txt-wrap, .ww-inset');

    if (target) {
      target.style.opacity = v ? '1' : '0.5';
      target.style.mixBlendMode = v ? 'initial' : 'luminosity';
    }
  },

  adSeen(item: HTMLElement, id: string) {
    const currentSeen = WWStorage.getSeenTime(id);
    const date = adData.getItemDate(item);
    if (date) {
      WWStorage.setSeenTime(id, date.getTime())
    }
    return currentSeen
  },

  async investigateNumberAndSearch(item: HTMLElement, id: string, search: boolean = true): Promise<boolean> {
    let windowRef: Window | null = null;
    if (search) {
      windowRef = window.open();
    }

    const [phoneNumber, contentData] = await Promise.all([
      adData.acquirePhoneNumber(item, id),
      investigateAdContent(item)
    ]);

    contentData
      .filter(([key]) => ['age', 'weight', 'height'].includes(key))
      .forEach(([key, value]: AdContentTuple) =>
        WWStorage.setAdProp(id, key, value))

    if (!phoneNumber) {
      WWStorage.setAnalyzedTime(id, Date.now());
      return false;
    }

    contentData.forEach(([key, value]: AdContentTuple) =>
      WWStorage.setPhoneProp(phoneNumber, key, value))

    if (WWStorage.isPhoneHidden(phoneNumber)) {
      adActions.setItemVisible(item, false);
    } else if (WWStorage.isAutoHideEnabled()) {
      applyAutoHiding(phoneNumber, id, contentData);
    }

    WWStorage.setAnalyzedTime(id, Date.now());

    if (search && windowRef) {
      await WWBrowserStorage.set(`ww:search_started_for`, { wwid: id });
      await WWBrowserStorage.set(`ww:search_results:${id}`, null);

      const urlMatch: RegExpMatchArray | null = adData.getItemUrl(item).match(/\/([^./]+)\.html/);
      const addUrlId: string = urlMatch ? urlMatch[1] : ''; // Handle potential null match
      const encodedSearch: string = encodeURIComponent(`"${phoneNumber}" OR "${addUrlId}"`);
      windowRef.location = `https://www.google.com/search?q=${encodedSearch}`;
      WWStorage.setInvestigatedTime(id, Date.now());


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
        if ((pageResult as any).code === 410 || (pageResult as any).code === 404) {
          WWStorage.addAdDeadLink(id, publi24AdLinks[index]);
        }
        return;
      }

      const page = pageResult as DocumentFragment | HTMLElement;

      const location: string = adData.getItemLocation(page, true);

      if (location !== currentAdLocation && !(location.includes('Sector') && currentAdLocation.includes('Sector'))) {
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

      if (this) (this as HTMLButtonElement).disabled = true;
      WWBrowserStorage.set(`ww:image_results:${id}`, null);

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
  async findVisibleAd () {
    const paginationArrows = document.querySelectorAll<HTMLLinkElement>('.pagination .arrow');
    const nextPageArrow = paginationArrows[paginationArrows.length - 1].querySelector('a') as HTMLElement;
    const isVisible = (ad: HTMLDivElement) =>
      adData.getItemVisibility(ad.getAttribute('data-articleid') as string)
      && getComputedStyle(ad).display !== 'none';

    // @ts-ignore
    const ads: HTMLDivElement[] = [...document.querySelectorAll<HTMLDivElement>('[data-articleid]')];
    const adsOrder = ads.filter((ad) => isVisible(ad));
    const staleAds = ads.filter((ad) => adData.isStaleAnalyze(ad.getAttribute('data-articleid') as string));

    if (!adsOrder.length) {
      nextPageArrow.click();
    } else if (!WWStorage.isNextOnlyVisibleEnabled()) {
      adActions.scrollIntoView(adsOrder[0]);
      WWStorage.setFindNextVisibleAd(false);
    } else {
      let found = false;

      for (const ad of adsOrder) {
        const articleId = ad.getAttribute('data-articleid') as string;

        if (isVisible(ad)) {
          adActions.scrollIntoView(ad);
        } else {
          continue;
        }

        if (!staleAds.includes(ad)) {
          setTimeout(() => adActions.scrollIntoView(ad), 50);
          found = true;
          break;
        }

        const remainedVisible = await new Promise<boolean>((resolve) => {
          const maxChecks = 280; // 10.5s
          let checks = 0;

          const interval = setInterval(() => {
            if (WWStorage.getAnalyzedAt(articleId) || ++checks >= maxChecks) {
              clearInterval(interval);
              resolve(isVisible(ad));
            }
          }, 50);
        });

        if (remainedVisible) {
          found = true;
          adActions.scrollIntoView(ad);
          break;
        }
      }

      if (found) {
        WWStorage.setFindNextVisibleAd(false);
      } else {
        nextPageArrow.click();
      }
    }
  },

  scrollIntoView(element: HTMLDivElement) {
    const panel = element.querySelector<HTMLElement>('[data-wwid="control-panel"]');
    if (panel) {
      panel.scrollIntoView({behavior: 'instant', block: 'start'});
      window.scrollBy({top: IS_MOBILE_VIEW ? -320 : -350, behavior: "instant"});
    } else {
      element.scrollIntoView({behavior: 'instant', block: 'start'});
      window.scrollBy({top: IS_MOBILE_VIEW ? -100 : -130, behavior: "instant"});
    }
  }
}
