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
};

export const Panel: React.FC<PanelProps> = ({ phone, visible, hiddenReason, isEscort, isFav, onHideClick, onFavClick }) => {
  return (
    <div className={styles.panel}>
      <div className={styles.buttons}>
        {!!phone && <WhatsAppButton
          phone={phone}
          className={styles.whatsapp}
          size={22}
        />}
        <HideButton
          visible={visible}
          onClick={onHideClick}
          size={22}
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
      </div>
      {!visible && hiddenReason && (
        <span className={styles.hideReason} data-wwid="hide-reason">
          ascuns, motiv: <b>{hiddenReason}</b>
        </span>
      )}
    </div>
  );
};
