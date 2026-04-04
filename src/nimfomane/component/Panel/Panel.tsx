import React from 'react';
import styles from './Panel.module.scss';
import {WhatsAppButton} from './Button/WhatsAppButton';
import {HideButton} from '../../../common/components/Button/HideButton';
import {StarIcon} from '../../../common/components/Icons/StarIcon';

type PanelProps = {
  phone?: string | false;
  visible: boolean;
  hiddenReason?: string;
  isEscort?: boolean;
  isFav?: boolean;
  onHideClick: () => void;
  onFavClick?: () => void;
  onShowImages?: () => void;
  fullWidth?: boolean;
};

export const Panel: React.FC<PanelProps> = ({ phone, visible, hiddenReason, isEscort, isFav, onHideClick, onFavClick, onShowImages, fullWidth }) => {
  return (
    <div className={`${styles.panel} ${fullWidth ? styles.panelFullWidth : ''}`}>
      <div className={styles.buttons}>
        <HideButton
          visible={visible}
          onClick={onHideClick}
          size={24}
          className={styles.hideButton}
        />
        {isEscort && onFavClick && (
          <button
            title={isFav ? "Șterge din favorite" : "Adaugă la favorite"}
            className={`${styles.favButton} ${isFav ? styles.favButtonOn : styles.favButtonOff}`}
            onClick={onFavClick}
            data-wwid="fav-toggle"
            data-wwstate={isFav ? "on" : "off"}
          >
            <StarIcon
              fill={isFav ? "#fefefe" : "none"}
              stroke={isFav ? "none" : "#333"}
              strokeWidth={2}
            />
          </button>
        )}
        {!!phone && <WhatsAppButton
          phone={phone}
          className={styles.whatsapp}
          size={25}
        />}
        {onShowImages && (
          <button
            className={styles.openPhotosButton}
            onClick={onShowImages}
            data-wwid="all-photos-button"
          >
            Deschide pozele
          </button>
        )}
      </div>
      {!visible && hiddenReason && (
        <span className={styles.hideReason} data-wwid="hide-reason">
          ascuns, motiv: <b>{hiddenReason}</b>
        </span>
      )}
    </div>
  );
};
