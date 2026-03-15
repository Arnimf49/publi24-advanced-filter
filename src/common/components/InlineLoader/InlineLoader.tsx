import React, {FC} from "react";
import styles from "./InlineLoader.module.scss";

interface InlineLoaderProps {
  color?: string;
  size?: number;
}

export const InlineLoader: FC<InlineLoaderProps> =
({
  color = "#888",
  size = 12
}) => {
  return (
    <div
      className={styles.spinner}
      data-wwid="inline-loader"
      style={{
        width: size,
        height: size,
        borderColor: `rgba(0,0,0,0.1)`,
        borderTopColor: color
      }}
    ></div>
  )
}
