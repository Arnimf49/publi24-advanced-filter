import React, { ReactNode } from 'react';
import Modal from './Modal';
import ContentModal from './ContentModal';
import styles from './GeneralModal.module.scss';

type GeneralModalProps = {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
  title: string | ReactNode;
  headerActions?: ReactNode;
  dataWwid?: string;
  color?: string;
  onCleanup?: () => void;
};

const GeneralModal: React.FC<GeneralModalProps> =
({
  children,
  maxWidth = 1000,
  onClose,
  title,
  headerActions,
  dataWwid = "general-modal",
  color = '#a78057',
  onCleanup,
}) => {
  return (
    <Modal close={onClose} dataWwid={dataWwid} onCleanup={onCleanup}>
      <ContentModal
        title={title}
        onClose={onClose}
        maxWidth={maxWidth}
        color={color}
        headerActions={headerActions}
      >
        <div className={styles.generalModal}>
          {children}
        </div>
      </ContentModal>
    </Modal>
  );
};

export default GeneralModal;
