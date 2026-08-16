import React from 'react';
import Modal from '../../../common/components/Modal/Modal';
import ContentModal from '../../../common/components/Modal/ContentModal';
import {InlineLoader} from '../../../common/components/InlineLoader/InlineLoader';
import {dateLib} from '../../../common/utils/dateLib';
import type {EscortItem} from '../../core/storage';
import type {
  PersonalDetails,
  ServiceDetails,
} from '../../core/escortInfoExtractor';
import {nimfomaneUtils} from '../../core/nimfomaneUtils';
import {escortProfileImage} from '../EscortProfileImage/EscortProfileImage';
import {serviceDisplay} from './serviceDisplay';
import styles from './EscortDetailsModal.module.scss';

type EscortDetailsModalProps = {
  user: string;
  escort: EscortItem;
  isLoading: boolean;
  error: string | null;
  imageLoadError?: string | null;
  onRefresh: () => void;
  onClose: () => void;
};

type SectionMetaProps = {
  sourceUrl?: string;
  sourceUrls?: string[];
  contentDate?: number;
};

const PERSONAL_ROWS: Array<{key: keyof PersonalDetails; label: string; suffix: string}> = [
  {key: 'age', label: 'Vârstă', suffix: ' ani'},
  {key: 'height', label: 'Înălțime', suffix: ' cm'},
  {key: 'weight', label: 'Greutate', suffix: ' kg'},
];

function formatRelativeTime(timestamp?: number): string | null {
  return timestamp ? dateLib.getRelativeTime(new Date(timestamp).toISOString()) : null;
}

const SectionMeta: React.FC<SectionMetaProps> = ({sourceUrl, sourceUrls, contentDate}) => {
  const relativeDate = formatRelativeTime(contentDate);
  const urls = sourceUrls?.length ? sourceUrls : sourceUrl ? [sourceUrl] : [];

  return (
    <div className={styles.sectionMeta}>
      {relativeDate && <span>{relativeDate},</span>}
      {urls.length ? (
        urls.map((url, index) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
            {urls.length === 1 ? 'sursă' : `sursă ${index + 1}`}
          </a>
        ))
      ) : (
        <span>sursă indisponibilă</span>
      )}
    </div>
  );
};

const PersonalDetailsSection: React.FC<{details: PersonalDetails; escort: EscortItem}> = ({details, escort}) => (
  <section className={styles.detailSection} data-wwid="personal-details-section">
    <div className={styles.sectionHeader}>
      <h4 className={styles.sectionTitle}>Detalii personale</h4>
      <div data-wwid="personal-details-meta">
        <SectionMeta
          sourceUrl={escort.personalDetailsSourceUrl}
          sourceUrls={escort.personalDetailsSourceUrls}
          contentDate={escort.personalDetailsContentDate}
        />
      </div>
    </div>
    <table className={styles.detailsTable}>
      <tbody>
        {PERSONAL_ROWS.filter(row => details[row.key] !== undefined).map(row => (
          <tr key={row.key}>
            <th>{row.label}</th>
            <td>{details[row.key]}{row.suffix}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

const RatesTable: React.FC<{details: ServiceDetails}> = ({details}) => {
  const rows = serviceDisplay.getRateRows(details);
  if (!rows.length) {
    return null;
  }

  return (
    <div className={styles.subsection}>
      <table className={styles.detailsTable}>
        <tbody>
          {rows.map(row => (
            <tr key={row.key}>
              <th>{row.label}</th>
              <td>{row.values.map((value, index) => (
                <React.Fragment key={value}>
                  {index > 0 && ' · '}
                  {value}
                </React.Fragment>
              ))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ScheduleTable: React.FC<{details: ServiceDetails}> = ({details}) => {
  if (!details.schedule?.length) {
    return null;
  }

  return (
    <div className={styles.subsection}>
      <table className={styles.detailsTable}>
        <tbody>
          {details.schedule.map(schedule => (
            <tr key={`${schedule.days || 'all'}-${schedule.start}-${schedule.end}`}>
              <th>Program</th>
              <td>{schedule.days ? `${schedule.days}: ` : ''}{schedule.start} - {schedule.end}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ServicesTable: React.FC<{details: ServiceDetails}> = ({details}) => {
  if (!details.services || !Object.keys(details.services).length) {
    return null;
  }

  return (
    <div className={styles.subsection}>
      <table className={styles.detailsTable}>
        <tbody>
          {serviceDisplay.getServiceGroups(details.services).map(group => {
            return (
              <tr key={group.label}>
                <th>{group.label}</th>
                <td>
                  {group.services.map((service, index) => (
                    <React.Fragment key={service.service}>
                      {index > 0 && ', '}
                      <span className={service.isNotIncluded ? styles.notIncluded : ''}>
                        {service.label}
                        {service.extraCost !== undefined && (
                          <> (<em className={styles.extraCost}>+{service.extraCost} lei</em>)</>
                        )}
                      </span>
                    </React.Fragment>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ServiceDetailsSection: React.FC<{details: ServiceDetails; escort: EscortItem}> = ({details, escort}) => (
  <section className={styles.detailSection} data-wwid="service-details-section">
    <div className={styles.sectionHeader}>
      <h4 className={styles.sectionTitle}>Detalii servicii</h4>
      <div data-wwid="service-details-meta">
        <SectionMeta
          sourceUrl={escort.serviceDetailsSourceUrl}
          sourceUrls={escort.serviceDetailsSourceUrls}
          contentDate={escort.serviceDetailsContentDate}
        />
      </div>
    </div>
    <RatesTable details={details} />
    <ScheduleTable details={details} />
    <ServicesTable details={details} />
  </section>
);

const EscortDetailsModal: React.FC<EscortDetailsModalProps> = ({
  user,
  escort,
  isLoading,
  error,
  imageLoadError,
  onRefresh,
  onClose,
}) => {
  const profileUrl = escort.profileLink || `https://nimfomane.com/forum/profile/${encodeURIComponent(user)}/`;
  const {EscortProfileImage} = escortProfileImage;

  return (
    <Modal close={onClose} dataWwid="escort-details-modal">
      <ContentModal
        title="Detalii escortă"
        onClose={onClose}
        maxWidth={600}
        color="rgb(47, 73, 121)"
      >
        <section className={styles.section}>
          <div className={styles.detailsHeader}>
            <div className={styles.identity}>
              <EscortProfileImage
                user={user}
                imageUrl={typeof escort.optimizedProfileImage === 'string'
                  ? nimfomaneUtils.normalizeCmsUrl(escort.optimizedProfileImage)
                  : escort.optimizedProfileImage}
                imageLoading={escort.optimizedProfileImage === undefined && !imageLoadError}
                imageLoadError={imageLoadError}
                variant="details"
              />
              <h3 className={styles.userName} data-wwid="escort-details-user">
                <a href={profileUrl} target="_blank" rel="noopener noreferrer">{user}</a>
              </h3>
            </div>
            {!isLoading && (
              <div className={styles.statusRow} data-wwid="escort-details-status">
                <button
                  type="button"
                  className={styles.refreshButton}
                  onClick={onRefresh}
                  data-wwid="escort-details-refresh"
                >
                  actualizare
                </button>
              </div>
            )}
          </div>
          {isLoading && (
            <div className={styles.loadingState} data-wwid="escort-details-loading">
              <InlineLoader color="#2f4979" size={14} />
              <span>Se analizează datele din postări..</span>
            </div>
          )}
          {!isLoading && escort.escortDetailsTime && (
            <span className={styles.collectionMeta}>
              date culese {formatRelativeTime(escort.escortDetailsTime)}
            </span>
          )}
          {error && <p className={styles.error} data-wwid="escort-details-error">{error}</p>}
          {escort.personalDetails && <PersonalDetailsSection details={escort.personalDetails} escort={escort} />}
          {escort.serviceDetails && <ServiceDetailsSection details={escort.serviceDetails} escort={escort} />}
          {!isLoading && !escort.personalDetails && !escort.serviceDetails && (
            <p className={styles.noDetails}>Nu s-au găsit detalii personale sau despre servicii</p>
          )}
          <p className={styles.disclaimer}>
            Informațiile se culeg exclusiv din conținutul titularei. Un algoritm determinist extrage informațiile.
            Acesta funcționează în majoritatea cazurilor, dar nu perfect. Întotdeauna verifică sursa când trebuie să știi la sigur.
          </p>
        </section>
      </ContentModal>
    </Modal>
  );
};

export const escortDetailsModal = {
  EscortDetailsModal,
};
