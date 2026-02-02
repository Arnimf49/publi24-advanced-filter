import React, {FC, MouseEventHandler, useEffect, useState} from "react";
import classes from "./TopicImage.module.scss";
import {Loader} from "../../../common/components/Loader/Loader";
import {NoImageIcon} from "./NoImageIcon";
import {ImageErrorIcon} from "./ImageErrorIcon";
import {nimfomaneUtils} from "../../core/nimfomaneUtils";

interface TopicImageProps {
  url?: string | null;
  isLoading?: boolean;
  onClick?: MouseEventHandler;
  user?: string;
  loadError?: string | null;
  publiLink?: string | false;
}

export const TopicImage: FC<TopicImageProps> =
({url, user, isLoading, onClick, loadError, publiLink}) => {
  const [hasError, setHasError] = useState(false);

  const handlePubliLinkClick = () => {
    if (publiLink && typeof publiLink === 'string') {
      window.open(publiLink, '_blank');
    }
  };

  useEffect(() => {
    setHasError(false);
  }, [url]);

  const handleClick = publiLink && typeof publiLink === 'string' ? handlePubliLinkClick : onClick;

  return (
    <div
      className={`${classes.container} 
      ${(onClick || publiLink) ? classes.clickable : ''}
      ${publiLink && typeof publiLink === 'string' ? classes.publiContainer : ''}`}
      onClick={handleClick}
      data-wwid="topic-image"
      data-wwuser={user}
    >
      {isLoading && !loadError ? <Loader color={'#555'} classes={classes.loader}/> : null}
      {typeof url === "string" && !hasError && !loadError
        ? <>
          <img
            className={classes.imageBg}
            src={nimfomaneUtils.normalizeCmsUrl(url)}
            loading="lazy"
          />
          <img
            className={classes.image}
            src={nimfomaneUtils.normalizeCmsUrl(url)}
            loading="lazy"
            onError={() => setHasError(true)}
            data-wwid="topic-image-img"
          />
        </>
        : null}
      {url === null && !loadError && !publiLink && !isLoading ? <NoImageIcon/> : null}
      {(hasError || loadError) ? <ImageErrorIcon/> : null}
      {publiLink && typeof publiLink === 'string' && (
        <div className={classes.publiLink} data-wwid="publi24-link">
          <span className={classes.publiText}>publi</span>
          <span className={classes.publiNumber}>24</span>
          <span className={classes.publiText}>.ro</span>
        </div>
      )}
    </div>
  );
}
