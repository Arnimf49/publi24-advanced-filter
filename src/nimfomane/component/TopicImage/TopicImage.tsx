import React, {FC, MouseEventHandler} from "react";
import classes from "./TopicImage.module.scss";
import {Loader} from "../../../common/components/Loader/Loader";
import {NoImageIcon} from "./NoImageIcon";

interface TopicImageProps {
  url?: string | null;
  isLoading?: boolean;
  onClick?: MouseEventHandler;
  user?: string;
  id: string;
}

export const TopicImage: FC<TopicImageProps> =
({id, url, user, isLoading, onClick}) => {
  return (
    <div
      className={`${classes.container} 
      ${onClick ? classes.clickable : ''}`}
      onClick={onClick}
      data-wwid="topic-image"
      data-wwuser={user}
      data-wwtopic={id}
    >
      {isLoading ? <Loader color={'#555'} classes={classes.loader}/> : null}
      {typeof url === "string" ? <img className={classes.image} src={url}/> : null}
      {url === null ? <NoImageIcon/> : null}
    </div>
  );
}
