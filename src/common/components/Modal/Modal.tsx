import React, {ReactNode, useEffect, useRef} from 'react';
import styles from './Modal.module.scss';
import * as ReactDOM from "react-dom";
import {utils} from '../../utils';

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
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const currentModalIndex = ++MODALS_OPEN;
    const shouldResetScroll = !inline && mobileContentOverlay && document.body.classList.contains('onMobile');
    const parent = utils.getScrollParent(anchorRef.current, false);
    const initialScrollY = shouldResetScroll ? utils.getScrollTop(parent) : 0;
    let scrollRestoreTimeout: number | undefined;

    if (!inline) {
      window.history.pushState({ modalIndex: currentModalIndex }, '');

      if (shouldResetScroll) {
        utils.scrollTo(parent, 0);
        scrollRestoreTimeout = window.setTimeout(() => {
          utils.scrollTo(parent, initialScrollY);
        }, 10);
      }

      document.body.style.overflow = 'hidden';
    }
    let closedByPopstate = false;

    const closeOnKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && currentModalIndex === MODALS_OPEN) {
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

      if (scrollRestoreTimeout !== undefined) {
        window.clearTimeout(scrollRestoreTimeout);
      }

      if (!inline && !closedByPopstate) {
        window.history.back();
      }

      setTimeout(() => {
        --MODALS_OPEN;
        if (!inline && !MODALS_OPEN) {
          document.body.style.overflow = 'initial';
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

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" style={{display: 'none'}} />
      {inline ? modal : ReactDOM.createPortal(modal, document.body)}
    </>
  );
};

export default Modal;
