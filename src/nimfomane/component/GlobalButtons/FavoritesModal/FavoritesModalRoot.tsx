import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FavoritesModal from './FavoritesModal';
import { NimfomaneStorage } from '../../../core/storage';
import { favoritesAnalyzer } from '../../../core/favoritesAnalyzer';
import { sectionsService } from '../../../core/sectionsService';
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

  const currentCity = useMemo(() => sectionsService.getCurrentCity(), []);

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

  const citySections = useMemo(() => {
    const sections = new Map<string, string[]>();

    activeFavorites.forEach((user) => {
      const escort = NimfomaneStorage.getEscort(user);
      const city = escort.profileStats?.currentCity?.name || 'Locație necunoscută';
      const escorts = sections.get(city) || [];
      escorts.push(user);
      sections.set(city, escorts);
    });

    return Array.from(sections, ([city, escorts]) => ({city, escorts}))
      .sort((a, b) => Number(b.city === currentCity) - Number(a.city === currentCity));
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
      citySections={citySections}
      inactiveEscorts={inactiveEscorts}
      renderEscort={(user, index) => <EscortCardRoot user={user} index={index} />}
    />
  );
};

export default FavoritesModalRoot;
