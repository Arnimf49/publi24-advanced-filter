import React, {MouseEventHandler, useCallback, useEffect, useState} from 'react';
import GlobalButtons from "./GlobalButtons";
import {WWStorage} from "../../core/storage";
import FavoritesModalRoot from "./FavoritesModal/FavoritesModalRoot";
import PhoneSearchModalRoot from "./PhoneSearchModal/PhoneSearchModalRoot";
import SettingsModalRoot from "./SettingsModal/SettingsModalRoot";
import {modalState} from "../../../common/modalState";

type GlobalButtonsRootProps = {
};

const GlobalButtonsRoot: React.FC<GlobalButtonsRootProps> = ({
}) => {
  const [isFavsOpen, setFavsOpen] = useState(false);
  const [isPhoneSearchOpen, setPhoneSearchOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [favsCount, setFavsCount] = useState<number | null>(null);
  const [favsWithNoAdsCount, setFavsWithNoAdsCount] = useState<number | null>(null);

  useEffect(() => {
    const onFavsChanged = () => {
      const total = WWStorage.getFavorites().length;
      const noAds = WWStorage.getFavorites().filter(p => !WWStorage.getPhoneAds(p).length).length;
      setFavsCount(total - noAds);
      setFavsWithNoAdsCount(noAds);
    }
    onFavsChanged();
    WWStorage.onFavsChanged(onFavsChanged);
    return () => WWStorage.removeOnFavsChanged(onFavsChanged);
  }, []);

  useEffect(() => {
    if (modalState.consumeOpenIfType('favorites')) {
      setFavsOpen(true);
    }
  }, []);

  const onFavsClick: MouseEventHandler = useCallback(() => setFavsOpen(true), []);
  const onSearchClick: MouseEventHandler = useCallback(() => setPhoneSearchOpen(true), []);
  const onSettingsClick: MouseEventHandler = useCallback(() => setSettingsOpen(true), []);
  const onMenuClick: MouseEventHandler = useCallback(() => setMenuOpen(prev => !prev), []);
  const onMenuClose = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <GlobalButtons
        favsCount={favsCount}
        favsWithNoAdsCount={favsWithNoAdsCount}
        onFavsClick={onFavsClick}
        onSearchClick={onSearchClick}
        onSettingsClick={onSettingsClick}
        onMenuClick={onMenuClick}
        isMenuOpen={isMenuOpen}
        onMenuClose={onMenuClose}
      />

      {isFavsOpen &&
        <FavoritesModalRoot onClose={() => setFavsOpen(false)}/>}
      {isPhoneSearchOpen &&
        <PhoneSearchModalRoot onClose={() => setPhoneSearchOpen(false)}/>}
      {isSettingsOpen &&
        <SettingsModalRoot onClose={() => setSettingsOpen(false)}/>}
    </>
  );
};

export default GlobalButtonsRoot;
