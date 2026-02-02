import React from 'react';
import styles from './Panel.module.scss';
import {WhatsAppButton} from '../../../common/components/Button/WhatsAppButton';

type PanelProps = {
  phone?: string | false;
};

export const Panel: React.FC<PanelProps> = ({ phone }) => {
  if (!phone) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <WhatsAppButton
        phone={phone}
        className={styles.whatsapp}
        fill="#7bcb32"
        stroke="#fff"
      />
    </div>
  );
};
