import React, { useState, useEffect, useCallback } from 'react';
import FavoritesModal from './FavoritesModal';
import { NimfomaneStorage } from '../../../core/storage';
import { favoritesAnalyzer } from '../../../core/favoritesAnalyzer';

type FavoritesModalRootProps = {
  onClose: () => void;
};

const FavoritesModalRoot: React.FC<FavoritesModalRootProps> = ({ onClose }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchData = useCallback(() => {
    const favUsers = NimfomaneStorage.getFavorites();
    const sortedFavs = [...favUsers].sort((a, b) => {
      const escortA = NimfomaneStorage.getEscort(a);
      const escortB = NimfomaneStorage.getEscort(b);
      const dateA = escortA.profileStats?.lastVisited;
      const dateB = escortB.profileStats?.lastVisited;
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    setFavorites(sortedFavs);
  }, []);

  useEffect(() => {
    fetchData();
    favoritesAnalyzer.analyze().catch(console.error);
    const onFavsChange = () => fetchData();
    NimfomaneStorage.onFavsChanged(onFavsChange);
    return () => NimfomaneStorage.removeOnFavsChanged(onFavsChange);
  }, [fetchData]);

  const handleClearFavorites = useCallback(() => {
    NimfomaneStorage.clearFavorites();
    onClose();
  }, [onClose]);

  return (
    <FavoritesModal
      onClose={onClose}
      onClearFavorites={handleClearFavorites}
      favorites={favorites}
    />
  );
};

export default FavoritesModalRoot;
