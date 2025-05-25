import * as ReactDOM from "react-dom/client";
import {TopicImageRoot} from "../component/TopicImage/TopicImageRoot";
import {ProfileImages} from "../component/ProfileImages/ProfileImages";

export const renderer = {
  registerTopicItem(container: HTMLDivElement, id: string) {
    const imageContainer = document.createElement('div');
    const root = ReactDOM.createRoot(imageContainer);
    root.render(<TopicImageRoot id={id} container={container}/>);

    const mainDataContainer = container.querySelector('.ipsDataItem_main');
    if (mainDataContainer) {
      container.insertBefore(imageContainer, mainDataContainer);
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
    const buttonContainer = document.createElement('div');
    const root = ReactDOM.createRoot(buttonContainer);
    root.render(<ProfileImages user={user}/>);
    container.appendChild(buttonContainer);
  }
}
