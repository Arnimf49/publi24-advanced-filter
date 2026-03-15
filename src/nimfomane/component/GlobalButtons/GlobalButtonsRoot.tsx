import React, {MouseEventHandler, useCallback, useEffect, useState} from 'react';
import GlobalButtons from './GlobalButtons';
import {NimfomaneStorage} from '../../core/storage';
import FavoritesModalRoot from './FavoritesModal/FavoritesModalRoot';
import VersionHistoryModal from './VersionHistoryModal/VersionHistoryModal';
import {versionHistory} from '../../data/versionHistory';

type GlobalButtonsRootProps = {};

const GlobalButtonsRoot: React.FC<GlobalButtonsRootProps> = () => {
  const [isFavsOpen, setFavsOpen] = useState(false);
  const [isVersionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [favsCount, setFavsCount] = useState<number | null>(null);
  const [hasNewVersion, setHasNewVersion] = useState(false);

  useEffect(() => {
    const onFavsChanged = () => {
      const total = NimfomaneStorage.getFavorites().length;
      setFavsCount(total);
    }
    onFavsChanged();
    NimfomaneStorage.onFavsChanged(onFavsChanged);
    return () => NimfomaneStorage.removeOnFavsChanged(onFavsChanged);
  }, []);

  useEffect(() => {
    const currentVersion = versionHistory[0]?.version;
    const seenVersion = NimfomaneStorage.getVersionSeen();

    if (!seenVersion) {
      NimfomaneStorage.setVersionSeen(currentVersion);
      setHasNewVersion(false);
    } else if (seenVersion !== currentVersion) {
      setHasNewVersion(true);
    }
  }, []);

  const onFavsClick: MouseEventHandler = useCallback(() => setFavsOpen(true), []);
  const onVersionHistoryClick: MouseEventHandler = useCallback(() => {
    setVersionHistoryOpen(true);
    const currentVersion = versionHistory[0]?.version;
    NimfomaneStorage.setVersionSeen(currentVersion);
    setHasNewVersion(false);
  }, []);
  const onMenuClick: MouseEventHandler = useCallback(() => setMenuOpen(prev => !prev), []);
  const onMenuClose = useCallback(() => setMenuOpen(false), []);
  const currentVersion = versionHistory[0]?.version;

  return (
    <>
      <GlobalButtons
        favsCount={favsCount}
        onFavsClick={onFavsClick}
        onVersionHistoryClick={onVersionHistoryClick}
        onMenuClick={onMenuClick}
        isMenuOpen={isMenuOpen}
        onMenuClose={onMenuClose}
        hasNewVersion={hasNewVersion}
        currentVersion={currentVersion}
      />

      {isFavsOpen &&
        <FavoritesModalRoot onClose={() => setFavsOpen(false)}/>
      }
      {isVersionHistoryOpen &&
        <VersionHistoryModal onClose={() => setVersionHistoryOpen(false)}/>
      }
    </>
  );
}

export default GlobalButtonsRoot;
