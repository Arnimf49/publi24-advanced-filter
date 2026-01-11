import React, { ReactNode } from 'react';
import styles from './Code.module.scss';

type CodeProps = {
  children: ReactNode;
  status?: 'safe' | 'suspicious' | 'unsafe';
};

const Code: React.FC<CodeProps> = ({ children, status }) => {
  const className = status ? `${styles.code} ${styles[status]}` : styles.code;
  return <code className={className}>{children}</code>;
};

export default Code;
