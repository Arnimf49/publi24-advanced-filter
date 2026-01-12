import React, {MouseEventHandler, useEffect, useRef, useState} from 'react';
import styles from './GlobalButtons.module.scss';
import {PhoneIcon} from "../Common/Icons/PhoneIcon";
import {SettingsIcon} from "../Common/Icons/SettingsIcon";
import {StarIcon} from "../Common/Icons/StarIcon";
import {IS_MOBILE_VIEW} from "../../../common/globals";

type GlobalButtonsProps = {
  favsCount: number | null;
  favsWithNoAdsCount: number | null;
  onSearchClick: MouseEventHandler;
  onSettingsClick: MouseEventHandler;
  onFavsClick: MouseEventHandler;
};

const GlobalButtons: React.FC<GlobalButtonsProps> =
({
  favsCount,
  favsWithNoAdsCount,
  onSearchClick,
  onSettingsClick,
  onFavsClick,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef<null | number>(null);

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

  return (
    <>
      <button
        type="button"
        className={styles.searchButton}
        data-wwid="phone-search"
        title="Caută după număr de telefon"
        onClick={onSearchClick}
        aria-label="Search by phone number"
      >
        <PhoneIcon/>
      </button>

      <button
        type="button"
        className={styles.settingsButton}
        data-wwid="settings-button"
        title="Setări"
        onClick={onSettingsClick}
        aria-label="Settings"
      >
        <SettingsIcon/>
      </button>

      <button
        type="button"
        className={`${styles.savesButton} ${isAnimating ? styles.savesButtonAnimating : ''}`}
        data-wwid="favs-button"
        onClick={onFavsClick}
        title={'Favorite'}
      >
        <StarIcon className={styles.savesIcon}/>
        {IS_MOBILE_VIEW
          ? `${favsCount || 0}${favsWithNoAdsCount ? '+' + favsWithNoAdsCount : ''}`
          : `Favorite (${favsCount || 0}${favsWithNoAdsCount ? '+' + favsWithNoAdsCount : ''})`
        }
      </button>
    </>
  );
};

export default GlobalButtons;
