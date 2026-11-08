import React from 'react';
import GeneralModal from '../Modal/GeneralModal';
import VersionNotes from '../VersionNotes/VersionNotes';
import styles from './VersionHistoryModal.module.scss';

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
  newVersions?: string[];
  variant?: 'publi24' | 'nimfomane';
};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  onClose,
  versionHistory,
  newVersions = [],
  variant = 'nimfomane',
}) => {
  const variantClass = variant === 'publi24' ? styles.publi24 : styles.nimfomane;

  return (
    <GeneralModal
      title="Istoric verziuni"
      onClose={onClose}
      maxWidth={800}
      dataWwid="version-history-modal"
    >
      <div className={variantClass}>
        {newVersions.length > 1 && (
          <div className={styles.newVersionsInfo} data-wwid="new-versions-info">
            {newVersions.length} verziuni noi: {newVersions.join(' / ')}
          </div>
        )}
        {versionHistory.map((version) => (
          <VersionNotes
            key={version.version}
            version={version.version}
            releaseDate={version.releaseDate}
            changeNew={version.changeNew}
            changeImprove={version.changeImprove}
            changeFix={version.changeFix}
            isNew={newVersions.includes(version.version)}
          />
        ))}
      </div>
    </GeneralModal>
  );
};

export default VersionHistoryModal;
