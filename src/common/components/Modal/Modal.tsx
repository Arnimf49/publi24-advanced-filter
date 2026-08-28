import React, {ReactNode, useEffect} from 'react';
import styles from './Modal.module.scss';
import * as ReactDOM from "react-dom";

type ModalProps = {
  children: ReactNode,
  close: () => void;
  scroll?: boolean;
  inline?: boolean;
  mobileContentOverlay?: boolean;
  dataWwid?: string;
  onCleanup?: () => void;
};

let MODALS_OPEN = 0;

const Modal: React.FC<ModalProps> =
({
  children,
  close,
  scroll = true,
  inline = false,
  mobileContentOverlay = false,
  dataWwid,
  onCleanup,
}) => {
  useEffect(() => {
    const currentModalIndex = inline ? MODALS_OPEN : ++MODALS_OPEN;
    const shouldResetScroll = !inline && mobileContentOverlay && document.body.classList.contains('onMobile');
    const initialScrollY = shouldResetScroll ? window.scrollY : 0;

    if (!inline) {
      if (shouldResetScroll) {
        window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
      }

      document.body.style.overflow = 'hidden';
      window.history.pushState({ modalIndex: currentModalIndex }, '');
    }
    let closedByPopstate = false;

    const closeOnKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && (inline || currentModalIndex === MODALS_OPEN)) {
        close();
      }
    };

    const handlePopState = (): void => {
      if (!inline && currentModalIndex === MODALS_OPEN) {
        closedByPopstate = true;
        close();
      }
    };

    window.addEventListener('keydown',  closeOnKey);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', closeOnKey);
      window.removeEventListener('popstate', handlePopState);

      if (!inline && !closedByPopstate) {
        window.history.back();
      }

      setTimeout(() => {
        if (inline) {
          return;
        }

        --MODALS_OPEN;
        if (!MODALS_OPEN) {
          document.body.style.overflow = 'initial';
        }

        if (shouldResetScroll) {
          window.scrollTo({ left: 0, top: initialScrollY, behavior: 'instant' });
        }

        onCleanup?.()
      }, 10);
    }
  }, []);

  const modal = (
    <div
      className={`${styles.modalContainer} ${scroll ? styles.scroll : ''} ${inline ? styles.inline : ''} ${mobileContentOverlay ? styles.mobileContentOverlay : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        close();
      }}
      data-wwid={dataWwid}
      data-inline={inline ? 'true' : undefined}
    >
      {children}
    </div>
  );

  return inline ? modal : ReactDOM.createPortal(modal, document.body);
};

export default Modal;
