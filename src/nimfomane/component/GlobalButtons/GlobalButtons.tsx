import React, {MouseEventHandler, useEffect, useRef, useState} from 'react';
import styles from './GlobalButtons.module.scss';
import {StarIcon} from '../../../common/components/Icons/StarIcon';
import {MenuIcon} from '../../../common/components/Icons/MenuIcon';
import {HistoryIcon} from '../../../common/components/Icons/HistoryIcon';
import {FeedbackIcon} from '../../../common/components/Icons/FeedbackIcon';
import {SettingsIcon} from '../../../common/components/Icons/SettingsIcon';
import {P24faLogoLight} from '../../../common/components/Logo/P24faLogoLight';
import {IS_MOBILE_VIEW} from '../../../common/globals';
import {utils} from "../../../common/utils";

type GlobalButtonsProps = {
  favsCount: number | null;
  onFavsClick: MouseEventHandler;
  onSettingsClick: MouseEventHandler;
  onVersionHistoryClick: MouseEventHandler;
  onFeedbackClick: MouseEventHandler;
  onMenuClick: MouseEventHandler;
  isMenuOpen: boolean;
  onMenuClose: () => void;
  hasNewVersion: boolean;
  currentVersion: string;
};

const GlobalButtons: React.FC<GlobalButtonsProps> =
({
  favsCount,
  onFavsClick,
  onSettingsClick,
  onVersionHistoryClick,
  onFeedbackClick,
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
    if (favsCount === null) {
      return;
    }

    if (prevCountRef.current === null) {
      prevCountRef.current = favsCount;
    }
    else if (prevCountRef.current !== favsCount) {
      prevCountRef.current = favsCount;
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 210);
    }
  }, [favsCount]);

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

  return (
    <div className={styles.globalButtonsContainer}>
      <div className={styles.logoWrapper}>
        <button
          type="button"
          className={styles.logoButton}
          title="Logo"
          aria-label="Logo"
        >
          <P24faLogoLight className={styles.logo} padding={false} onClick={utils.openExtensionPage}/>
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
        <MenuIcon fill="#fff"/>
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
            data-wwid="feedback-button"
            onClick={(e) => {
              onFeedbackClick(e);
              onMenuClose();
            }}
          >
            <FeedbackIcon fill="currentColor"/>
            <span>Feedback</span>
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
        className={`${styles.savesButton} ${isAnimating ? styles.savesButtonAnimating : ''}`}
        data-wwid="favs-button"
        onClick={onFavsClick}
        title={'Favorite'}
      >
        <StarIcon className={styles.savesIcon}/>
        <span>
          {IS_MOBILE_VIEW
            ? <>{favsCount || 0}</>
            : <>Favorite {favsCount || 0}</>
          }
        </span>
      </button>
    </div>
  );
};

export default GlobalButtons;
