import {adActions} from "./adActions";

export const iosUtils = {
  reloadAndFocus(adId: string) {
    localStorage.setItem('ww:focus', adId);
    window.location.reload();
  },

  focusListingAdIfNeeded() {
    const focusAdId = localStorage.getItem('ww:focus');
    if (focusAdId) {
      localStorage.removeItem('ww:focus');

      let attempts = 0;
      const maxAttempts = 2000 / 200;
      const interval = setInterval(() => {
        attempts++;
        const adElement =
          Array.from(document.querySelectorAll<HTMLDivElement>(`[data-articleid="${focusAdId}"]`))
          .pop();

        if (adElement) {
          adActions.scrollIntoView(adElement);
          clearInterval(interval);
        }
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 400);
    }
  }
};
