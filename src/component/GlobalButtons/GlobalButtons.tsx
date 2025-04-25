import React, {MouseEventHandler} from 'react';
import styles from './GlobalButtons.module.scss';
import {PhoneIcon} from "../Common/Icons/PhoneIcon";
import {SettingsIcon} from "../Common/Icons/SettingsIcon";
import {StarIcon} from "../Common/Icons/StarIcon";

type GlobalButtonsProps = {
  isMobileView: boolean;
  favsCount: number;
  onSearchClick: MouseEventHandler;
  onSettingsClick: MouseEventHandler;
  onFavsClick: MouseEventHandler;
};

const GlobalButtons: React.FC<GlobalButtonsProps> = ({
  isMobileView,
  favsCount,
  onSearchClick,
  onSettingsClick,
  onFavsClick,
}) => {
  const searchClasses = `${styles.searchButton} ${isMobileView ? styles.isMobile : ''}`;
  const settingsClasses = `${styles.settingsButton} ${isMobileView ? styles.isMobile : ''}`;
  const savesClasses = `${styles.savesButton} ${isMobileView ? styles.isMobile : ''}`;

  return (
    <>
      <button
        type="button"
        className={searchClasses}
        data-wwid="phone-search"
        title="Caută după număr de telefon"
        onClick={onSearchClick}
        aria-label="Search by phone number"
      >
        <PhoneIcon/>
      </button>

      <button
        type="button"
        className={settingsClasses}
        data-wwid="settings-button"
        title="Setări"
        onClick={onSettingsClick}
        aria-label="Settings"
      >
        <SettingsIcon/>
      </button>

      <button
        type="button"
        className={savesClasses}
        data-wwid="favs-button"
        onClick={onFavsClick}
        title={'Favorite'}
        aria-label={`View ${favsCount} saved items`}
      >
        <StarIcon className={styles.savesIcon}/>
        {isMobileView ? favsCount : `Favorite (${favsCount})`}
      </button>
    </>
  );
};

export default GlobalButtons;
