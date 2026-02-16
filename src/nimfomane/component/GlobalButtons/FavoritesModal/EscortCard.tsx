import React, {useRef, useState, useEffect} from 'react';
import styles from './EscortCard.module.scss';
import {NimfomaneStorage} from '../../../core/storage';
import {PanelRoot} from '../../Panel/PanelRoot';
import Modal from '../../../../common/components/Modal/Modal';
import {EscortImages} from '../../TopicImage/EscortImages/EscortImages';
import {Loader} from '../../../../common/components/Loader/Loader';
import {NoImageIcon} from '../../TopicImage/NoImageIcon';
import {ImageErrorIcon} from '../../TopicImage/ImageErrorIcon';
import {NimfomaneMemoryStorage} from '../../../core/memoryStorage';
import {nimfomaneUtils} from '../../../core/nimfomaneUtils';

type EscortCardProps = {
  user: string;
};

export const EscortCard: React.FC<EscortCardProps> = ({user}) => {
  const ref = useRef<HTMLDivElement>(null);
  const escort = NimfomaneStorage.getEscort(user);
  const escortMemoryState = NimfomaneMemoryStorage.getEscortState(user);
  const [isModalOpen, setImageModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [_, setRenderCycle] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const incrementRender = () => setRenderCycle(v => ++v);
    NimfomaneStorage.onEscortChanged(user, incrementRender);
    NimfomaneMemoryStorage.onEscortMemoryChanged(user, incrementRender);
    return () => {
      NimfomaneStorage.removeOnEscortChanged(user, incrementRender);
      NimfomaneMemoryStorage.removeOnEscortMemoryChanged(user, incrementRender);
    };
  }, [user]);

  useEffect(() => {
    setHasImageError(false);
  }, [escort.optimizedProfileImage]);

  const profileUrl = escort.profileLink || `https://www.nimfomane.com/forum/profile/${encodeURIComponent(user)}/`;
  
  const isImageLoading = escort.optimizedProfileImage === undefined && !escortMemoryState.escortAnalysisError;
  const loadError = escortMemoryState.escortAnalysisError;
  const showImage = typeof escort.optimizedProfileImage === "string" && !hasImageError && !loadError;
  const showNoImage = escort.optimizedProfileImage === null && !loadError;
  const showError = hasImageError || !!loadError;

  return (
    <>
      <div className={styles.escortCard} data-wwid='escort-card' ref={ref}>
        <div data-wwid="hide-reason-container"></div>
        <div className={styles.escortCardInset}>
          <div className={styles.imageSection} data-wwid="escort-card-image-section">
            {isImageLoading && <Loader color={'#555'} />}
            {showImage && (
              <img
                src={nimfomaneUtils.normalizeCmsUrl(escort.optimizedProfileImage!)}
                alt={user}
                className={styles.profileImage}
                onClick={() => setImageModalOpen(true)}
                onError={() => setHasImageError(true)}
                data-wwid="escort-card-image"
              />
            )}
            {showNoImage && <NoImageIcon />}
            {showError && <ImageErrorIcon />}
          </div>
          <div className={styles.contentSection}>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.escortName}
              data-wwid="escort-name"
            >
              {user}
            </a>
            <div className={styles.panelContainer}>
              {mounted && ref.current && <PanelRoot escortUser={user} container={ref.current} />}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal close={() => setImageModalOpen(false)} dataWwid="escort-image-modal">
          <EscortImages
            onClose={() => setImageModalOpen(false)}
            user={user}
          />
        </Modal>
      )}
    </>
  );
};
