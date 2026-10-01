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
  citySections: Array<{city: string; escorts: string[]}>;
  inactiveEscorts: string[];
  renderEscort: (user: string, index: number) => React.ReactNode;
};

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  onClose,
  inline = false,
  onClearFavorites,
  favorites = [],
  citySections,
  inactiveEscorts,
  renderEscort,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isEmpty = favorites.length === 0;
  const activeCount = citySections.reduce((count, section) => count + section.escorts.length, 0);
  const inactiveCount = inactiveEscorts.length;
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
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
        maxWidth={700}
      >
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
            Nu ai încă escorte favorite. Apasă pe butonul cu steluța pe anunț ca să le adaugi aici.
          </p>
        ) : activeTab === 'inactive' ? (
          isInactiveEmpty ? (
            <p className={styles.emptyMessage}>Nu sunt escorte inactive favorite.</p>
          ) : (
            <div className={styles.section} data-wwid="inactive">
              <h4 className={styles.favoritesSectionHeader}>
                Inactive <span className={styles.count}>({inactiveCount})</span>
              </h4>
              <div className={styles.escortsList}>
                {inactiveEscorts.map((user, index) => (
                  <React.Fragment key={user}>{renderEscort(user, index)}</React.Fragment>
                ))}
              </div>
            </div>
          )
        ) : isActiveEmpty ? (
          <p className={styles.emptyMessage}>Nu ai escorte active favorite.</p>
        ) : (
          <>
            {citySections.map(({city, escorts}) => (
              <div className={styles.section} key={city}>
                <h4 className={styles.favoritesSectionHeader} data-wwid="section-city">
                  {city} <span className={styles.count}>({escorts.length})</span>
                </h4>
                <div className={styles.escortsList}>
                  {escorts.map((user, index) => (
                    <React.Fragment key={user}>{renderEscort(user, index)}</React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </ContentModal>
    </Modal>
  );
};

export default FavoritesModal;
