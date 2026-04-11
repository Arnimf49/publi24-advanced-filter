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
  onCleanup?: () => void;
  prose?: boolean;
};

const GeneralModal: React.FC<GeneralModalProps> =
({
  children,
  maxWidth = 1000,
  onClose,
  title,
  headerActions,
  dataWwid = "general-modal",
  onCleanup,
  prose = true,
}) => {
  return (
    <Modal close={onClose} dataWwid={dataWwid} onCleanup={onCleanup}>
      <ContentModal
        title={title}
        onClose={onClose}
        maxWidth={maxWidth}
        headerActions={headerActions}
      >
        <div className={prose ? `${styles.generalModal} ${styles.prose}` : styles.generalModal}>
          {children}
        </div>
      </ContentModal>
    </Modal>
  );
};

export default GeneralModal;
