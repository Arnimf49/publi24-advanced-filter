import React, {ChangeEventHandler, MouseEventHandler, useEffect, useState} from 'react';
import GeneralModal from '../../../../../common/components/Modal/GeneralModal';
import AdsList from '../AdList/AdsList';
import styles from './AdsModal.module.scss';
import {AdData} from "../../../../core/adData";
import ErrorDisplay from "../../ErrorDisplay/ErrorDisplay";

type AdsModalProps = {
  close: () => void;
  title?: string | React.ReactNode;
  onHideAll?: MouseEventHandler;
  onInputChange?: ChangeEventHandler;
  phone?: string;
  removed?: number;
  adsData: AdData[] | null;
  hideReasonSelector?: React.ReactNode;
  onCleanup?: () => void;
  source?: 'inspector-escorte';
  sourcePhone?: string;
  errors?: string[];
  totalCount?: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  sectionBreaks?: number[];
};

const useLoadingDots = (isLoading: boolean | undefined) => {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '.') {
          return '..';
        }
        if (prev === '..') {
          return '...';
        }
        return '.';
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [isLoading]);

  return dots;
};

const AdsModal: React.FC<AdsModalProps> = ({
  close,
  title = "Anunțuri",
  onHideAll,
  phone,
  onInputChange,
  removed,
  adsData,
  hideReasonSelector,
  onCleanup,
  source,
  sourcePhone,
  errors,
  totalCount,
  hasMore,
  isLoadingMore,
  isLoading,
  onLoadMore,
  sectionBreaks,
}) => {
  const removedCount = removed ?? 0;
  const displayCount = totalCount != null
    ? totalCount - removedCount
    : (adsData ? adsData.length : null);
  const nextChunk = (!isLoading && hasMore && adsData && totalCount)
    ? Math.min(15, totalCount - removedCount - adsData.length)
    : 0;
  const loadingDots = useLoadingDots(isLoading);

  return (
    <GeneralModal
      title={title}
      onClose={close}
      dataWwid="ads-modal"
      onCleanup={onCleanup}
      prose={false}
      headerActions={
        !hideReasonSelector && onHideAll
          ? <button
              type="button"
              className={styles.hideAllButton}
              onClick={onHideAll}
              data-wwid="hide-all"
            >
              <b>ascunde toate</b>
            </button>
          : undefined
      }
    >
      <input
        type="text"
        className={styles.phoneInput}
        data-wwid="phone-input"
        placeholder="Număr telefon"
        onChange={onInputChange}
        value={phone || undefined}
        disabled={!!phone}
        readOnly={!!phone}
      />
      <p className={styles.resultsInfo}>
        <strong className={styles.resultsCount} data-wwid="results-count">
          {isLoading ? (
            <>Rezultate {loadingDots}</>
          ) : (
            <>Rezultate: <span data-wwid="count">{displayCount !== null ? displayCount : '...'}</span></>
          )}
        </strong>
        {(removed && removed > 0) ? (
          <span key={removed} className={styles.removedInfo}>
            ({removed} {removed > 1 ? 'anunțuri' : 'anunț'} nu mai există)
          </span>
        ) : null}
        <span className={styles.infoText}>
          {source === 'inspector-escorte' ? (
            <span className={styles.sourceBanner} data-wwid="source-banner">
              <img src="https://inspector-escorte.com/static/favicon-96x96.png" alt="" />
              Sursa duplicatelor: <a href={`https://inspector-escorte.com/phone/${sourcePhone || phone}`} target="_blank" rel="noreferrer">inspector-escorte.com</a>
            </span>
          ) : 'Pot sa fie mai multe care încă nu au fost analizate.'}
        </span>
      </p>

      <div className={styles.contentContainer} data-wwid="content">
        {adsData && <AdsList adsData={adsData} sectionBreaks={sectionBreaks} />}
        {errors && errors.length > 0 && errors.map((error, index) => (
          <ErrorDisplay key={index} errorMessage={error} dataWwId="load-error" />
        ))}
        {!isLoading && (hasMore || isLoadingMore) && (
          <div className={styles.loadMoreContainer}>
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={onLoadMore}
              disabled={isLoadingMore}
              data-wwid="load-more"
            >
              {isLoadingMore ? 'Se încarcă...' : `încarcă mai multe (+${nextChunk})`}
            </button>
          </div>
        )}
      </div>

      {hideReasonSelector}
    </GeneralModal>
  );
};

export default AdsModal;
