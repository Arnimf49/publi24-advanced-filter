import React, { ReactNode } from 'react';
import styles from './ContentModal.module.scss';

type ContentModalProps = {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
  color: string;
  title: string | ReactNode;
  headerActions?: ReactNode;
  isMobileView?: boolean;
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
  isMobileView = false,
}) => {
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const headerTitleClasses = `${styles.headerTitle} ${isMobileView ? styles.isMobile : styles.isDesktop}`;
  const containerClasses = `${styles.container} ${isMobileView ? styles.isMobile : styles.isDesktop}`;
  const contentPaddingClasses = `${styles.contentPadding} ${isMobileView ? styles.isMobile : ''}`;
  const headerActionsClasses = `${styles.headerActions} ${isMobileView ? styles.isMobile : ''}`;

  return (
    <>
      <div className={styles.header} style={{maxWidth: `${maxWidth}px`}}>
        <h2 className={headerTitleClasses} style={{background: color}}>
          {title}
        </h2>
        <div className={headerActionsClasses}>
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
        className={containerClasses}
        style={{maxWidth: `${maxWidth}px`, borderColor: color}}
        onClick={handleContainerClick}
      >
        <div className={styles.topBorder} style={{background: color}}></div>
        <div className={contentPaddingClasses}>
          {children}
        </div>
      </div>
    </>
  );
};

export default ContentModal;
