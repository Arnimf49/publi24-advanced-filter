import React, { useState, useEffect, useCallback } from 'react';
import GlobalLoader from '../../Common/GlobalLoader/GlobalLoader';
import FavoritesModal from './FavoritesModal';
import { WWStorage } from '../../../core/storage';
import {adData, FavoritesData} from "../../../core/adData";

type FavoritesModalRootProps = {
  onClose: () => void;
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

  if (favoritesData === null) {
    return <GlobalLoader message={'La 20+ de favorite durează mai mult să încarce favoritele, din cauza limitarilor de la Publi24.'} />;
  }

  return (
    <FavoritesModal
      onClose={onClose}
      onClearFavorites={handleClearFavorites}
      onRemoveNoAd={handleRemoveNoAd}
      inLocationAds={favoritesData.inLocation}
      notInLocationAds={favoritesData.notInLocation}
      noAdsItems={favoritesData.noAds}
    />
  );
};

export default FavoritesModalRoot;
