import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FavoritesModal from './FavoritesModal';
import { NimfomaneStorage } from '../../../core/storage';
import { favoritesAnalyzer } from '../../../core/favoritesAnalyzer';
import { cityService } from '../../../core/cityService';
import { profileActions } from '../../../core/profileActions';
import EscortCardRoot from './EscortCardRoot';

const INACTIVE_AFTER_MS = 14 * 24 * 60 * 60 * 1000;

type FavoritesModalRootProps = {
  onClose: () => void;
};

const FavoritesModalRoot: React.FC<FavoritesModalRootProps> = ({ onClose }) => {
  const [favorites, setFavorites] = useState<string[]>(() => NimfomaneStorage.getFavorites());
  const [escortVersion, setEscortVersion] = useState(0);

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

    const favUsers = NimfomaneStorage.getFavorites();
    favUsers.forEach(user => {
      const escort = NimfomaneStorage.getEscort(user);
      if (
        profileActions.hasNeverLoadedProfileStats(user) ||
        profileActions.isProfileStatsStale(user) ||
        escort.profileNotFound === undefined
      ) {
        const profileUrl = escort.profileLink || `https://www.nimfomane.com/forum/profile/${encodeURIComponent(user)}/`;
        profileActions.loadProfileStats(user, profileUrl).catch(console.error);
      }
    });

    const onFavsChange = () => fetchData();
    NimfomaneStorage.onFavsChanged(onFavsChange);
    return () => NimfomaneStorage.removeOnFavsChanged(onFavsChange);
  }, [fetchData]);

  useEffect(() => {
    const increment = () => setEscortVersion(v => v + 1);
    favorites.forEach(user => NimfomaneStorage.onEscortChanged(user, increment));
    return () => favorites.forEach(user => NimfomaneStorage.removeOnEscortChanged(user, increment));
  }, [favorites]);

  const currentCity = useMemo(() => cityService.getCurrentCity(), []);

  const { activeFavorites, inactiveEscorts } = useMemo(() => {
    const active: string[] = [];
    const inactive: string[] = [];

    favorites.forEach((user) => {
      const escort = NimfomaneStorage.getEscort(user);
      const lastVisited = escort.profileStats?.lastVisited;
      const isInactiveByDate = escort.isUnverified === true && lastVisited
        ? Date.now() - new Date(lastVisited).getTime() >= INACTIVE_AFTER_MS
        : false;

      if (escort.profileNotFound || isInactiveByDate) {
        inactive.push(user);
      } else {
        active.push(user);
      }
    });

    return {activeFavorites: active, inactiveEscorts: inactive};
  }, [favorites, escortVersion]);

  const { inLocationEscorts, otherLocationEscorts } = useMemo(() => {
    if (!currentCity) {
      return { inLocationEscorts: activeFavorites, otherLocationEscorts: [] };
    }

    const inLocation: string[] = [];
    const otherLocation: string[] = [];

    activeFavorites.forEach((user) => {
      const escort = NimfomaneStorage.getEscort(user);
      const escortCity = escort.profileStats?.currentCity?.name;

      if (escortCity === currentCity) {
        inLocation.push(user);
      } else {
        otherLocation.push(user);
      }
    });

    return { inLocationEscorts: inLocation, otherLocationEscorts: otherLocation };
  }, [activeFavorites, currentCity, escortVersion]);

  const handleClearFavorites = useCallback(() => {
    NimfomaneStorage.clearFavorites();
    onClose();
  }, [onClose]);

  return (
    <FavoritesModal
      onClose={onClose}
      onClearFavorites={handleClearFavorites}
      favorites={favorites}
      inLocationEscorts={inLocationEscorts}
      otherLocationEscorts={otherLocationEscorts}
      inactiveEscorts={inactiveEscorts}
      currentCity={currentCity}
       renderEscort={(user, index) => <EscortCardRoot user={user} index={index} />}
    />
  );
};

export default FavoritesModalRoot;
