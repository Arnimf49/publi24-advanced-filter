import React, { ReactNode } from 'react';
import styles from './ContentModal.module.scss';

type ContentModalProps = {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
  color: string;
  title: string | ReactNode;
  headerActions?: ReactNode;
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2"/>
    <line x1="20" y1="4" x2="4" y2="20" strokeWidth="2"/>
  </svg>
);

const ContentModal: React.FC<ContentModalProps> =
({
  children,
  maxWidth = 1000,
  color,
  onClose,
  title,
  headerActions,
}) => {
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className={styles.header} style={{maxWidth: `${maxWidth}px`}}>
        <h2 className={styles.headerTitle} style={{background: color}}>
          {title}
        </h2>
        <div className={styles.headerActions}>
          {headerActions}
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            data-wwid="close"
            aria-label="Close Modal"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div
        className={styles.container}
        style={{maxWidth: `${maxWidth}px`, borderColor: color}}
        onClick={handleContainerClick}
      >
        <div className={styles.topBorder} style={{background: color}}></div>
        <div className={styles.contentPadding}>
          {children}
        </div>
      </div>
    </>
  );
};

export default ContentModal;
