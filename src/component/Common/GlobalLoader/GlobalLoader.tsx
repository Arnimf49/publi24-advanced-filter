import React, {useEffect} from 'react';
import styles from './GlobalLoader.module.scss';

type GlobalLoaderProps = {
  message?: string;
};

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ message }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'initial';
    }
  }, []);

  return (
    <div
      className={styles.loaderOverlay}
      data-wwid="loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.backdrop}></div>
      <div className={styles.loaderAnimation}></div>
      {message && (
        <div className={styles.loaderMessage} data-wwid="ww-loader-message">
          {message}
        </div>
      )}
    </div>
  );
};

export default GlobalLoader;
