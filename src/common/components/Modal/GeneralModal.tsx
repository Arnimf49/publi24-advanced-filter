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
  inline?: boolean;
  color?: string;
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
  inline = false,
  color,
}) => {
  return (
    <Modal close={onClose} dataWwid={dataWwid} inline={inline} onCleanup={onCleanup}>
      <ContentModal
        title={title}
        onClose={onClose}
        maxWidth={maxWidth}
        headerActions={headerActions}
        color={color}
      >
        <div className={prose ? `${styles.generalModal} ${styles.prose}` : styles.generalModal}>
          {children}
        </div>
      </ContentModal>
    </Modal>
  );
};

export default GeneralModal;
