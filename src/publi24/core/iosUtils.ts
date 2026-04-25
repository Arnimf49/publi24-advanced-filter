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

      const scrolledElements = new WeakSet<HTMLDivElement>();
      const maxDuration = 10000;
      const pollInterval = 200;
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed += pollInterval;

        const elements = Array.from(document.querySelectorAll<HTMLDivElement>(`[data-articleid="${focusAdId}"]`));
        for (const el of elements) {
          if (!scrolledElements.has(el)) {
            scrolledElements.add(el);
            setTimeout(() => adActions.scrollIntoView(el, {smooth: false}), 200);
          }
        }

        if (elapsed >= maxDuration) {
          clearInterval(interval);
        }
      }, pollInterval);
    }
  }
};
