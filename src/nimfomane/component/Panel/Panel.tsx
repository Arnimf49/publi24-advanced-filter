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
      {!!phone && <WhatsAppButton
        phone={phone}
        className={styles.whatsapp}
        size={20}
      />}
      <HideButton
        visible={visible}
        onClick={onHideClick}
        size={20}
        className={styles.hideButton}
      />
      {!visible && hiddenReason && (
        <span className={styles.hideReason} data-wwid="hide-reason">
          motiv: <b>{hiddenReason}</b>
        </span>
      )}
    </div>
  );
};
