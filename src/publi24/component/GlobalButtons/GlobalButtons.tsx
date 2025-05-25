import React, {MouseEventHandler} from 'react';
import styles from './GlobalButtons.module.scss';
import {PhoneIcon} from "../Common/Icons/PhoneIcon";
import {SettingsIcon} from "../Common/Icons/SettingsIcon";
import {StarIcon} from "../Common/Icons/StarIcon";
import {IS_MOBILE_VIEW} from "../../../common/globals";

type GlobalButtonsProps = {
  favsCount: number;
  onSearchClick: MouseEventHandler;
  onSettingsClick: MouseEventHandler;
  onFavsClick: MouseEventHandler;
};

const GlobalButtons: React.FC<GlobalButtonsProps> = ({
  favsCount,
  onSearchClick,
  onSettingsClick,
  onFavsClick,
}) => {
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
        className={styles.savesButton}
        data-wwid="favs-button"
        onClick={onFavsClick}
        title={'Favorite'}
        aria-label={`View ${favsCount} saved items`}
      >
        <StarIcon className={styles.savesIcon}/>
        {IS_MOBILE_VIEW ? favsCount : `Favorite (${favsCount})`}
      </button>
    </>
  );
};

export default GlobalButtons;
