import {NimfomaneStorage} from "./storage";
import {utils} from "../../common/utils";
import {elementHelpers} from "./elementHelpers";
import {topicActions} from "./topicActions";

export const listingActions = {
  async determineTopicEscort(container: HTMLDivElement, id: string) {
    const setTopicEscort = (user: string, link: string) => {
      NimfomaneStorage.setEscortProp(user, 'profileLink', link);
      NimfomaneStorage.setTopicProp(id, 'isOfEscort', true);
      NimfomaneStorage.setTopicProp(id, 'ownerUser', user);
      NimfomaneStorage.setTopicProp(id, 'escortDeterminationTime', Date.now());
    }

    const topicTitle = container.querySelector<HTMLLinkElement>('.ipsDataItem_title a[data-ipshover]')!;
    const url = (container.querySelector('.ipsPagination_last a')! || topicTitle).getAttribute('href')!;

    const normalizedTitle = utils.normalizeDigits(topicTitle.innerText)
    if (!normalizedTitle.match(/07(\d ?){8}/)
      && !normalizedTitle.match(/indisponibil[aă]/i)) {
      if (!await topicActions.determineTopPosterEscort(url)) {
        NimfomaneStorage.setTopicProp(id, 'isOfEscort', false);
        return;
      }
    }

    const creatorLink = container.querySelector<HTMLLinkElement>('.ipsDataItem_meta a');
    if (creatorLink && elementHelpers.isUserLinkEscort(creatorLink)) {
      const [link, user] = elementHelpers.userLinkDestruct(creatorLink);
      setTopicEscort(user, link);
      return;
    }

    const escortOfTopic = await topicActions.getEscortOfTopic(url);

    if (escortOfTopic) {
      setTopicEscort(escortOfTopic[1], escortOfTopic[0]);
    } else {
      NimfomaneStorage.setTopicProp(id, 'isOfEscort', false);
      NimfomaneStorage.setTopicProp(id, 'escortDeterminationTime', Date.now());
    }
  }
}
