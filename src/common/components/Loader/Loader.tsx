import React, {FC, useId} from "react";
import {IS_SAFARI_IOS} from "../../globals";
import styles from "./Loader.module.scss";

interface LoaderProps {
  color?: string;
  classes?: string;
}

// One wave period is 30px wide. Four copies of it tile the 60px viewport plus the
// 30px that scrolls in, so the wave can travel continuously without a visible seam.
const FLAT_PATH =
  "M0 4.5 C2.5 4.5 5 4.5 7.5 4.5 C10 4.5 12.5 4.5 15 4.5 C17.5 4.5 20 4.5 22.5 4.5 C25 4.5 27.5 4.5 30 4.5";
const WAVE_PATH =
  "M0 4.5 C2.5 6.0708 5 7.5 7.5 7.5 C10 7.5 12.5 6.0708 15 4.5 C17.5 2.9292 20 1.5 22.5 1.5 C25 1.5 27.5 2.9292 30 4.5";

export const Loader: FC<LoaderProps> =
({
  color,
  classes
}) => {
  const waveId = `wwLoaderWave-${useId().replace(/:/g, '')}`;
  // WebKit cannot animate the CSS `d` property, so iOS gets a pre-shaped wave
  // and relies on the horizontal travel animation. Everywhere else keep the
  // original flat path and let the amplitude keyframes do the work.
  const basePath = IS_SAFARI_IOS ? WAVE_PATH : FLAT_PATH;

  return (
    <div
      className={`${styles.loaderAnimation} ${classes}`}
      data-wwid="loader"
      style={color ? {color} : {}}
    >
      <svg className={styles.wave} viewBox="0 0 60 9" aria-hidden="true" focusable="false">
        <defs>
          <path id={waveId} className={styles.path} d={basePath}/>
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
