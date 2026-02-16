import React, { ReactNode } from 'react';
import Modal from '../../../../common/components/Modal/Modal';
import ContentModal from '../../../../common/components/Modal/ContentModal';
import {misc} from '../../../core/misc';
import styles from './GeneralModal.module.scss';

type GeneralModalProps = {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
  title: string | ReactNode;
  headerActions?: ReactNode;
  dataWwid?: string;
};

const GeneralModal: React.FC<GeneralModalProps> =
({
  children,
  maxWidth = 1000,
  onClose,
  title,
  headerActions,
  dataWwid = "general-modal",
}) => {
  const headerColor = misc.getPubliTheme() === 'dark' ? '#485e71' : '#7a8a99';

  return (
    <Modal close={onClose} dataWwid={dataWwid}>
      <ContentModal
        title={title}
        onClose={onClose}
        maxWidth={maxWidth}
        color={headerColor}
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
