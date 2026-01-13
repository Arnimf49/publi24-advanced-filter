import React from 'react';
import GeneralModal from '../../Common/Modal/GeneralModal';
import VersionNotes from '../../Common/VersionNotes/VersionNotes';
import { versionHistory } from '../../../data/versionHistory';

type VersionHistoryModalProps = {
  onClose: () => void;
};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ onClose }) => {
  return (
    <GeneralModal
      title="Istoric verziuni"
      onClose={onClose}
      maxWidth={800}
      dataWwid="version-history-modal"
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
    </GeneralModal>
  );
};

export default VersionHistoryModal;
