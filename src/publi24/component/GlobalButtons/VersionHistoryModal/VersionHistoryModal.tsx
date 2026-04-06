import React from 'react';
import GeneralModal from '../../Common/Modal/GeneralModal';
import VersionNotes from '../../../../common/components/VersionNotes/VersionNotes';
import { versionHistory } from '../../../data/versionHistory';
import {misc} from '../../../core/misc';

type VersionHistoryModalProps = {
  onClose: () => void;
};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ onClose }) => {
  const separatorColor = misc.getPubliTheme() === 'dark' ? 'rgb(60, 84, 123)' : '#555';

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
            separatorColor={separatorColor}
          />
        ))}
      </>
    </GeneralModal>
  );
};

export default VersionHistoryModal;
