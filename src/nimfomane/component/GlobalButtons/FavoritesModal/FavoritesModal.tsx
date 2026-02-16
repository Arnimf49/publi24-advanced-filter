import React, {useState, useRef, MouseEventHandler} from 'react';
import Modal from '../../../../common/components/Modal/Modal';
import ContentModal from '../../../../common/components/Modal/ContentModal';
import styles from './FavoritesModal.module.scss';
import {StarIcon} from '../../../../common/components/Icons/StarIcon';
import {EscortCard} from './EscortCard';

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
        ) : (
          <div className={styles.escortsList}>
            {favorites.map((user) => (
              <EscortCard key={user} user={user} />
            ))}
          </div>
        )}
      </ContentModal>
    </Modal>
  );
};

export default FavoritesModal;
