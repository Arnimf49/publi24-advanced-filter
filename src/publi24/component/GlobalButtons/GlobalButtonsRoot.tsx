import React, {MouseEventHandler, useCallback, useEffect, useState} from 'react';
import GlobalButtons from "./GlobalButtons";
import {WWStorage} from "../../core/storage";
import FavoritesModalRoot from "./FavoritesModal/FavoritesModalRoot";
import PhoneSearchModalRoot from "./PhoneSearchModal/PhoneSearchModalRoot";
import SettingsModalRoot from "./SettingsModal/SettingsModalRoot";
import VersionHistoryModal from "./VersionHistoryModal/VersionHistoryModal";
import FeedbackModal from "../../../common/components/FeedbackModal/FeedbackModal";
import {modalState} from "../../../common/modalState";
import {versionHistory} from "../../data/versionHistory";
import {renderer} from "../../core/renderer";
import NextVisibleAdButton from "./NextVisibleAdButton/NextVisibleAdButton";
import {misc} from "../../core/misc";

type GlobalButtonsRootProps = {
};

const renderNextVisibleAd = WWStorage.isFindNextVisibleAd();

const GlobalButtonsRoot: React.FC<GlobalButtonsRootProps> = ({
}) => {
  const [isFavsOpen, setFavsOpen] = useState(false);
  const [isPhoneSearchOpen, setPhoneSearchOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isVersionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [favsCount, setFavsCount] = useState<number | null>(null);
  const [favsWithNoAdsCount, setFavsWithNoAdsCount] = useState<number | null>(null);
  const [hasNewVersion, setHasNewVersion] = useState(false);

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

  useEffect(() => {
    const currentVersion = versionHistory[0]?.version;
    const seenVersion = WWStorage.getVersionSeen();

    if (!seenVersion) {
      WWStorage.setVersionSeen(currentVersion);
      setHasNewVersion(false);
    } else if (seenVersion !== currentVersion) {
      setHasNewVersion(true);
    }
  }, []);

  const onFavsClick: MouseEventHandler = useCallback(() => setFavsOpen(true), []);
  const onSearchClick: MouseEventHandler = useCallback(() => setPhoneSearchOpen(true), []);
  const onSettingsClick: MouseEventHandler = useCallback(() => setSettingsOpen(true), []);
  const onFeedbackClick: MouseEventHandler = useCallback(() => setFeedbackOpen(true), []);
  const onVersionHistoryClick: MouseEventHandler = useCallback(() => {
    setVersionHistoryOpen(true);
    const currentVersion = versionHistory[0]?.version;
    WWStorage.setVersionSeen(currentVersion);
    setHasNewVersion(false);
  }, []);
  const onMenuClick: MouseEventHandler = useCallback(() => setMenuOpen(prev => !prev), []);
  const onMenuClose = useCallback(() => setMenuOpen(false), []);
  const onTutorialClick: MouseEventHandler = useCallback(() => {
    renderer.renderInfo();
  }, []);
  const currentVersion = versionHistory[0]?.version;

  return (
    <>
      <GlobalButtons
        favsCount={favsCount}
        favsWithNoAdsCount={favsWithNoAdsCount}
        onFavsClick={onFavsClick}
        onSearchClick={onSearchClick}
        onSettingsClick={onSettingsClick}
        onVersionHistoryClick={onVersionHistoryClick}
        onFeedbackClick={onFeedbackClick}
        onTutorialClick={onTutorialClick}
        onMenuClick={onMenuClick}
        isMenuOpen={isMenuOpen}
        onMenuClose={onMenuClose}
        hasNewVersion={hasNewVersion}
        currentVersion={currentVersion}
      />

      {renderNextVisibleAd && <NextVisibleAdButton/>}
      {isFavsOpen &&
        <FavoritesModalRoot onClose={() => setFavsOpen(false)}/>}
      {isPhoneSearchOpen &&
        <PhoneSearchModalRoot onClose={() => setPhoneSearchOpen(false)}/>}
      {isSettingsOpen &&
        <SettingsModalRoot onClose={() => setSettingsOpen(false)}/>}
      {isVersionHistoryOpen &&
        <VersionHistoryModal onClose={() => setVersionHistoryOpen(false)}/>}
      {isFeedbackOpen &&
        <FeedbackModal
          onClose={() => setFeedbackOpen(false)}
          color={misc.getPubliTheme() === 'dark' ? 'rgb(60 84 123)' : '#1177bb'}
        />}
    </>
  );
};

export default GlobalButtonsRoot;
