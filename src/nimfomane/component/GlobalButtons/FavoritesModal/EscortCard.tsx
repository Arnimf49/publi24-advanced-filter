import React, {useRef, useState, useEffect} from 'react';
import styles from './EscortCard.module.scss';
import {NimfomaneStorage} from '../../../core/storage';
import {PanelRoot} from '../../Panel/PanelRoot';
import Modal from '../../../../common/components/Modal/Modal';
import {EscortImages} from '../../TopicImage/EscortImages/EscortImages';
import {InlineLoader} from '../../../../common/components/InlineLoader/InlineLoader';
import {Loader} from '../../../../common/components/Loader/Loader';
import {NoImageIcon} from '../../TopicImage/NoImageIcon';
import {ImageErrorIcon} from '../../TopicImage/ImageErrorIcon';
import {NimfomaneMemoryStorage} from '../../../core/memoryStorage';
import {nimfomaneUtils} from '../../../core/nimfomaneUtils';
import {profileActions} from '../../../core/profileActions';
import {dateLib} from '../../../../common/utils/dateLib';

type EscortCardProps = {
  user: string;
  index?: number;
};

export const EscortCard: React.FC<EscortCardProps> = ({user, index}) => {
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

  useEffect(() => {
    if (profileActions.shouldLoadProfileStats(user)) {
      profileActions.loadProfileStats(user, profileUrl);
    }
  }, [user, profileUrl]);

  const isImageLoading = escort.optimizedProfileImage === undefined && !escortMemoryState.escortAnalysisError;
  const loadError = escortMemoryState.escortAnalysisError;
  const showImage = typeof escort.optimizedProfileImage === "string" && !hasImageError && !loadError;
  const showNoImage = escort.optimizedProfileImage === null && !loadError;
  const showError = hasImageError || !!loadError;

  const profileStats = escort.profileStats;
  const isStatsLoading = !profileStats;
  const isStatsStale = profileActions.isProfileStatsStale(user);


  return (
    <>
      <div className={`${styles.escortCard} escortCard`} data-wwid='escort-card' ref={ref}>
        {index !== undefined && (
          <div className={styles.escortIndex}>
            <span className={styles.indexText}>
              <span className={styles.hash}>#</span>{index + 1}
            </span>
          </div>
        )}
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
            <div className={styles.profileStats}>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>locație</span>
                  <span className={styles.statValue} data-wwid="stat-location">
                    {(isStatsLoading || isStatsStale) && <InlineLoader color="#888" size={12} />}
                    {profileStats?.currentCity ? (
                      <a href={profileStats.currentCity.topicUrl} target="_blank" rel="noopener noreferrer">
                        {profileStats.currentCity.name}
                      </a>
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>pe site</span>
                  <span className={styles.statValue} data-wwid="stat-last-visited" data-wwlastvisited={profileStats?.lastVisited || ''}>
                    {(isStatsLoading || isStatsStale) && <InlineLoader color="#888" size={12} />}
                    {profileStats?.lastVisited ? (
                      dateLib.getRelativeTime(profileStats.lastVisited)
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>postări</span>
                  <span className={styles.statValue} data-wwid="stat-posts">
                    {(isStatsLoading || isStatsStale) && <InlineLoader color="#888" size={12} />}
                    {profileStats?.posts ? (
                      profileStats.posts
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>reputație</span>
                  <span className={styles.statValue} data-wwid="stat-reputation">
                    {(isStatsLoading || isStatsStale) && <InlineLoader color="#888" size={12} />}
                    {profileStats?.reputation ? (
                      profileStats.reputation
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.panelContainer}>
              {mounted && ref.current && <PanelRoot escortUser={user} container={ref.current} hideReasonLayout="vertical" />}
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
