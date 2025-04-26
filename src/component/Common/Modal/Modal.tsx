import React, {ReactNode, useEffect} from 'react';
import styles from './Modal.module.scss';
import * as ReactDOM from "react-dom";
import {misc} from "../../../core/misc";

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
   dataWwid
}) => {
  useEffect(() => {
    const currentModalIndex = ++MODALS_OPEN;
    document.body.style.overflow = 'hidden';

    const closeOnKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && currentModalIndex === MODALS_OPEN) close();
    };
    window.addEventListener('keydown',  closeOnKey);

    return () => {
      window.removeEventListener('keydown', closeOnKey);
      --MODALS_OPEN;

      if (!MODALS_OPEN) {
        document.body.style.overflow = 'initial';
      }
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
