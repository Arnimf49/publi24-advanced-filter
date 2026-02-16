import React, {MouseEventHandler, useCallback, useEffect, useState} from 'react';
import GlobalButtons from './GlobalButtons';
import {NimfomaneStorage} from '../../core/storage';
import FavoritesModalRoot from './FavoritesModal/FavoritesModalRoot';

type GlobalButtonsRootProps = {};

const GlobalButtonsRoot: React.FC<GlobalButtonsRootProps> = () => {
  const [isFavsOpen, setFavsOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [favsCount, setFavsCount] = useState<number | null>(null);

  useEffect(() => {
    const onFavsChanged = () => {
      const total = NimfomaneStorage.getFavorites().length;
      setFavsCount(total);
    }
    onFavsChanged();
    NimfomaneStorage.onFavsChanged(onFavsChanged);
    return () => NimfomaneStorage.removeOnFavsChanged(onFavsChanged);
  }, []);

  const onFavsClick: MouseEventHandler = useCallback(() => setFavsOpen(true), []);
  const onMenuClick: MouseEventHandler = useCallback(() => setMenuOpen(prev => !prev), []);
  const onMenuClose = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <GlobalButtons
        favsCount={favsCount}
        onFavsClick={onFavsClick}
        onMenuClick={onMenuClick}
        isMenuOpen={isMenuOpen}
        onMenuClose={onMenuClose}
      />

      {isFavsOpen &&
        <FavoritesModalRoot onClose={() => setFavsOpen(false)}/>}
    </>
  );
};

export default GlobalButtonsRoot;
