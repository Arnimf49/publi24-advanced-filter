import React, {FC, MouseEventHandler, useState} from "react";
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
  id: string;
  loadError?: string | null;
}

export const TopicImage: FC<TopicImageProps> =
({id, url, user, isLoading, onClick, loadError}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`${classes.container} 
      ${onClick ? classes.clickable : ''}`}
      onClick={onClick}
      data-wwid="topic-image"
      data-wwuser={user}
      data-wwtopic={id}
    >
      {isLoading && !loadError ? <Loader color={'#555'} classes={classes.loader}/> : null}
      {typeof url === "string" && !hasError && !loadError
        ? <img
          className={classes.image}
          src={nimfomaneUtils.normalizeCmsUrl(url)}
          loading="lazy"
          onError={() => setHasError(true)}
        />
        : null}
      {url === null && !loadError ? <NoImageIcon/> : null}
      {(hasError || loadError) ? <ImageErrorIcon/> : null}
    </div>
  );
}
