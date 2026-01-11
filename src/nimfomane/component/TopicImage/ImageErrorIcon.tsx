import React from "react"
import classes from "./ImageErrorIcon.module.scss";

export const ImageErrorIcon = () => {
  return (
    <div className={classes.errorContainer}>
      <svg
        height="32"
        viewBox="0 0 32 32"
        width="32"
        xmlns="http://www.w3.org/2000/svg"
        fill={'#c53030'}
        data-wwid="image-error-icon"
      >
        <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12-5.4 12-12 12z"/>
        <path d="M21.4 23L16 17.6 10.6 23 9 21.4l5.4-5.4L9 10.6 10.6 9l5.4 5.4L21.4 9l1.6 1.6-5.4 5.4 5.4 5.4z"/>
      </svg>
      <div className={classes.errorText}>error</div>
    </div>
  )
}
