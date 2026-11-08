import React, {useEffect, useRef, useState} from "react";
import styles from "./CopyButton.module.scss";
import {CheckIcon, CopyIcon} from "../Icons/CopyIcon";
import {utils} from "../../../../common/utils";

type CopyButtonProps = {
  getContent: () => {text: string; html?: string};
  dataWwid?: string;
  title?: string;
};

export const CopyButton: React.FC<CopyButtonProps> = ({
  getContent,
  dataWwid = 'copy-results',
  title = 'Copiază rezultatele',
}) => {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
  }, []);

  const handleClick = async () => {
    const {text, html} = getContent();
    const success = await utils.copyToClipboard(text, html);

    if (!success) {
      return;
    }

    setCopied(true);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
      title={copied ? 'Copiat!' : title}
      aria-label={copied ? 'Copiat' : title}
      data-wwid={dataWwid}
      data-wwstate={copied ? 'copied' : 'idle'}
      onClick={handleClick}
    >
      {copied ? <CheckIcon/> : <CopyIcon/>}
    </button>
  );
};
