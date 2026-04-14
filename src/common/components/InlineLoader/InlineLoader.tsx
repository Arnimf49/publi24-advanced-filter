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
  color = "#888",
  trackColor,
  size = 12,
  spinning = true,
  style,
}) => {
  return (
    <div
      className={`${styles.spinner} ${!spinning ? styles.idle : ''}`}
      data-spinning={spinning || undefined}
      data-wwid="inline-loader"
      style={{
        width: size,
        height: size,
        borderColor: trackColor ?? `rgba(0,0,0,0.1)`,
        borderTopColor: spinning ? color : (trackColor ?? `rgba(0,0,0,0.1)`),
        ...style,
      }}
    ></div>
  )
}
