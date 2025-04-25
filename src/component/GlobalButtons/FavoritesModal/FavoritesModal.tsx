import React from 'react';
import Modal from '../../Common/Modal/Modal';
import ContentModal from '../../Common/Modal/ContentModal';
import AdsList from '../../Common/Partials/AdList/AdsList';
import styles from './FavoritesModal.module.scss';
import {AdData} from "../../../core/adData";
import PhoneAndTagsRoot from "../../Common/Partials/PhoneAndTags/PhoneAndTagsRoot";
import {StarIcon} from "../../Common/Icons/StarIcon";
import {RemoveIcon} from "../../Common/Icons/RemoveIcon";

type FavoritesModalProps = {
  onClose: () => void;
  onClearFavorites: () => void;
  onRemoveNoAd: (phone: string) => void;
  inLocationAds: AdData[];
  notInLocationAds: AdData[];
  noAdsItems: string[];
};

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  onClose,
  onClearFavorites,
  onRemoveNoAd,
  inLocationAds = [],
  notInLocationAds = [],
  noAdsItems = [],
}) => {
  const isEmpty = inLocationAds.length === 0 && notInLocationAds.length === 0 && noAdsItems.length === 0;

  return (
    <Modal
      close={onClose}
      dataWwid="favorites-modal"
    >
      <ContentModal
        title={<><StarIcon/> Favorite</>}
        headerActions={<button
          type="button"
          className={styles.clearFavoritesButton}
          onClick={onClearFavorites}
          data-wwid="clear-favorites"
        >
          <b>șterge lista</b>
        </button>}
        onClose={onClose}
        color={'#b34c4c'}
      >
        {isEmpty ? (
          <p className={styles.emptyMessage}>
            Nu ai încă anunțuri favorite. Apasă pe butonul cu steluța pe anunț ca să le adaugi aici.
          </p>
        ) : (
          <>
            {inLocationAds.length > 0 && (
              <div className={styles.section} data-wwid="in-location">
                <h4 className={styles.favoritesSectionHeader} data-wwid="favs-header">
                  În locație <span className={styles.count}>({inLocationAds.length})</span>
                </h4>
                <AdsList adsData={inLocationAds}/>
              </div>
            )}

            {notInLocationAds.length > 0 && (
              <div className={styles.section} data-wwid="not-in-location">
                <h4 className={styles.favoritesSectionHeader} data-wwid="favs-header">
                  În alte locații <span className={styles.count}>({notInLocationAds.length})</span>
                </h4>
                <AdsList adsData={notInLocationAds}/>
              </div>
            )}

            {noAdsItems.length > 0 && (
              <div className={styles.section} data-wwid="no-ads">
                <h4 className={styles.favoritesSectionHeader} data-wwid="favs-header">
                  Fără anunțuri active <span className={styles.count}>({noAdsItems.length})</span>
                </h4>
                <p className={styles.noAdsInfoText}>
                  Aceste telefoane nu au anunțuri active în momentul de față, dar în viitor pot apărea. {/* Corrected grammar */}
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
