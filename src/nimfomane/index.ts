import {NimfomaneStorage} from "./core/storage";
import {IS_MOBILE_VIEW} from "../common/globals";
import {renderer} from "./core/renderer";
import {elementHelpers} from "./core/elementHelpers";

const IS_TOPIC_PAGE = window.location.pathname.match(/^\/forum\/topic\//);
const IS_PROFILE_PAGE = window.location.pathname.match(/^\/forum\/profile\//);
const IS_PROFILE_PAGE_ESCORT = IS_PROFILE_PAGE
  && elementHelpers.isProfilePageEscort(document);
const IS_LISTING_PAGE = !!document.querySelector('.ipsDataList.cForumTopicTable');
const IS_ESCORT_LISTING =
  document.querySelector<HTMLElement>('[data-role="breadcrumbList"] li:last-child')?.innerText.match(/escorte|masaj/i) &&
  !document.querySelector<HTMLElement>('[data-role="breadcrumbList"] li:nth-child(2)')?.innerText.match(/nimfomane forum/i);

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
  .then(() => {
    console.log('Booting publi24-advanced-filter');

    if (IS_MOBILE_VIEW) {
      document.body.classList.add('onMobile');
    }

    if (IS_LISTING_PAGE && IS_ESCORT_LISTING) {
      const registerItems = () => {
        // @ts-ignore
        const topicContainers = [...document.querySelectorAll('[data-rowid]')];
        for (let container of topicContainers) {
          const id = container.getAttribute('data-rowid');
          const url = container.querySelector('.ipsDataItem_title [data-ipshover]').getAttribute('href')
            .replace(/\?.+$/, '');

          NimfomaneStorage.setTopicProp(id, 'url', url);

          renderer.registerTopicItem(container, id);
        }
      }

      runWithObserver(registerItems, '.cForumTopicTable');
    }

    if (IS_PROFILE_PAGE_ESCORT) {
      const user = document.querySelector<HTMLElement>('.cProfileHeader_name h1')!.innerText.trim();
      const container = document.querySelector<HTMLDivElement>('[data-role="profileHeader"]')!;

      renderer.registerProfileImages(container, user);
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
