import React, {RefObject} from 'react';
import styles from './EscortCard.module.scss';
import type {EscortItem} from '../../../core/storage';
import {InlineLoader} from '../../../../common/components/InlineLoader/InlineLoader';
import {escortProfileImage} from '../../EscortProfileImage/EscortProfileImage';

export type EscortCardProps = {
  user: string;
  index?: number;
  profileUrl: string;
  containerRef: RefObject<HTMLDivElement>;
  imageUrl?: string | null;
  imageLoading: boolean;
  imageLoadError?: string | null;
  onImageClick?: () => void;
  profileStats?: EscortItem['profileStats'];
  statsLoading: boolean;
  statsStale: boolean;
  lastVisitedLabel?: string | null;
  panel: React.ReactNode;
  imageModal?: React.ReactNode;
};

export const EscortCard: React.FC<EscortCardProps> = ({
  user,
  index,
  profileUrl,
  containerRef,
  imageUrl,
  imageLoading,
  imageLoadError,
  onImageClick,
  profileStats,
  statsLoading,
  statsStale,
  lastVisitedLabel,
  panel,
  imageModal,
}) => {
  const {EscortProfileImage} = escortProfileImage;

  return (
    <>
      <div className={`${styles.escortCard} escortCard`} data-wwid="escort-card" ref={containerRef}>
        {index !== undefined && (
          <div className={styles.escortIndex}>
            <span className={styles.indexText}>
              <span className={styles.hash}>#</span>{index + 1}
            </span>
          </div>
        )}
        <div data-wwid="hide-reason-container" />
        <div className={styles.escortCardInset}>
          <EscortProfileImage
            user={user}
            imageUrl={imageUrl}
            imageLoading={imageLoading}
            imageLoadError={imageLoadError}
            onClick={onImageClick}
          />
          <div className={styles.contentSection}>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={styles.escortName} data-wwid="escort-name">
              {user}
            </a>
            <div className={styles.profileStats}>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>locație</span>
                  <span className={styles.statValue} data-wwid="stat-location">
                    {(statsLoading || statsStale) && <InlineLoader color="#888" size={12} />}
                    {profileStats?.currentCity ? <a href={profileStats.currentCity.topicUrl} target="_blank" rel="noopener noreferrer">{profileStats.currentCity.name}</a> : '-'}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>pe site</span>
                  <span className={styles.statValue} data-wwid="stat-last-visited" data-wwlastvisited={profileStats?.lastVisited || ''}>
                    {(statsLoading || statsStale) && <InlineLoader color="#888" size={12} />}
                    {lastVisitedLabel || '-'}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>postări</span>
                  <span className={styles.statValue} data-wwid="stat-posts">
                    {(statsLoading || statsStale) && <InlineLoader color="#888" size={12} />}
                    {profileStats?.posts || '-'}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>reputație</span>
                  <span className={styles.statValue} data-wwid="stat-reputation">
                    {(statsLoading || statsStale) && <InlineLoader color="#888" size={12} />}
                    {profileStats?.reputation || '-'}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.panelContainer}>{panel}</div>
          </div>
        </div>
      </div>
      {imageModal}
    </>
  );
};
