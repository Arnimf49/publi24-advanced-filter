import React, {useState, useRef, MouseEventHandler, useMemo} from 'react';
import Modal from '../../../../common/components/Modal/Modal';
import ContentModal from '../../../../common/components/Modal/ContentModal';
import styles from './FavoritesModal.module.scss';
import {StarIcon} from '../../../../common/components/Icons/StarIcon';
import {EscortCard} from './EscortCard';
import {cityService} from '../../../core/cityService';
import {NimfomaneStorage} from '../../../core/storage';

type FavoritesModalProps = {
  onClose: () => void;
  onClearFavorites: () => void;
  favorites: string[];
};

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  onClose,
  onClearFavorites,
  favorites = [],
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isEmpty = favorites.length === 0;

  const currentCity = useMemo(() => cityService.getCurrentCity(), []);

  const {inLocationEscorts, otherLocationEscorts} = useMemo(() => {
    if (!currentCity) {
      return {inLocationEscorts: favorites, otherLocationEscorts: []};
    }

    const inLocation: string[] = [];
    const otherLocation: string[] = [];

    favorites.forEach((user) => {
      const escort = NimfomaneStorage.getEscort(user);
      const escortCity = escort.profileStats?.currentCity?.name;

      if (escortCity === currentCity) {
        inLocation.push(user);
      } else {
        otherLocation.push(user);
      }
    });

    return {inLocationEscorts: inLocation, otherLocationEscorts: otherLocation};
  }, [favorites, currentCity]);

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
    >
      <ContentModal
        title={<><StarIcon fill="#fff"/> Favorite</>}
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
        color="rgb(137, 71, 97)"
        maxWidth={650}
      >
        {isEmpty ? (
          <p className={styles.emptyMessage}>
            Nu ai încă escorte favorite. Apasă pe butonul cu steluța pe anunț ca să le adaugi aici.
          </p>
        ) : currentCity && (inLocationEscorts.length > 0 || otherLocationEscorts.length > 0) ? (
          <>
            {inLocationEscorts.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.favoritesSectionHeader} data-wwid="section-in-location">
                  În locație <span className={styles.count}>({inLocationEscorts.length})</span>
                </h4>
                <div className={styles.escortsList}>
                  {inLocationEscorts.map((user, index) => (
                    <EscortCard key={user} user={user} index={index} />
                  ))}
                </div>
              </div>
            )}

            {otherLocationEscorts.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.favoritesSectionHeader} data-wwid="section-other-locations">
                  În alte locații <span className={styles.count}>({otherLocationEscorts.length})</span>
                </h4>
                <div className={styles.escortsList}>
                  {otherLocationEscorts.map((user, index) => (
                    <EscortCard key={user} user={user} index={index} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.escortsList}>
            {favorites.map((user, index) => (
              <EscortCard key={user} user={user} index={index} />
            ))}
          </div>
        )}
      </ContentModal>
    </Modal>
  );
};

export default FavoritesModal;
