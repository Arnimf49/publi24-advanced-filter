import React from 'react';
import styles from './VersionNotes.module.scss';

type VersionNotesProps = {
  version: string;
  releaseDate: string;
  changeNew?: string[];
  changeImprove?: string[];
  changeFix?: string[];
};

const VersionNotes: React.FC<VersionNotesProps> = ({
  version,
  releaseDate,
  changeNew = [],
  changeImprove = [],
  changeFix = [],
}) => {
  return (
    <div className={styles.versionNotes}>
      <div className={styles.header}>
        <h3 className={styles.version}>Versiunea {version}</h3>
        <span className={styles.releaseDate}>{releaseDate}</span>
      </div>
      
      {changeNew.length > 0 && (
        <div className={styles.changeSection}>
          <h4 className={styles.changeTitle}>NOU:</h4>
          <ul className={styles.changeList}>
            {changeNew.map((change, index) => (
              <li key={`new-${index}`}>{change}</li>
            ))}
          </ul>
        </div>
      )}
      
      {changeImprove.length > 0 && (
        <div className={styles.changeSection}>
          <h4 className={styles.changeTitle}>ÎMBUNĂTĂȚIRI:</h4>
          <ul className={styles.changeList}>
            {changeImprove.map((change, index) => (
              <li key={`improve-${index}`}>{change}</li>
            ))}
          </ul>
        </div>
      )}
      
      {changeFix.length > 0 && (
        <div className={styles.changeSection}>
          <h4 className={styles.changeTitle}>REMEDIERI:</h4>
          <ul className={styles.changeList}>
            {changeFix.map((change, index) => (
              <li key={`fix-${index}`}>{change}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VersionNotes;
