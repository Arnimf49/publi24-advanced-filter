import React from 'react';
import GeneralModal from '../Modal/GeneralModal';
import VersionNotes from '../VersionNotes/VersionNotes';

type VersionData = {
  version: string;
  releaseDate: string;
  changeNew?: string[];
  changeImprove?: string[];
  changeFix?: string[];
};

type VersionHistoryModalProps = {
  onClose: () => void;
  versionHistory: VersionData[];
};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ onClose, versionHistory }) => {
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
