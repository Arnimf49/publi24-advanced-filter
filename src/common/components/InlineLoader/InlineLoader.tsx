import React, {CSSProperties, FC} from "react";
import styles from "./InlineLoader.module.scss";

interface InlineLoaderProps {
  color?: string;
  trackColor?: string;
  size?: number;
  spinning?: boolean;
  style?: CSSProperties;
}

export const InlineLoader: FC<InlineLoaderProps> =
({
  color,
  trackColor,
  size = 12,
  spinning = true,
  style,
}) => {
  const spinnerTrackColor = trackColor ?? 'var(--ww-inline-loader-track, rgba(0, 0, 0, 0.1))';
  const spinnerColor = color ?? 'var(--ww-inline-loader-color, #888)';

  return (
    <div
      className={`${styles.spinner} ${!spinning ? styles.idle : ''}`}
      data-spinning={spinning || undefined}
      data-wwid="inline-loader"
      style={{
        width: size,
        height: size,
        borderColor: spinnerTrackColor,
        borderTopColor: spinning ? spinnerColor : spinnerTrackColor,
        ...style,
      }}
    ></div>
  )
}
