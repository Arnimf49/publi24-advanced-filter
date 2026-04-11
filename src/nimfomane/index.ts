import {NimfomaneStorage} from "./core/storage";
import {IS_MOBILE_VIEW, IS_PROMOTER} from "../common/globals";
import {renderer} from "./core/renderer";
import {elementHelpers} from "./core/elementHelpers";
import {utils} from "../common/utils";
import {userId} from "../common/userId";
import {profileActions} from "./core/profileActions";

const IS_TOPIC_PAGE = window.location.pathname.match(/^\/forum\/topic\//);
const IS_PROFILE_PAGE = window.location.pathname.match(/^\/forum\/profile\//);

const waitForSiteLoad = () => new Promise<void>(resolve => {
  const interval = setInterval(() => {
    if (document.body && document.getElementById('ipsLayout_footer')) {
      clearInterval(interval);
      resolve();
    }
  }, 5);
});

const runWithObserver = (callback: () => any, changingContainerSelector: string) => {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && (mutation.addedNodes.length || mutation.removedNodes.length)) {
        callback();
        break;
      }
    }
  });

  callback();

  observer.observe(document.querySelector(changingContainerSelector)!, {
    childList: true,
    subtree: false
  });
}

NimfomaneStorage.upgrade()
  .then(waitForSiteLoad)
  .then(() => {
    const IS_PROFILE_PAGE_ESCORT = IS_PROFILE_PAGE
      && elementHelpers.isProfilePageEscort(document);
    const IS_LISTING_PAGE = !!document.querySelector('.ipsDataList.cForumTopicTable');
    const IS_ESCORT_LISTING =
      document.querySelector<HTMLElement>('[data-role="breadcrumbList"] li:last-child')?.innerText.match(/escorte|masaj/i) &&
      !document.querySelector<HTMLElement>('[data-role="breadcrumbList"] li:nth-child(2)')?.innerText.match(/nimfomane forum/i);

    userId.init().catch(console.error);
    if (IS_PROMOTER) {
      return;
    }

    console.log('Booting publi24-advanced-filter');

    document.body.classList.add('nimfomane');

    if (IS_MOBILE_VIEW) {
      document.body.classList.add('onMobile');
    }

    if (utils.getBrowserType() === 'Firefox') {
      document.body.classList.add('isFirefox');
    }

    renderer.renderGlobalButtons();
    profileActions.refreshFavoritesProfileStats().catch(console.error);

    if (IS_LISTING_PAGE && IS_ESCORT_LISTING) {
      const registerItems = () => {
        const topicContainers = [...document.querySelectorAll<HTMLDivElement>('[data-rowid]')];
        for (let index = 0; index < topicContainers.length; index++) {
          const container = topicContainers[index];
          const id = container.getAttribute('data-rowid')!;

          renderer.registerTopicItem(container, id, index);
        }
      }

      runWithObserver(registerItems, '.cForumTopicTable');
    }

    if (IS_PROFILE_PAGE_ESCORT) {
      const user = document.querySelector<HTMLElement>('.cProfileHeader_name h1')!.innerText.trim();
      const container = document.querySelector<HTMLDivElement>('[data-role="profileHeader"]')!;

      renderer.registerProfilePanel(container, user);
    }

    if (IS_TOPIC_PAGE) {
      const activateLinks = () => {
        const noLinkLinks = document.querySelectorAll<HTMLLinkElement>('[class="ipsType_noLinkStyling"]');
        noLinkLinks.forEach(noLinkLink => {
          noLinkLink.setAttribute('rel', 'external nofollow noopener');
          noLinkLink.setAttribute('target', '_blank');
          noLinkLink.setAttribute('href', noLinkLink.innerText);
          noLinkLink.classList.remove('ipsType_noLinkStyling');
        })
      }

      runWithObserver(activateLinks, '[data-feedid]');
    }
  })
  .catch(console.error);
