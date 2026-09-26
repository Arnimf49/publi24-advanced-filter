import React, {RefObject} from 'react';
import styles from './EscortCard.module.scss';
import type {EscortItem} from '../../../core/storage';
import type {PersonalDetails, ServiceDetails} from '../../../core/escortInfoExtractor';
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
  personalDetails?: PersonalDetails;
  serviceDetails?: ServiceDetails;
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
  personalDetails,
  serviceDetails,
  statsLoading,
  statsStale,
  lastVisitedLabel,
  panel,
  imageModal,
}) => {
  const {EscortProfileImage} = escortProfileImage;
  const personalDetailsValue = personalDetails && Object.values(personalDetails).some(value => value !== undefined)
    ? [
        personalDetails.height !== undefined ? `${personalDetails.height}cm` : null,
        personalDetails.weight !== undefined ? `${personalDetails.weight}kg` : null,
        personalDetails.age !== undefined ? `${personalDetails.age}ani` : null,
      ].filter((value): value is string => value !== null).join(', ')
    : null;
  const serviceRates = serviceDetails?.baseRates;
  const serviceRatesValue = serviceRates && (serviceRates['30m'] !== undefined || serviceRates['1h'] !== undefined)
    ? [
        serviceRates['30m'] !== undefined ? `${serviceRates['30m']} 30m` : null,
        serviceRates['1h'] !== undefined ? `${serviceRates['1h']} 1h` : null,
      ].filter((value): value is string => value !== null).join(', ')
    : null;

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
                  <span className={styles.statLabel}>{personalDetailsValue ? 'fizic' : 'postări'}</span>
                  <span className={styles.statValue} data-wwid="stat-posts">
                    {(statsLoading || statsStale) && <InlineLoader color="#888" size={12} />}
                    {personalDetailsValue || profileStats?.posts || '-'}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>{serviceRatesValue ? 'rate' : 'reputație'}</span>
                  <span className={styles.statValue} data-wwid="stat-reputation">
                    {(statsLoading || statsStale) && <InlineLoader color="#888" size={12} />}
                    {serviceRatesValue || profileStats?.reputation || '-'}
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
