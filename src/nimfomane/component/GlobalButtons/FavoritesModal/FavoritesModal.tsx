import React, {useState, useRef, MouseEventHandler} from 'react';
import Modal from '../../../../common/components/Modal/Modal';
import ContentModal from '../../../../common/components/Modal/ContentModal';
import styles from './FavoritesModal.module.scss';
import {StarIcon} from '../../../../common/components/Icons/StarIcon';

type FavoritesModalProps = {
  onClose: () => void;
  inline?: boolean;
  onClearFavorites: () => void;
  favorites: string[];
  inLocationEscorts: string[];
  otherLocationEscorts: string[];
  currentCity: string | null;
  renderEscort: (user: string, index: number) => React.ReactNode;
};

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  onClose,
  inline = false,
  onClearFavorites,
  favorites = [],
  inLocationEscorts,
  otherLocationEscorts,
  currentCity,
  renderEscort,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isEmpty = favorites.length === 0;

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
      inline={inline}
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
                    <React.Fragment key={user}>{renderEscort(user, index)}</React.Fragment>
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
                    <React.Fragment key={user}>{renderEscort(user, index)}</React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.escortsList}>
            {favorites.map((user, index) => (
              <React.Fragment key={user}>{renderEscort(user, index)}</React.Fragment>
            ))}
          </div>
        )}
      </ContentModal>
    </Modal>
  );
};

export default FavoritesModal;
