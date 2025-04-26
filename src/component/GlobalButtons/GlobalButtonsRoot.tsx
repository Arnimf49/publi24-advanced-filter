import React, {MouseEventHandler, useCallback, useEffect, useState} from 'react';
import GlobalButtons from "./GlobalButtons";
import {WWStorage} from "../../core/storage";
import FavoritesModalRoot from "./FavoritesModal/FavoritesModalRoot";
import PhoneSearchModalRoot from "./PhoneSearchModal/PhoneSearchModalRoot";
import SettingsModalRoot from "./SettingsModal/SettingsModalRoot";

type GlobalButtonsRootProps = {
};

const GlobalButtonsRoot: React.FC<GlobalButtonsRootProps> = ({
}) => {
  const [isFavsOpen, setFavsOpen] = useState(false);
  const [isPhoneSearchOpen, setPhoneSearchOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [savesCount, setSavesCount] = useState<number>(0);

  useEffect(() => {
    const onFavsChanged = () => setSavesCount(WWStorage.getFavorites().length);
    onFavsChanged();
    WWStorage.onFavsChanged(onFavsChanged);
    return () => WWStorage.removeOnFavsChanged(onFavsChanged);
  }, []);

  const onFavsClick: MouseEventHandler = useCallback(() => setFavsOpen(true), []);
  const onSearchClick: MouseEventHandler = useCallback(() => setPhoneSearchOpen(true), []);
  const onSettingsClick: MouseEventHandler = useCallback(() => setSettingsOpen(true), []);

  return (
    <>
      <GlobalButtons
        favsCount={savesCount}
        onFavsClick={onFavsClick}
        onSearchClick={onSearchClick}
        onSettingsClick={onSettingsClick}
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
