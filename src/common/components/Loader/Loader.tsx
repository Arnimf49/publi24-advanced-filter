import React, {FC} from "react";
import styles from "./Loader.module.scss";

interface LoaderProps {
  color?: string;
  classes?: string;
}

export const Loader: FC<LoaderProps> =
({
  color,
  classes
}) => {
  return (
    <div
      className={`${styles.loaderAnimation} ${classes}`}
      data-wwid="loader"
      style={color ? {
        // @ts-ignore
        '--c': `no-repeat linear-gradient(${color} 0 0)`
      } : {}}
    ></div>
  )
}
