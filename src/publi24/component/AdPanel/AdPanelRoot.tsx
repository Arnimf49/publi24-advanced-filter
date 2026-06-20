import React, {FC, MouseEventHandler, useCallback, useEffect, useState} from "react";
import {adData} from "../../core/adData";
import {WWStorage} from "../../core/storage";
import {ImageResult, SearchResult, linksFilter} from "../../core/linksFilter";
import {dateLib} from "../../core/dateLib";
import AdPanel from "./AdPanel";
import {adActions} from "../../core/adActions";
import * as ReactDOM from "react-dom";
import HideReasonRoot from "../Common/Partials/HideReason/HideReasonRoot";
import ImageSlider from "./ImagesSlider/ImagesSlider";
import AdsModalRoot from "../Common/Partials/AdsModal/AdsModalRoot";
import {WWMemoryStorage} from "../../core/memoryStorage";
import {inspectorEscorteApi} from "../../core/inspectorEscorteApi";

interface AdPanelRootProps {
  id: string;
  item: HTMLElement;
  renderOptions?: {
    showDuplicates?: boolean;
  };
}

const AdPanelRoot: FC<AdPanelRootProps> = ({ id, item, renderOptions }) => {
  const [renderCycle, setRenderCycle] = useState(0);
  const [{search, images}, setSearches] = useState<{search?: SearchResult[], images?: ImageResult[]}>({});
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
  const [inspectorAdsCount, setInspectorAdsCount] = useState<number | null>(null);

  const itemUrl = adData.getItemUrl(item);
  const phone = WWStorage.getAdPhone(id) || '';

  const filteredSearchLinks = linksFilter.sortLinks(linksFilter.filterLinks(search || [], itemUrl));
  const nimfomaneLink = filteredSearchLinks.reduce<string | undefined>((found, l) => {
    if (found) {
      return found;
    }

    if (!Array.isArray(l)) {
      return l.indexOf('https://nimfomane.com/forum/topic/') === 0 ? l : undefined;
    }

    return l[0].startsWith('nimfomane.com ') ? new URL(l[1], 'https://www.google.com').href : undefined;
  }, undefined);
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

  const imageResultsStatus = linksFilter.getImageResultsStatus(imageSearchDomains, imageInvestigateStale);

  const isInTutorial = WWStorage.isAdTutorial(id);
  const visible = isInTutorial || adData.getItemVisibility(id);
  let hideReason = WWStorage.getPhoneHiddenReason(phone);
  const defaultHideReason = imageSearchDomains?.some(({links}) => links.some(({isSafe}) => !isSafe)) ? 'poze false' : null;
  let automaticHideReason = !!(hideReason && hideReason.match(/^automat:/));

  if (automaticHideReason && hideReason) {
    hideReason = hideReason.replace('automat:', '');
  }

  const localAdsCount = WWStorage.getPhoneAds(phone).length;
  const numberOfAdsWithSamePhone = duplicatesSource === 'inspector-escorte' && inspectorAdsCount !== null
    ? inspectorAdsCount
    : localAdsCount;
  const hasDuplicateAdsWithSamePhone = duplicatesSource === 'inspector-escorte' && inspectorAdsCount !== null
    ? inspectorAdsCount > 1
    : localAdsCount > 1;

  useEffect(() => {
    const image = item.querySelector<HTMLAnchorElement>('.art-img a');
    const articleItem = item.className.indexOf('article-item') !== -1;

    if (image && articleItem) {
      image.addEventListener('click', async (event) => {
        event.stopPropagation();
        event.preventDefault();

        const images = await adData.acquireSliderImages(item);

        setSliderImages(images);
        setShowImagesSlider(true);
      });
    }
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
          setInspectorAdsCount(null);
        }

        const enabled = await inspectorEscorteApi.isEnabledAndAvailable();

        if (!enabled) {
          if (!cancelled) {
            setDuplicatesSource('local');
            setInspectorAdsCount(null);
          }

          return;
        }

        const ads = await inspectorEscorteApi.fetchAds(phone);

        if (!ads || ads.length === 0) {
          if (!cancelled) {
            setDuplicatesSource('local');
            setInspectorAdsCount(null);
          }

          return;
        }

        if (!cancelled) {
          setDuplicatesSource('inspector-escorte');
          setInspectorAdsCount(ads.length);
        }
      } catch (error) {
        console.error('Failed to load inspector escorte duplicates.', error);

        if (!cancelled) {
          setDuplicatesSource('local');
          setInspectorAdsCount(null);
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
        hideReason={hideReason}
        automaticHideReason={automaticHideReason}
        nimfomaneLink={nimfomaneLink}
        ddcLink={ddcLink}
        imageSearchDomains={imageSearchDomains}
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
          {...({ source: duplicatesSource === 'inspector-escorte' ? 'inspector-escorte' : undefined } as any)}
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
