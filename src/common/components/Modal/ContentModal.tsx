import React, { ReactNode } from 'react';
import styles from './ContentModal.module.scss';
import {CloseIcon} from "../Icons/CloseIcon";

type ContentModalProps = {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
  color?: string;
  title: string | ReactNode;
  headerActions?: ReactNode;
};

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
        <h2 className={styles.headerTitle} style={color ? {background: color} : undefined}>
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
        <div className={styles.topBorder} style={color ? {background: color} : undefined}></div>
        <div className={styles.contentPadding}>
          {children}
        </div>
      </div>
    </>
  );
};

export default ContentModal;
