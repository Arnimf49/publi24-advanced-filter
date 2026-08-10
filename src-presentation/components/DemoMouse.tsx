import React from 'react';
import styles from './DemoMouse.module.scss';

type DemoMouseProps = {
  x: number;
  y: number;
  isClicking?: boolean;
};

const DemoMouse: React.FC<DemoMouseProps> = ({x, y, isClicking = false}) => (
  <svg
    className={`${styles.mouse}${isClicking ? ` ${styles.clicking}` : ''}`}
    style={{
      '--mouse-x': `${x - 1.5}px`,
      '--mouse-y': `${y - 1.5}px`,
    } as React.CSSProperties}
    viewBox="0 0 25 31"
    aria-hidden="true"
  >
    <path
      d="M1.5 1.5v27l7.4-7.4 5.1 8.9 4.4-2.6-5.1-8.7h10.2z"
      fill="#ffffff"
      stroke="#111111"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

export default DemoMouse;
