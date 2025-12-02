import React from 'react';
import styles from './ErrorDisplay.module.scss';

interface ErrorDisplayProps {
  errorMessage: string;
  dataWwId?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage, dataWwId }) => {
  return (
    <div className={styles.errorContainer} data-wwid={dataWwId}>
      <div className={styles.errorIcon}>!</div>
      <span className={styles.errorText}>{errorMessage}</span>
    </div>
  );
};

export default ErrorDisplay;
