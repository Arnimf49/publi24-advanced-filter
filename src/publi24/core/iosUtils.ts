import {adActions} from "./adActions";

export const iosUtils = {
  reloadAndFocus(adId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('ww-focus', adId);
    window.location.href = url.toString();
  },

  focusListingAdIfNeeded() {
    const urlParams = new URLSearchParams(window.location.search);
    const focusAdId = urlParams.get('ww-focus');
    if (focusAdId) {
      urlParams.delete('ww-focus');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);

      const adElement = document.querySelector<HTMLDivElement>(`[data-articleid="${focusAdId}"]`);
      if (adElement) {
        setTimeout(() => adActions.scrollIntoView(adElement), 400);
      }
    }
  }
};
