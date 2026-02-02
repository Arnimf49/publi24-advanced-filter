import {NimfomaneStorage} from "./storage";
import {utils} from "../../common/utils";
import {elementHelpers} from "./elementHelpers";
import {topicActions} from "./topicActions";

export const listingActions = {
  async determineTopicPubli24Link(container: HTMLDivElement, id: string, priority: number = 100) {
    utils.debugLog('Determining topic is of publi', {id, priority});

    const topicTitle = container.querySelector<HTMLLinkElement>('.ipsDataItem_title a[data-ipshover]')!;
    const url = (
      container.querySelector('.ipsPagination_last a')!
      || container.querySelector('.ipsPagination_page:last-child a')!
      || topicTitle).getAttribute('href'
    )!;

    const publiLink = await topicActions.getPubli24Link(url, priority);
    NimfomaneStorage.setTopicProp(id, 'publiLink', publiLink);
    NimfomaneStorage.setTopicProp(id, 'publiLinkDeterminationTime', Date.now());

    return !!publiLink;
  },

  async determineTopicEscort(container: HTMLDivElement, id: string, priority: number = 100): Promise<boolean> {
    utils.debugLog('Determining topic escort', {id, priority});

    const setTopicEscort = (user: string, link: string) => {
      NimfomaneStorage.setEscortProp(user, 'profileLink', link);
      NimfomaneStorage.setTopicProp(id, 'isOfEscort', true);
      NimfomaneStorage.setTopicProp(id, 'ownerUser', user);
      NimfomaneStorage.setTopicProp(id, 'escortDeterminationTime', Date.now());
    }

    const setTopicNotOfEscort = () => {
      NimfomaneStorage.setTopicProp(id, 'isOfEscort', false);
      NimfomaneStorage.setTopicProp(id, 'escortDeterminationTime', Date.now());
    }

    const topicTitle = container.querySelector<HTMLLinkElement>('.ipsDataItem_title a[data-ipshover]')!;
    const url = (
      container.querySelector('.ipsPagination_last a')!
      || container.querySelector('.ipsPagination_page:last-child a')!
      || topicTitle).getAttribute('href'
    )!;

    const normalizedTitle = utils.normalizeDigits(utils.removeDiacritics(topicTitle.innerText)).toLowerCase();

    if (normalizedTitle.includes('discutii') || normalizedTitle.includes('general')) {
      setTopicNotOfEscort();
      return false;
    }

    const hasPhoneOrIndisponibila = normalizedTitle.match(/07(\d ?){8}/) || normalizedTitle.match(/indisponibila/i);

    if (!hasPhoneOrIndisponibila) {
      const escortOfTopic = await topicActions.getEscortOfTopic(url, 4, priority);
      if (escortOfTopic) {
        setTopicEscort(escortOfTopic[1], escortOfTopic[0]);
        return true;
      }

      const topPosterEscort = await topicActions.determineTopPosterEscort(url, priority);
      if (topPosterEscort === false) {
        setTopicNotOfEscort();
        return false;
      }
    }

    const creatorLink = container.querySelector<HTMLLinkElement>('.ipsDataItem_meta a');
    if (creatorLink && elementHelpers.isUserLinkEscort(creatorLink)) {
      const [link, user] = elementHelpers.userLinkDestruct(creatorLink);
      setTopicEscort(user, link);
      return true;
    }

    const escortOfTopic = await topicActions.getEscortOfTopic(url, undefined, priority);

    if (escortOfTopic) {
      setTopicEscort(escortOfTopic[1], escortOfTopic[0]);
      return true;
    } else {
      setTopicNotOfEscort();
      return false;
    }
  },

  async determinePhone(container: HTMLDivElement, id: string): Promise<string | undefined> {
    utils.debugLog('Determining topic phone', {id});

    const topicTitle = container.querySelector<HTMLLinkElement>('.ipsDataItem_title a[data-ipshover]')!;
    const normalizedTitle = utils.normalizeDigits(topicTitle.innerText);
    const phoneMatches = normalizedTitle.match(/07(\d ?){8}/g);

    if (!phoneMatches) {
      return undefined;
    }

    const phone = phoneMatches[phoneMatches.length - 1].replace(/\s/g, '');
    const topic = NimfomaneStorage.getTopic(id);

    if (topic.isOfEscort && topic.ownerUser) {
      NimfomaneStorage.setEscortProp(topic.ownerUser, 'phone', phone);
      NimfomaneStorage.setEscortProp(topic.ownerUser, 'phoneDeterminationTime', Date.now());
    } else {
      NimfomaneStorage.setTopicProp(id, 'phone', phone);
    }

    return phone;
  }
}
