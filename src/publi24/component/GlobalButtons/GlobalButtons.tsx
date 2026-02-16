import React, {MouseEventHandler, useEffect, useRef, useState} from 'react';
import styles from './GlobalButtons.module.scss';
import {PhoneIcon} from "../Common/Icons/PhoneIcon";
import {SettingsIcon} from "../Common/Icons/SettingsIcon";
import {StarIcon} from "../../../common/components/Icons/StarIcon";
import {MenuIcon} from "../../../common/components/Icons/MenuIcon";
import HistoryIcon from "../Common/Icons/HistoryIcon";
import TutorialIcon from "../Common/Icons/TutorialIcon";
import {P24faLogoDark} from "../../../common/components/Logo/P24faLogoDark";
import {P24faLogoLight} from "../../../common/components/Logo/P24faLogoLight";
import {misc} from "../../core/misc";
import {IS_MOBILE_VIEW} from "../../../common/globals";
import {utils} from "../../../common/utils";

type GlobalButtonsProps = {
  favsCount: number | null;
  favsWithNoAdsCount: number | null;
  onSearchClick: MouseEventHandler;
  onSettingsClick: MouseEventHandler;
  onFavsClick: MouseEventHandler;
  onVersionHistoryClick: MouseEventHandler;
  onTutorialClick: MouseEventHandler;
  onMenuClick: MouseEventHandler;
  isMenuOpen: boolean;
  onMenuClose: () => void;
  hasNewVersion: boolean;
  currentVersion: string;
};

const GlobalButtons: React.FC<GlobalButtonsProps> =
({
  favsCount,
  favsWithNoAdsCount,
  onSearchClick,
  onSettingsClick,
  onFavsClick,
  onVersionHistoryClick,
  onTutorialClick,
  onMenuClick,
  isMenuOpen,
  onMenuClose,
  hasNewVersion,
  currentVersion,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef<null | number>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (favsWithNoAdsCount === null || favsCount === null) {
      return;
    }

    const newValue = favsCount + favsWithNoAdsCount;

    if (prevCountRef.current === null) {
      prevCountRef.current = newValue;
    }
    else if (prevCountRef.current !== newValue) {
      prevCountRef.current = newValue;
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 210);
    }
  }, [favsCount, favsWithNoAdsCount]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        const menuButton = document.querySelector('[data-wwid="menu-button"]');
        if (menuButton && menuButton.contains(target)) {
          return;
        }
        onMenuClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, onMenuClose]);

  const isDark = misc.getPubliTheme() === 'dark';
  const LogoComponent = isDark ? P24faLogoDark : P24faLogoLight;

  return (
    <div className={styles.globalButtonsContainer}>
      <div className={styles.logoWrapper}>
        <button
          type="button"
          className={styles.logoButton}
          title="Logo"
          aria-label="Logo"
        >
          <LogoComponent className={styles.logo} padding={false} onClick={utils.openExtensionPage}/>
        </button>
      </div>

      <button
        type="button"
        className={`${styles.menuButton} ${hasNewVersion ? styles.menuButtonNewVersion: ''}`}
        data-wwid="menu-button"
        data-wwanimating={hasNewVersion}
        title="Meniu"
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <MenuIcon/>
      </button>

      {isMenuOpen && (
        <div ref={menuRef} className={styles.menuDropdown}>
          <div className={styles.menuArrow}/>
          <div className={styles.menuHeader}>
            <span className={styles.menuTitle}>Publi24 filtru avansat</span>
            <span className={styles.menuVersion}>v{currentVersion}</span>
          </div>
          <button
            type="button"
            className={styles.menuItem}
            data-wwid="tutorial-button"
            onClick={(e) => {
              onTutorialClick(e);
              onMenuClose();
            }}
          >
            <TutorialIcon fill="currentColor"/>
            <span>Tutorial</span>
          </button>
          <button
            type="button"
            className={`${styles.menuItem} ${hasNewVersion ? styles.menuItemNewVersion : ''}`}
            data-wwid="version-history-button"
            data-wwanimating={hasNewVersion}
            onClick={(e) => {
              onVersionHistoryClick(e);
              onMenuClose();
            }}
          >
            <HistoryIcon fill="currentColor"/>
            <span>Istoric verziuni</span>
          </button>
          <button
            type="button"
            className={styles.menuItem}
            data-wwid="phone-search-button"
            onClick={(e) => {
              onSearchClick(e);
              onMenuClose();
            }}
          >
            <PhoneIcon fill='currentColor'/>
            <span>Caută anunțuri</span>
          </button>
          <button
            type="button"
            className={styles.menuItem}
            data-wwid="settings-button"
            onClick={(e) => {
              onSettingsClick(e);
              onMenuClose();
            }}
          >
            <SettingsIcon fill="currentColor"/>
            <span>Setări</span>
          </button>
        </div>
      )}

      <div className={styles.logoButtonBg}/>

      <button
        type="button"
        className={`${styles.savesButton} ${isAnimating ? styles.savesButtonAnimating : ''} ${favsWithNoAdsCount === 0 ? styles.savesButtonOnlyActive : ''}`}
        data-wwid="favs-button"
        onClick={onFavsClick}
        title={'Favorite'}
      >
        <StarIcon className={styles.savesIcon}/>
        <span>
          {IS_MOBILE_VIEW
            ? <>{favsCount || 0}<span>{favsWithNoAdsCount ? '+' + favsWithNoAdsCount : ''}</span></>
            : <>Favorite {favsCount || 0}<span>{favsWithNoAdsCount ? '+' + favsWithNoAdsCount : ''}</span></>
          }
        </span>
      </button>
    </div>
  );
};

export default GlobalButtons;
