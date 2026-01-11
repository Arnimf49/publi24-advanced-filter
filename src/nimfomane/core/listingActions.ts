import {NimfomaneStorage} from "./storage";
import {utils} from "../../common/utils";
import {elementHelpers} from "./elementHelpers";
import {topicActions} from "./topicActions";

export const listingActions = {
  async determineTopicEscort(container: HTMLDivElement, id: string, priority: number = 100) {
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

    const normalizedTitle = utils.normalizeDigits(topicTitle.innerText)
    const hasPhoneOrIndisponibila = normalizedTitle.match(/07(\d ?){8}/) || normalizedTitle.match(/indisponibil[aă]/i);

    if (!hasPhoneOrIndisponibila) {
      const escortOfTopic = await topicActions.getEscortOfTopic(url, 4, priority);
      if (escortOfTopic) {
        setTopicEscort(escortOfTopic[1], escortOfTopic[0]);
        return;
      }

      const topPosterEscort = await topicActions.determineTopPosterEscort(url, priority);
      if (topPosterEscort === false) {
        setTopicNotOfEscort();
        return;
      }
    }

    const creatorLink = container.querySelector<HTMLLinkElement>('.ipsDataItem_meta a');
    if (creatorLink && elementHelpers.isUserLinkEscort(creatorLink)) {
      const [link, user] = elementHelpers.userLinkDestruct(creatorLink);
      setTopicEscort(user, link);
      return;
    }

    const escortOfTopic = await topicActions.getEscortOfTopic(url, undefined, priority);

    if (escortOfTopic) {
      setTopicEscort(escortOfTopic[1], escortOfTopic[0]);
    } else {
      setTopicNotOfEscort();
    }
  }
}
