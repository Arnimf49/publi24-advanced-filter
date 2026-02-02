import {NimfomaneStorage} from "./storage";
import {listingActions} from "./listingActions";
import {escortActions} from "./escortActions";
import {NimfomaneMemoryStorage} from "./memoryStorage";
import {utils} from "../../common/utils";

const ESCORT_DETERMINATION_CACHE_DAYS = 15;
const PUBLI_LINK_CACHE_DAYS = 10;
const PROFILE_IMAGE_CACHE_DAYS = 4;
const PHONE_CACHE_DAYS = 8;

const isCacheExpired = (timestamp: number | undefined, days: number): boolean => {
  return !timestamp || (Date.now() - timestamp) > 8.64e+7 * days;
}

export const analyzer = {
  async analyzeTopic(container: HTMLDivElement, id: string, priority: number) {
    let topic = NimfomaneStorage.getTopic(id);
    NimfomaneMemoryStorage.setTopicAnalysisError(id, null);

    try {
      if (isCacheExpired(topic.escortDeterminationTime, ESCORT_DETERMINATION_CACHE_DAYS)) {
        NimfomaneStorage.setTopicProp(id, 'isOfEscort', undefined);
      }
      if (topic.isOfEscort === false && isCacheExpired(topic.publiLinkDeterminationTime, PUBLI_LINK_CACHE_DAYS)) {
        NimfomaneStorage.setTopicProp(id, 'isOfEscort', undefined);
        NimfomaneStorage.setTopicProp(id, 'publiLink', undefined);
      }

      topic = NimfomaneStorage.getTopic(id);
      let ofEscort = !!topic.isOfEscort;

      if (topic.isOfEscort === undefined) {
        ofEscort = await listingActions.determineTopicEscort(container, id, priority);
      }

      if (ofEscort) {
        const user = NimfomaneStorage.getTopic(id).ownerUser!;
        if (!NimfomaneStorage.getEscort(user).phone) {
          await listingActions.determinePhone(container, id);
        }
        analyzer.analyzeEscort(user, priority).catch(console.error);
      } else {
        let ofPubli = !!topic.publiLink;

        if (topic.publiLink === undefined) {
          ofPubli = await listingActions.determineTopicPubli24Link(container, id, priority);
        }
        if (ofPubli) {
          await listingActions.determinePhone(container, id);
        }
      }
    } catch (error) {
      NimfomaneMemoryStorage.setTopicAnalysisError(id, "Eroare analiză topic: " + utils.formatError(error));
      console.error(error);
    }
  },

  async analyzeEscort(user: string, priority: number) {
    let escort = NimfomaneStorage.getEscort(user);
    NimfomaneMemoryStorage.setEscortAnalysisError(user, null);

    try {
      if (isCacheExpired(escort.optimizedProfileImageTime, PROFILE_IMAGE_CACHE_DAYS)) {
        NimfomaneStorage.setEscortProp(user, 'optimizedProfileImage', undefined);
      }
      if (isCacheExpired(escort.phoneDeterminationTime, PHONE_CACHE_DAYS)) {
        NimfomaneStorage.setEscortProp(user, 'phone', undefined);
      }

      escort = NimfomaneStorage.getEscort(user);

      if (escort.optimizedProfileImage === undefined) {
        const isRecalculation = escort?.optimizedProfileImageTime !== undefined;
        const imagePriority = isRecalculation ? 50 : priority;
        await escortActions.determineMainProfileImage(user, imagePriority);
      }

      if (escort.phone === undefined) {
        await escortActions.determinePhone(user, priority);
      }
    } catch (error) {
      NimfomaneMemoryStorage.setEscortAnalysisError(user, "Eroare analiză escortă: " + utils.formatError(error));
      console.error(error);
    }
  },
};
