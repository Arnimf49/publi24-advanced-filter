import React, {FC, MouseEventHandler, useCallback, useEffect, useState} from "react";
import {adData} from "../../core/adData";
import {WWStorage} from "../../core/storage";
import {ImageResult, ImageSearchError, SearchResult, linksFilter} from "../../core/linksFilter";
import {dateLib} from "../../core/dateLib";
import AdPanel from "./AdPanel";
import {adActions} from "../../core/adActions";
import * as ReactDOM from "react-dom";
import HideReasonRoot from "../Common/Partials/HideReason/HideReasonRoot";
import ImageSlider from "./ImagesSlider/ImagesSlider";
import AdsModalRoot from "../Common/Partials/AdsModal/AdsModalRoot";
import {WWMemoryStorage} from "../../core/memoryStorage";
import {inspectorEscorteApi, InspectorAd} from "../../core/inspectorEscorteApi";
import PhoneAndTagsRoot from "../Common/Partials/PhoneAndTags/PhoneAndTagsRoot";
import {misc} from "../../core/misc";

interface AdPanelRootProps {
  id: string;
  item: HTMLElement;
  renderOptions?: {
    showDuplicates?: boolean;
  };
}

const IMAGE_RESULTS_FRESHNESS_DAYS = 10;

function getImageCount(item: Element, hasImages: boolean): number {
  const countText = item.querySelector<HTMLElement>('.article-img-count-number')?.textContent;
  const count = countText ? Number.parseInt(countText, 10) : 0;

  if (Number.isFinite(count) && count > 0) {
    return count;
  }

  const detailCountText = item.querySelector<HTMLElement>('.detailViewCountImages')?.textContent;
  const detailCount = detailCountText?.match(/\b\d+\s*\/\s*(\d+)\b/);

  if (detailCount) {
    return Number.parseInt(detailCount[1], 10);
  }

  const associatedMediaCount = item.querySelectorAll('[itemprop="associatedMedia"] li').length;
  return associatedMediaCount > 0 ? associatedMediaCount : (hasImages ? 1 : 0);
}

const AdPanelRoot: FC<AdPanelRootProps> = ({ id, item, renderOptions }) => {
  const [renderCycle, setRenderCycle] = useState(0);
  const [{search, images, imageSearchErrors}, setSearches] = useState<{
    search?: SearchResult[];
    images?: ImageResult[];
    imageSearchErrors?: ImageSearchError[];
  }>({});
  const [showHideReason, setShowHideReason] = useState(false);
  const [showImagesSlider, setShowImagesSlider] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [memoryState, setMemoryState] = useState(WWMemoryStorage.getAdState(id));
  const [phoneSearchJustCompleted, setPhoneSearchJustCompleted] = useState(false);
  const [imageSearchJustCompleted, setImageSearchJustCompleted] = useState(false);
  const [prevPhoneTime, setPrevPhoneTime] = useState<number | null | 'unset'>('unset');
  const [prevImageTime, setPrevImageTime] = useState<number | null | 'unset'>('unset');
  const [duplicatesSource, setDuplicatesSource] = useState<'inspector-escorte' | 'local'>('local');
  const [inspectorAds, setInspectorAds] = useState<InspectorAd[]>([]);

  const itemUrl = adData.getItemUrl(item);
  const phone = WWStorage.getAdPhone(id) || '';
  const hasImages = !!item.querySelector(
    '.article-img-count, [itemprop="image"], .detailViewImg, [itemprop="associatedMedia"] li',
  );
  const imageCount = getImageCount(item, hasImages);

  const filteredSearchLinks = linksFilter.sortLinks(linksFilter.filterLinks(search || [], itemUrl));
  const nimfomaneLink = filteredSearchLinks
    .find((link) => linksFilter.isNimfomaneTopic(link));
  const nimfomaneHref = nimfomaneLink && Array.isArray(nimfomaneLink)
    ? new URL(nimfomaneLink[1], 'https://www.google.com').href
    : nimfomaneLink;
  const ddcLink = filteredSearchLinks.reduce<string | undefined>((found, l) => {
    if (found) {
      return found;
    }

    if (!Array.isArray(l)) {
      return l.indexOf('https://ddcforum.com/index.php?/forums/topic/') === 0 ? l : undefined;
    }

    return l[0].startsWith('ddcforum.com ') ? new URL(l[1], 'https://www.google.com').href : undefined;
  }, undefined);
  const imageSearchDomains = images ? linksFilter.processImageLinks(id, images, itemUrl) : undefined;

  const phoneTime = WWStorage.getInvestigatedTime(id);
  const imageTime = WWStorage.getAdImagesInvestigatedTime(id);
  const {daysString: phoneInvestigatedSinceDays, stale: phoneInvestigateStale} = dateLib.calculateTimeSince(phoneTime);
  const {daysString: imageInvestigatedSinceDays, stale: imageInvestigateStale} = dateLib.calculateTimeSince(imageTime);
  const imageResultsAreFresh = imageTime !== undefined
    && Date.now() - imageTime <= IMAGE_RESULTS_FRESHNESS_DAYS * 24 * 60 * 60 * 1000;
  const allImageSearchesFailed = imageResultsAreFresh
    && imageCount > 0
    && imageSearchErrors?.length === imageCount;

  const imageResultsStatus = linksFilter.getImageResultsStatus(imageSearchDomains, imageInvestigateStale);

  const isInTutorial = WWStorage.isAdTutorial(id);
  const visible = isInTutorial || adData.getItemVisibility(id);
  let hideReason = WWStorage.getPhoneHiddenReason(phone);
  const defaultHideReason = imageSearchDomains?.some(({links}) => links.some(({isSafe}) => !isSafe)) ? 'poze false' : null;
  let automaticHideReason = !!(hideReason && hideReason.match(/^automat:/));

  if (automaticHideReason && hideReason) {
    hideReason = hideReason.replace('automat:', '');
  }

  const localAds = WWStorage.getPhoneAds(phone);
  const mergedDuplicateSources = inspectorEscorteApi.mergeDuplicateSources(inspectorAds, localAds);
  const numberOfAdsWithSamePhone = duplicatesSource === 'inspector-escorte'
    ? mergedDuplicateSources.inspectorAds.length + mergedDuplicateSources.localOnlyAds.length
    : localAds.length;
  const hasDuplicateAdsWithSamePhone = numberOfAdsWithSamePhone > 1;

  useEffect(() => {
    const image = item.querySelector<HTMLAnchorElement>('.art-img a');
    const articleItem = item.className.indexOf('article-item') !== -1;

    if (!image || !articleItem) {
      return;
    }

    const onImageClick = async (event: MouseEvent): Promise<void> => {
      event.stopPropagation();
      event.preventDefault();

      if (!hasImages) {
        return;
      }

      const images = await adData.acquireSliderImages(item);

      setSliderImages(images);
      setShowImagesSlider(true);
    };

    image.addEventListener('click', onImageClick);

    return () => {
      image.removeEventListener('click', onImageClick);
    };
  }, []);

  useEffect(() => {
    adActions.setItemVisible(item, isInTutorial || adData.getItemVisibility(id));
    WWStorage.getAdSearchResults(id).then(setSearches);
  }, [renderCycle]);

  useEffect(() => {
    const incrementRender = () => setRenderCycle(v => ++v);

    WWStorage.onAdChanged(id, incrementRender);
    WWStorage.onPhoneChanged(phone, incrementRender);

    return () => {
      WWStorage.removeOnAdChanged(id, incrementRender);
      WWStorage.removeOnPhoneChanged(phone, incrementRender);
    };
  }, [phone]);

  useEffect(() => {
    const updateMemoryState = () => setMemoryState({...WWMemoryStorage.getAdState(id)});
    WWMemoryStorage.onAdMemoryChanged(id, updateMemoryState);

    return () => {
      WWMemoryStorage.removeOnAdMemoryChanged(id, updateMemoryState);
    };
  }, [id]);

  useEffect(() => {
    if (phoneTime !== prevPhoneTime) {
      setPrevPhoneTime(phoneTime || null);
    }

    if (phoneTime !== prevPhoneTime && prevPhoneTime !== 'unset') {
      setPhoneSearchJustCompleted(true);
      setTimeout(() => setPhoneSearchJustCompleted(false), 4000);
    }
  }, [phoneTime]);

  useEffect(() => {
    if (imageTime !== prevImageTime) {
      setPrevImageTime(imageTime || null);
    }

    if (imageTime !== prevImageTime && prevImageTime !== 'unset') {
      setImageSearchJustCompleted(true);
      setTimeout(() => setImageSearchJustCompleted(false), 4000);
    }
  }, [imageTime]);

  useEffect(() => {
    if (!phone) {
      return;
    }

    let cancelled = false;

    const syncInspectorDuplicates = async () => {
      try {
        if (!cancelled) {
          setDuplicatesSource('local');
          setInspectorAds([]);
        }

        const enabled = await inspectorEscorteApi.isEnabledAndAvailable();

        if (!enabled) {
          if (!cancelled) {
            setDuplicatesSource('local');
            setInspectorAds([]);
          }

          return;
        }

        const ads = await inspectorEscorteApi.fetchAds(phone);

        if (!ads || ads.length === 0) {
          if (!cancelled) {
            setDuplicatesSource('local');
            setInspectorAds([]);
          }

          return;
        }

        if (!cancelled) {
          setDuplicatesSource('inspector-escorte');
          setInspectorAds(ads);
        }
      } catch (error) {
        console.error('Failed to load inspector escorte duplicates.', error);

        if (!cancelled) {
          setDuplicatesSource('local');
          setInspectorAds([]);
        }
      }
    };

    syncInspectorDuplicates();

    return () => {
      cancelled = true;
    };
  }, [phone]);

  const onVisibilityClick: MouseEventHandler = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const newVisible = !visible;
    (e.target as HTMLButtonElement).disabled = true;

    const phoneNumber = WWStorage.getAdPhone(id);

    if (phoneNumber) {
      WWStorage.setPhoneHidden(phoneNumber, !newVisible);
    }

    adActions.setItemVisible(item, newVisible);
    WWStorage.setAdVisibility(id, newVisible);
    (e.target as HTMLButtonElement).disabled = false;

    if (!newVisible && phoneNumber) {
      setShowHideReason(true);
    }
  }, [visible]);

  const onInvestigateClick: MouseEventHandler = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    (e.target as HTMLButtonElement).disabled = true;
    await adActions.investigateNumberAndSearch(item, id);
    (e.target as HTMLButtonElement).disabled = false;
  }, []);

  const onInvestigateImgClick: MouseEventHandler = useCallback(adActions.createInvestigateImgClickHandler(id, item) as any, []);

  const onFavClick: MouseEventHandler = useCallback(() => {
    WWStorage.toggleFavorite(phone);
    setRenderCycle((r) => ++r);
  }, [phone]);

  const onHideReasonCancel = useCallback(() => {
    WWStorage.setPhoneHidden(phone, false);
    WWStorage.setAdVisibility(id, true);
    setShowHideReason(false);
  }, [phone]);

  const onHideReasonClose = useCallback(() => {
    setShowHideReason(false);
  }, []);

  const onViewDuplicatesClick = useCallback(() => {
    setShowDuplicates(true);
  }, []);

  const errors = [
    memoryState.contentAnalyzeError,
    memoryState.phoneSearchError,
    memoryState.imageSearchError,
  ].filter((e): e is string => !!e);

  return (
    <div>
      <AdPanel
        {...({ duplicatesSource } as any)}
        adId={id}
        phone={phone}
        hasNoPhone={WWStorage.hasAdNoPhone(id)}
        numberOfAdsWithSamePhone={numberOfAdsWithSamePhone}
        visible={visible}
        dueToPhoneHidden={adData.isDueToPhoneHidden(id)}
        isFav={WWStorage.isFavorite(phone)}
        showDuplicates={renderOptions?.showDuplicates ?? true}
        hasDuplicateAdsWithSamePhone={hasDuplicateAdsWithSamePhone}
        hasImagesInOtherLocation={WWStorage.hasAdDuplicatesInOtherLocation(id)}
        hasImages={hasImages}
        hideReason={hideReason}
        automaticHideReason={automaticHideReason}
        nimfomaneLink={nimfomaneHref}
        ddcLink={ddcLink}
        imageSearchDomains={imageSearchDomains}
        imageSearchErrorCount={imageSearchErrors?.length ?? 0}
        allImageSearchesFailed={allImageSearchesFailed}
        imageResultsStatus={imageResultsStatus}
        searchLinks={search}
        filteredSearchLinks={filteredSearchLinks}
        phoneInvestigatedSinceDays={phoneInvestigatedSinceDays}
        phoneInvestigateStale={phoneInvestigateStale}
        imageInvestigatedSinceDays={imageInvestigatedSinceDays}
        imageInvestigateStale={imageInvestigateStale}
        phoneSearchJustCompleted={phoneSearchJustCompleted}
        imageSearchJustCompleted={imageSearchJustCompleted}
        analyzeImagesLoading={memoryState.analyzeImagesLoading}
        isPhoneSearchLoading={memoryState.isPhoneSearchLoading}
        isImageSearchLoading={memoryState.isImageSearchLoading}
        errors={errors}
        isDark={misc.getPubliTheme() === 'dark'}
        renderPhoneAndTags={(adId, phone, children) => (
          <PhoneAndTagsRoot adId={adId} phone={phone}>
            {children}
          </PhoneAndTagsRoot>
        )}
        onVisibilityClick={onVisibilityClick}
        onFavClick={onFavClick}
        onInvestigateClick={onInvestigateClick}
        onInvestigateImgClick={onInvestigateImgClick}
        onViewDuplicatesClick={onViewDuplicatesClick}
      />

      {showImagesSlider
        && <ImageSlider
          images={sliderImages}
          visible={visible}
          close={() => setShowImagesSlider(false)}
          onVisibilityClick={onVisibilityClick}
          onInvestigateImgClick={onInvestigateImgClick}
        />}

      {showDuplicates
        && <AdsModalRoot
          source={duplicatesSource === 'inspector-escorte' ? 'inspector-escorte' : undefined}
          inspectorAds={inspectorAds}
          phone={phone}
          close={() => setShowDuplicates(false)}
        />}

      {showHideReason && ReactDOM.createPortal(
        <HideReasonRoot
          phone={phone}
          selectedReason={defaultHideReason}
          onCancel={onHideReasonCancel}
          onClose={onHideReasonClose}
        />,
        item.querySelector('[data-wwid="hide-reason-container"]') as HTMLElement,
      )}
    </div>
  );
};

export default AdPanelRoot;
