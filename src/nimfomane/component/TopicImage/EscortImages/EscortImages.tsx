import React, {FC, MouseEventHandler, Ref, useEffect, useState} from "react";
import type {Image} from "../../../core/escortActions";
import classes from './EscortImages.module.scss';
import {CloseIcon} from "../../../../publi24/component/Common/Icons/CloseIcon";
import {Loader} from "../../../../common/components/Loader/Loader";
import ErrorDisplay from "../../Common/ErrorDisplay/ErrorDisplay";
import {P24faLogoLight} from "../../../../common/components/Logo/P24faLogoLight";
import {P24faLogoDark} from "../../../../common/components/Logo/P24faLogoDark";
import {nimfomaneUtils} from "../../../core/nimfomaneUtils";
import {darkTheme} from "../../../core/darkTheme";

export interface EscortImagesProps {
  images: Image[];
  loading: boolean;
  ended: boolean;
  error: string | null;
  isMobile: boolean;
  escortName: string;
  profileUrl: string;
  onClose: MouseEventHandler;
  onLogoClick: () => void;
  containerRef?: Ref<HTMLDivElement>;
}

export const EscortImages: FC<EscortImagesProps> = ({
  images,
  loading,
  ended,
  error,
  isMobile,
  escortName,
  profileUrl,
  onClose,
  onLogoClick,
  containerRef,
}) => {
  const [isDark, setIsDark] = useState(() => darkTheme.isEnabled());
  const LogoComponent = isDark ? P24faLogoDark : P24faLogoLight;

  useEffect(() => darkTheme.onChange(setIsDark), []);

  const headerContent = (
    <div className={classes.header}>
      <div className={classes.headerLeft}>
        <LogoComponent onClick={onLogoClick} className={classes.logo} data-wwid="logo" />
        <a
          className={classes.escortName}
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          data-wwid="escort-image-name"
        >{escortName}</a>
      </div>
      <button type="button" className={classes.closeButton} onClick={onClose} data-wwid="close">
        <CloseIcon />
      </button>
    </div>
  );

  return (
    <div className={classes.container} data-wwid="escort-images">
      {!isMobile && headerContent}
      <div className={classes.content} ref={containerRef}>
        {!images.length && !loading && !error && <div className={classes.noImages}>Nu sunt poze</div>}
        {images.map((image, index) => (
          <div key={index} data-wwid="escort-image" className={classes.image_container}>
            <div className={classes.image_inner_container}>
              <div className={classes.image_wrapper}>
                <img
                  src={nimfomaneUtils.imageFullSize(nimfomaneUtils.normalizeCmsUrl(image.url))}
                  loading="lazy"
                  onClick={(event) => event.stopPropagation()}
                />
                <div className={classes.image_overlay}>
                  <div className={classes.image_date}>
                    {image.date}
                    {image.section && ` · ${image.section}`}
                  </div>
                  {image.topicUrl && (
                    <a
                      className={classes.image_topic}
                      href={image.topicUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >topic &gt;</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {error && (
          <div className={classes.errorWrapper}>
            <ErrorDisplay errorMessage={error} dataWwId="escort-images-error" />
          </div>
        )}
        {ended && images.length > 0 && <div className={classes.endMessage} data-wwid="escort-images-end">final listă poze</div>}
        {loading && <div><Loader classes={classes.loading} /></div>}
        <div className={classes.spacer} />
      </div>
      {isMobile && headerContent}
    </div>
  );
};
