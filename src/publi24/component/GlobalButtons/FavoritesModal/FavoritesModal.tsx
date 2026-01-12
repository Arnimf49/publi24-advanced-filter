import React, {useState, useRef, MouseEventHandler} from 'react';
import Modal from '../../../../common/components/Modal/Modal';
import ContentModal from '../../Common/Modal/ContentModal';
import AdsList from '../../Common/Partials/AdList/AdsList';
import styles from './FavoritesModal.module.scss';
import {AdData} from "../../../core/adData";
import PhoneAndTagsRoot from "../../Common/Partials/PhoneAndTags/PhoneAndTagsRoot";
import {StarIcon} from "../../Common/Icons/StarIcon";
import {RemoveIcon} from "../../Common/Icons/RemoveIcon";
import {misc} from "../../../core/misc";
import {Ad} from "./Ad";

type FavoritesModalProps = {
  onClose: () => void;
  onClearFavorites: () => void;
  onRemoveNoAd: (phone: string) => void;
  inLocationAds: AdData[];
  notInLocationAds: AdData[];
  noAdsItems: string[];
  onCleanup?: () => void;
};

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  onClose,
  onClearFavorites,
  onRemoveNoAd,
  inLocationAds = [],
  notInLocationAds = [],
  noAdsItems = [],
  onCleanup,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeCount = inLocationAds.length + notInLocationAds.length;
  const inactiveCount = noAdsItems.length;
  const isEmpty = activeCount === 0 && inactiveCount === 0;
  const isActiveEmpty = activeCount === 0;
  const isInactiveEmpty = inactiveCount === 0;

  const handleClearClick: MouseEventHandler = (event) => {
    event.stopPropagation();

    if (deleteTimeoutRef.current) {
      onClearFavorites();
    } else {
      setConfirmDelete(true);
      deleteTimeoutRef.current = setTimeout(() => {
        deleteTimeoutRef.current = null;
        setConfirmDelete(false);
      }, 5000);
    }
  };

  return (
    <Modal
      close={onClose}
      dataWwid="favorites-modal"
      onCleanup={onCleanup}
    >
      <ContentModal
        title={<><StarIcon fill={misc.getPubliTheme() === 'dark' ? '#bfbfbf' : '#fff'}/> Favorite</>}
        headerActions={<button
          type="button"
          className={styles.clearFavoritesButton}
          onClick={handleClearClick}
          data-wwid="clear-favorites"
          data-wwconfirm={confirmDelete ? 'true' : 'false'}
        >
          <b>{confirmDelete ? 'sigur?' : 'șterge tot'}</b>
        </button>}
        onClose={onClose}
        color={misc.getPubliTheme() === 'dark' ? 'rgb(101 44 62)' : '#b34c4c'}
      >
        <Ad/>
        {!isEmpty && (
          <div className={styles.toggleButtons}>
            <button
              type="button"
              className={`${styles.toggleButton} ${activeTab === 'active' ? styles.active : ''}`}
              onClick={() => setActiveTab('active')}
              data-wwid="toggle-active"
            >
              <b>Active</b> <span className={styles.count}>({activeCount})</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${activeTab === 'inactive' ? styles.active : ''}`}
              onClick={() => setActiveTab('inactive')}
              data-wwid="toggle-inactive"
            >
              <b>Inactive</b> <span className={styles.count}>({inactiveCount})</span>
            </button>
          </div>
        )}

        {isEmpty ? (
          <p className={styles.emptyMessage}>
            Nu ai încă anunțuri favorite. Apasă pe butonul cu steluța pe anunț ca să le adaugi aici.
          </p>
        ) : activeTab === 'active' ? (
          <>
            {isActiveEmpty ? (
              <p className={styles.emptyMessage}>
                Nu ai anunțuri active favorite. Apasă pe butonul cu steluța pe anunț ca să le adaugi aici.
              </p>
            ) : (
              <>
                {inLocationAds.length > 0 && (
                  <div className={styles.section} data-wwid="in-location">
                    <h4 className={styles.favoritesSectionHeader} data-wwid="favs-header">
                      În locație <span className={styles.count}>({inLocationAds.length})</span>
                    </h4>
                    <AdsList adsData={inLocationAds} showDuplicates={true}/>
                  </div>
                )}

                {notInLocationAds.length > 0 && (
                  <div className={styles.section} data-wwid="not-in-location">
                    <h4 className={styles.favoritesSectionHeader} data-wwid="favs-header">
                      În alte locații <span className={styles.count}>({notInLocationAds.length})</span>
                    </h4>
                    <AdsList adsData={notInLocationAds} showDuplicates={true}/>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {isInactiveEmpty ? (
              <p className={styles.emptyMessage}>
                Nu sunt favorite fără anunțuri active.
              </p>
            ) : (
              <div className={styles.section} data-wwid="no-ads">
                <h4 className={styles.favoritesSectionHeader} data-wwid="favs-header">
                  Fără anunțuri active <span className={styles.count}>({noAdsItems.length})</span>
                </h4>
                <p className={styles.noAdsInfoText}>
                  Aceste telefoane nu au anunțuri active în momentul de față, dar în viitor pot apărea.
                </p>
                {noAdsItems.map((phone) => (
                  <div key={phone} className={styles.noAdItem}>
                    <div className={styles.noAdContent}>
                      <PhoneAndTagsRoot phone={phone} noPadding={true}/>
                    </div>
                    <button
                      type="button"
                      className={styles.removeNoAdButton}
                      onClick={() => onRemoveNoAd(phone)}
                      data-wwrmfav={phone}
                      aria-label={`Remove favorite ${phone}`}
                    >
                      <RemoveIcon/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
    </ContentModal>
  </Modal>);
};

export default FavoritesModal;
