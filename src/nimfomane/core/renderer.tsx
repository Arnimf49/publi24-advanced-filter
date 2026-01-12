import * as ReactDOM from "react-dom/client";
import React from "react";
import {TopicImageRoot} from "../component/TopicImage/TopicImageRoot";
import {ProfileImages} from "../component/ProfileImages/ProfileImages";
import {profileActions} from "./profileActions";

export const renderer = {
  registerTopicItem(container: HTMLDivElement, id: string, index: number) {
    const priority = 90 - index * 2;
    const imageContainer = document.createElement('div');
    const root = ReactDOM.createRoot(imageContainer);
    root.render(<TopicImageRoot id={id} container={container} priority={priority}/>);


    const mainDataContainer = container.querySelector('.ipsDataItem_main, .ipsTopicSnippet__top');
    if (mainDataContainer) {
      container.insertBefore(imageContainer, mainDataContainer);
      container.classList.add('ww_topic_image_registered');
    } else {
      console.error('Main data container not found');
    }

    const interval = setInterval(() => {
      if (!document.contains(container)) {
        clearInterval(interval);
        root.unmount();
      }
    }, 2000);
  },

  registerProfileImages(container: HTMLDivElement, user: string) {
    profileActions.determineEscort();

    const buttonContainer = document.createElement('div');
    const root = ReactDOM.createRoot(buttonContainer);
    root.render(<ProfileImages user={user}/>);
    container.appendChild(buttonContainer);
  }
}
