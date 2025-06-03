import {elementHelpers} from "./elementHelpers";
import {NimfomaneStorage} from "./storage";

export const profileActions = {
  determineEscort() {
    if (elementHelpers.isProfilePageEscort(document)) {
      const user = document.querySelector<HTMLElement>('h1.ipsPageHead_barText')!.innerText.trim();
      NimfomaneStorage.setEscortProp(user, 'profileLink', location.toString().replace(/\/content\/.+$|\/$|\?.+$/, '') + '/')
    }
  }
};
