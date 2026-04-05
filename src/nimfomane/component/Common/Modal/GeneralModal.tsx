import React, { ReactNode } from 'react';
import CommonGeneralModal from '../../../../common/components/Modal/GeneralModal';

type GeneralModalProps = {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
  title: string | ReactNode;
  headerActions?: ReactNode;
  dataWwid?: string;
  onCleanup?: () => void;
};

const GeneralModal: React.FC<GeneralModalProps> =
(props) => {
  return <CommonGeneralModal {...props} color="rgb(47, 73, 121)"/>;
};

export default GeneralModal;
