import React from 'react';
import styles from './Panel.module.scss';
import {WhatsAppButton} from './Button/WhatsAppButton';
import {HideButton} from '../../../common/components/Button/HideButton';

type PanelProps = {
  phone?: string | false;
  visible: boolean;
  hiddenReason?: string;
  onHideClick: () => void;
};

export const Panel: React.FC<PanelProps> = ({ phone, visible, hiddenReason, onHideClick }) => {
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
      </div>
      {!visible && hiddenReason && (
        <span className={styles.hideReason} data-wwid="hide-reason">
          ascuns, motiv: <b>{hiddenReason}</b>
        </span>
      )}
    </div>
  );
};
