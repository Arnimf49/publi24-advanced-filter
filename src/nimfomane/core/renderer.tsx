import * as ReactDOM from "react-dom/client";
import React from "react";
import {TopicImageRoot} from "../component/TopicImage/TopicImageRoot";
import {ProfilePanel} from "../component/ProfilePanel/ProfilePanel";
import {profileActions} from "./profileActions";
import {NimfomaneStorage} from "./storage";
import {PanelRoot} from "../component/Panel/PanelRoot";
import {analyzer} from "./analyzer";
import {IS_MOBILE_VIEW} from "../../common/globals";
import GlobalButtonsRoot from "../component/GlobalButtons/GlobalButtonsRoot";

interface RegisterTopicItemsOptions {
  applyFocusMode?: boolean;
  isFromListing?: boolean;
}

function updateHiddenCountIndicator(list: HTMLElement, count: number) {
  let indicator = list.querySelector<HTMLLIElement>('li[data-wwid="hidden-count-indicator"]');

  if (!count) {
    indicator?.remove();
    return;
  }

  if (!indicator) {
    indicator = document.createElement('li');
    indicator.setAttribute('data-wwid', 'hidden-count-indicator');
    indicator.style.textAlign = 'center';
    indicator.style.padding = '20px';
    indicator.style.color = '#999';
    indicator.style.fontWeight = 'bold';
    list.appendChild(indicator);
  }

  indicator.textContent = `${count} ${count === 1 ? 'topic ascuns' : 'topice ascunse'} de tot`;
}

function getFocusModeTopicHiddenState(id: string) {
  const topic = NimfomaneStorage.getTopic(id);
  const escortUser = topic.isOfEscort ? topic.ownerUser : null;

  return escortUser
    ? !!NimfomaneStorage.getEscort(escortUser).hidden
    : !!topic.hidden;
}

export const renderer = {
  renderGlobalButtons() {
    const globalButtonsContainer = document.createElement('div');

    if (IS_MOBILE_VIEW) {
      const bottomNav = document.querySelector<HTMLElement>('.focus-mobile-footer')!;
      bottomNav.appendChild(globalButtonsContainer);
      bottomNav.style.overflow = 'initial';
    } else {
      document.body.appendChild(globalButtonsContainer);
    }
    const globalButtonsRoot = ReactDOM.createRoot(globalButtonsContainer);
    globalButtonsRoot.render(<GlobalButtonsRoot />);
  },

  registerProfilePanel(container: HTMLDivElement, user: string) {
    profileActions.determineEscort();

    const hideReasonContainer = document.createElement('div');
    hideReasonContainer.setAttribute('data-wwid', 'hide-reason-container');
    container.appendChild(hideReasonContainer);
    container.style.position = 'relative';

    const panelContainer = document.createElement('div');
    const root = ReactDOM.createRoot(panelContainer);
    root.render(<ProfilePanel user={user} container={container}/>);
    container.appendChild(panelContainer);
  },

  registerTopicItem(container: HTMLDivElement, id: string, index: number) {
    let priority = 90 - index * 2;

    const isTestMode = window.localStorage.getItem('_pw_init_nimfo') === 'true';
    if (isTestMode && id === '174418') {
      priority = 200;
    }

    const url = container.querySelector<HTMLLinkElement>('.ipsDataItem_title [data-ipshover]')!.getAttribute('href')!
      .replace(/\?.+$/, '');
    NimfomaneStorage.setTopicProp(id, 'url', url);

    container.setAttribute('data-wwtopic', id);

    analyzer.analyzeTopic(container, id, priority).catch(console.error);

    const unmountImage = renderer.renderTopicImage(container, id);
    const unmountPanel = renderer.renderTopicPanel(container, id);

    const cleanup = () => {
      clearInterval(interval);
      unmountImage();
      unmountPanel();
    };

    const interval = setInterval(() => {
      if (!document.contains(container)) {
        cleanup();
      }
    }, 2000);

    return cleanup;
  },

  registerTopicItems(
    context: HTMLElement | Document,
    {applyFocusMode = false, isFromListing = false}: RegisterTopicItemsOptions = {}
  ): Array<() => void> {
    const list = context.querySelector<HTMLElement>('.ipsDataList.cForumTopicTable');
    const topicContainers = Array.from(context.querySelectorAll<HTMLDivElement>('[data-rowid]'));
    let hiddenCount = 0;

    const visibleTopicContainers = topicContainers.filter((container) => {
      if (!applyFocusMode || !NimfomaneStorage.isFocusMode()) {
        container.style.display = '';
        return true;
      }

      const id = container.getAttribute('data-rowid');
      if (!id) {
        console.error('Topic container missing data-rowid', container);
        return false;
      }

      if (getFocusModeTopicHiddenState(id)) {
        container.style.display = 'none';
        hiddenCount++;
        return false;
      }

      container.style.display = '';
      return true;
    });

    if (list && isFromListing) {
      updateHiddenCountIndicator(list, hiddenCount);
    }

    return visibleTopicContainers.map((container, index) => {
      if (container.hasAttribute('data-wwtopic')) {
        return () => {};
      }

      const id = container.getAttribute('data-rowid');
      if (!id) {
        console.error('Topic container missing data-rowid', container);
        return () => {};
      }

      try {
        return renderer.registerTopicItem(container, id, index);
      } catch (error) {
        console.error(`Failed to register topic item ${id}:`, error);
        return () => {};
      }
    });
  },

  renderTopicImage(container: HTMLDivElement, id: string): () => void {
    const imageContainer = document.createElement('div');
    const root = ReactDOM.createRoot(imageContainer);
    root.render(<TopicImageRoot id={id}/>);

    const mainDataContainer = container.querySelector('.ipsDataItem_main, .ipsTopicSnippet__top');
    if (mainDataContainer) {
      container.insertBefore(imageContainer, mainDataContainer);
      container.classList.add('ww_topic_image_registered');
    } else {
      console.error('Main data container not found');
    }

    return () => root.unmount();
  },

  renderTopicPanel(container: HTMLDivElement, id: string): () => void {
    const panelContainer = document.createElement('div');
    const root = ReactDOM.createRoot(panelContainer);

    const hideReasonContainer = document.createElement('div');
    hideReasonContainer.setAttribute('data-wwid', 'hide-reason-container');
    container.appendChild(hideReasonContainer);
    container.style.position = 'relative';

    root.render(<PanelRoot id={id} container={container}/>);

    if (IS_MOBILE_VIEW) {
      container.appendChild(panelContainer);
    } else {
      const mainDataContainer = container.querySelector('.ipsDataItem_main, .ipsTopicSnippet__top');
      if (mainDataContainer) {
        mainDataContainer.appendChild(panelContainer);
      } else {
        console.error('Main data container not found');
      }
    }

    return () => root.unmount();
  }
}
