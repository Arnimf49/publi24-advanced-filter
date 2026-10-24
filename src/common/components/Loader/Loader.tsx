import React, {FC, useId} from "react";
import styles from "./Loader.module.scss";

interface LoaderProps {
  color?: string;
  classes?: string;
}

// One wave period is 30px wide. Four copies of it tile the 60px viewport plus the
// 30px that scrolls in, so the wave can travel continuously without a visible seam.
const FLAT_PATH =
  "M0 4.5 C2.5 4.5 5 4.5 7.5 4.5 C10 4.5 12.5 4.5 15 4.5 C17.5 4.5 20 4.5 22.5 4.5 C25 4.5 27.5 4.5 30 4.5";

export const Loader: FC<LoaderProps> =
({
  color,
  classes
}) => {
  const waveId = `wwLoaderWave-${useId().replace(/:/g, '')}`;

  return (
    <div
      className={`${styles.loaderAnimation} ${classes}`}
      data-wwid="loader"
      style={color ? {color} : {}}
    >
      <svg className={styles.wave} viewBox="0 0 60 9" aria-hidden="true" focusable="false">
        <defs>
          <path id={waveId} className={styles.path} d={FLAT_PATH}/>
        </defs>
        <g className={styles.traveller}>
          <use href={`#${waveId}`}/>
          <use href={`#${waveId}`} x="30"/>
          <use href={`#${waveId}`} x="60"/>
          <use href={`#${waveId}`} x="90"/>
        </g>
      </svg>
    </div>
  )
}
