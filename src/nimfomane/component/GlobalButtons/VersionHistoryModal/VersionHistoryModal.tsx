import React from 'react';
import Modal from '../../../../common/components/Modal/Modal';
import ContentModal from '../../../../common/components/Modal/ContentModal';
import VersionNotes from '../../../../common/components/VersionNotes/VersionNotes';
import { versionHistory } from '../../../data/versionHistory';

type VersionHistoryModalProps = {
  onClose: () => void;
};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ onClose }) => {
  return (
    <Modal
      close={onClose}
      dataWwid="version-history-modal"
    >
      <ContentModal
        title="Istoric verziuni"
        onClose={onClose}
        color="#7a8a99"
        maxWidth={800}
      >
        <>
          {versionHistory.map((version) => (
            <VersionNotes
              key={version.version}
              version={version.version}
              releaseDate={version.releaseDate}
              changeNew={version.changeNew}
              changeImprove={version.changeImprove}
              changeFix={version.changeFix}
            />
          ))}
        </>
      </ContentModal>
    </Modal>
  );
};

export default VersionHistoryModal;
