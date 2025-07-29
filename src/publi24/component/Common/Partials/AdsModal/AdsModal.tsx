import React, {ChangeEventHandler, MouseEventHandler} from 'react';
import Modal from '../../../../../common/components/Modal/Modal';
import ContentModal from '../../Modal/ContentModal';
import AdsList from '../AdList/AdsList';
import styles from './AdsModal.module.scss';
import {AdData} from "../../../../core/adData";

type AdsModalProps = {
  close: () => void;
  title?: string | React.ReactNode;
  onHideAll?: MouseEventHandler;
  onInputChange?: ChangeEventHandler;
  phone?: string;
  removed?: number;
  adsData: AdData[] | null;
  hideReasonSelector?: React.ReactNode;
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
}) => {
  return (
    <Modal
      close={close}
      dataWwid="ads-modal"
    >
      <ContentModal
        title={title}
        onClose={close}
        headerActions={
          !hideReasonSelector && onHideAll && <button
            type="button"
            className={styles.hideAllButton}
            onClick={onHideAll}
            data-wwid="hide-all"
          >
            <b>ascunde toate</b>
          </button>
        }
        color={'#1177bb'}
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
            Rezultate: <span data-wwid="count">{adsData ? adsData.length : '...'}</span>
          </strong>
          {(removed && removed > 0) ? (
            <span className={styles.removedInfo}>
              ({removed} {removed > 1 ? 'anunțuri' : 'anunț'} nu mai există)
            </span>
          ) : null}
          <span className={styles.infoText}>
            Pot sa fie mai multe care încă nu au fost analizate.
          </span>
        </p>

        <div className={styles.contentContainer} data-wwid="content">
          {adsData && <AdsList adsData={adsData} />}
        </div>

        {hideReasonSelector}
      </ContentModal>
    </Modal>
  );
};

export default AdsModal;
