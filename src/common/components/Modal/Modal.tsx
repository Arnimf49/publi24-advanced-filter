import React, {ReactNode, useEffect} from 'react';
import styles from './Modal.module.scss';
import * as ReactDOM from "react-dom";
import {misc} from "../../../publi24/core/misc";

type ModalProps = {
  children: ReactNode,
  close: () => void;
  scroll?: boolean;
  dataWwid?: string;
};

let MODALS_OPEN = 0;

const Modal: React.FC<ModalProps> =
({
  children,
  close,
  scroll = true,
  dataWwid,
}) => {
  useEffect(() => {
    const currentModalIndex = ++MODALS_OPEN;
    document.body.style.overflow = 'hidden';
    let closedByPopstate = false;

    window.history.pushState({ modalIndex: currentModalIndex }, '');

    const closeOnKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && currentModalIndex === MODALS_OPEN) close();
    };

    const handlePopState = (): void => {
      if (currentModalIndex === MODALS_OPEN) {
        closedByPopstate = true;
        close();
      }
    };

    window.addEventListener('keydown',  closeOnKey);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', closeOnKey);
      window.removeEventListener('popstate', handlePopState);

      if (!closedByPopstate) {
        window.history.back();
      }

      setTimeout(() => {
        --MODALS_OPEN;
        if (!MODALS_OPEN) {
          document.body.style.overflow = 'initial';
        }
      }, 10);
    }
  }, []);

  return ReactDOM.createPortal(
    <div
      className={misc.cx(styles.modalContainer, scroll && styles.scroll)}
      onClick={close}
      data-wwid={dataWwid}
    >
      {children}
    </div>,
    document.body
  );
};

export default Modal;
