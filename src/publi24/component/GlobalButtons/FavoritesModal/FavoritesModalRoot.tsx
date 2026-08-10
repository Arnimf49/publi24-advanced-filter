import React, { useState, useEffect, useCallback } from 'react';
import GlobalLoader from '../../Common/GlobalLoader/GlobalLoader';
import FavoritesModal from './FavoritesModal';
import { WWStorage } from '../../../core/storage';
import {adData, FavoritesData} from "../../../core/adData";
import type {AdData} from "../../../core/adData";
import {modalState} from "../../../../common/modalState";
import {misc} from "../../../core/misc";
import AdsList from "../../Common/Partials/AdList/AdsList";
import PhoneAndTagsRoot from "../../Common/Partials/PhoneAndTags/PhoneAndTagsRoot";
import {renderer} from "../../../core/renderer";
import {IS_MOBILE_VIEW} from "../../../../common/globals";
import {Ad} from "./Ad";

type FavoritesModalRootProps = {
  onClose: () => void;
};

const registerAds = (context: HTMLElement, showDuplicates: boolean) => {
  renderer.registerAdsInContext(context, {renderOptions: {showDuplicates}});
};

const FavoritesModalRoot: React.FC<FavoritesModalRootProps> = ({ onClose }) => {
  const [favoritesData, setFavoritesData] = useState<FavoritesData | null>(null);

  const fetchData = useCallback(async (loading: boolean = true) => {
    if (loading) {
      setFavoritesData(null);
    }
    const data = await adData.loadFavoritesData();
    setFavoritesData(data);
  }, []);

  useEffect(() => {
    fetchData();
    const onFavsChange = () => fetchData(false);
    WWStorage.onFavsChanged(onFavsChange);
    return () => WWStorage.removeOnFavsChanged(onFavsChange);
  }, [fetchData]);

  const cleanUpUrl = () => {
    modalState.revertOpen();
  };
  useEffect(() => {
    modalState.pushOpen('favorites');
  }, []);

  const handleClearFavorites = useCallback(() => {
    WWStorage.clearFavorites();
    onClose();
  }, [onClose]);

  const handleRemoveNoAd = useCallback((phone: string) => {
    WWStorage.toggleFavorite(phone);
    setFavoritesData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        noAds: prevData.noAds.filter(p => p !== phone),
      };
    });
  }, []);

  const renderAds = useCallback((ads: AdData[]) => (
    <AdsList
      adsData={ads}
      showDuplicates={true}
      isMobile={IS_MOBILE_VIEW}
      onRegister={registerAds}
    />
  ), []);

  if (favoritesData === null) {
    return <GlobalLoader message={'La 15+ de favorite durează mai mult să încarce favoritele, din cauza limitarilor de la Publi24.'} />;
  }

  return (
    <FavoritesModal
      onClose={onClose}
      onClearFavorites={handleClearFavorites}
      onRemoveNoAd={handleRemoveNoAd}
      inLocationAds={favoritesData.inLocation}
      notInLocationAds={favoritesData.notInLocation}
      noAdsItems={favoritesData.noAds}
      onCleanup={cleanUpUrl}
      isDark={misc.getPubliTheme() === 'dark'}
      topContent={<Ad />}
      renderAds={renderAds}
      renderNoAd={(phone) => <PhoneAndTagsRoot phone={phone} noPadding={true} />}
    />
  );
};

export default FavoritesModalRoot;
