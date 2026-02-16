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
    setFavorites(favUsers);
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
