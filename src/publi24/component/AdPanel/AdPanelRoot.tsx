import React, {FC, MouseEventHandler, useCallback, useEffect, useState} from "react";
import {adData} from "../../core/adData";
import {WWStorage} from "../../core/storage";
import {linksFilter} from "../../core/linksFilter";
import {dateLib} from "../../core/dateLib";
import AdPanel from "./AdPanel";
import {adActions} from "../../core/adActions";
import * as ReactDOM from "react-dom";
import HideReasonRoot from "../Common/Partials/HideReason/HideReasonRoot";
import ImageSlider from "./ImagesSlider/ImagesSlider";
import AdsModalRoot from "../Common/Partials/AdsModal/AdsModalRoot";

interface AdPanelRootProps {
  id: string;
  item: HTMLElement;
  renderOptions?: {
    showDuplicates?: boolean;
  };
}

const AdPanelRoot: FC<AdPanelRootProps> = ({ id, item, renderOptions }) => {
  const [renderCycle, setRenderCycle] = useState(0);
  const [{search, images}, setSearches] = useState<{search?: string[], images?: []}>({});
  const [showHideReason, setShowHideReason] = useState(false);
  const [showImagesSlider, setShowImagesSlider] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [sliderImages, setSliderImages] = useState<string[]>([]);

  const itemUrl = adData.getItemUrl(item);
  const phone = WWStorage.getAdPhone(id) || '';

  const filteredSearchLinks = linksFilter.sortLinks(linksFilter.filterLinks(search || [], itemUrl));
  const nimfomaneLink = filteredSearchLinks.find(l => l.indexOf('https://nimfomane.com/forum/topic/') === 0);
  const ddcLink = filteredSearchLinks.find(l => l.indexOf('https://ddcforum.com/index.php?/forums/topic/') === 0);
  const imageSearchDomains = images ? linksFilter.processImageLinks(id, images, itemUrl) : undefined;

  const phoneTime = WWStorage.getInvestigatedTime(id);
  const imageTime = WWStorage.getAdImagesInvestigatedTime(id);
  const {daysString: phoneInvestigatedSinceDays, stale: phoneInvestigateStale} = dateLib.calculateTimeSince(phoneTime);
  const {daysString: imageInvestigatedSinceDays, stale: imageInvestigateStale} = dateLib.calculateTimeSince(imageTime);

  const imageResultsStatus = linksFilter.getImageResultsStatus(imageSearchDomains, imageInvestigateStale);

  const visible = adData.getItemVisibility(id);
  let hideReason = WWStorage.getPhoneHiddenReason(phone);
  const defaultHideReason = imageSearchDomains?.some(({links}) => links.some(({isSafe}) => !isSafe)) ? 'poze false' : null;
  let automaticHideReason = !!(hideReason && hideReason.match(/^automat:/));
  if (automaticHideReason && hideReason) {
    hideReason = hideReason.replace('automat:', '');
  }

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
    adActions.setItemVisible(item, adData.getItemVisibility(id));
    WWStorage.getAdSearchResults(id).then(setSearches);
  }, [renderCycle]);

  useEffect(() => {
    const incrementRender = () => setRenderCycle(v => ++v);

    WWStorage.onAdChanged(id, incrementRender);
    WWStorage.onPhoneChanged(phone, incrementRender);

    return () => {
      WWStorage.removeOnAdChanged(id, incrementRender);
      WWStorage.removeOnPhoneChanged(phone, incrementRender);
    }
  }, [phone]);

  const onVisibilityClick: MouseEventHandler = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    let newVisible = !visible;
    (e.target as HTMLButtonElement).disabled = true;

    let phoneNumber = WWStorage.getAdPhone(id);
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

  const onInvestigateImgClick: MouseEventHandler = useCallback(adActions.createInvestigateImgClickHandler(id, item) as any, [])

  const onFavClick: MouseEventHandler = useCallback(() => {
    WWStorage.toggleFavorite(phone);
    setRenderCycle((r) => ++r);
  }, [phone]);

  const onHideReasonCancel = useCallback(() => {
    WWStorage.setPhoneHidden(phone, false);
    WWStorage.setAdVisibility(id, true);
    setShowHideReason(false);
  }, [phone]);

  const onViewDuplicatesClick = useCallback(() => {
    setShowDuplicates(true);
  }, []);

  return (
    <div>
      <AdPanel
        adId={id}
        phone={phone}
        hasNoPhone={WWStorage.hasAdNoPhone(id)}
        numberOfAdsWithSamePhone={WWStorage.getPhoneAds(phone).length}
        visible={visible}
        dueToPhoneHidden={adData.isDueToPhoneHidden(id)}
        isFav={WWStorage.isFavorite(phone)}
        showDuplicates={renderOptions?.showDuplicates ?? true}
        hasDuplicateAdsWithSamePhone={WWStorage.getPhoneAds(phone).length > 1}
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
          phone={phone}
          close={() => setShowDuplicates(false)}
        />}

      {showHideReason && ReactDOM.createPortal(
        <HideReasonRoot
          phone={phone}
          selectedReason={defaultHideReason}
          onCancel={onHideReasonCancel}
        />,
        item.querySelector('[data-wwid="hide-reason-container"]') as HTMLElement,
      )}
    </div>
  );
}

export default AdPanelRoot;
