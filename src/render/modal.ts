import {adRender} from "./ad";

interface ItemElement extends HTMLElement {
  stopRender?: () => void;
  removeAd?: (adElement: ItemElement) => void;
}

interface RenderOptions {
  showDuplicates?: boolean;
}

export const MODALS_OPEN: ItemElement[] = [];
declare const Handlebars: any;
const FULL_SCREEN_LOADER_TEMPLATE = Handlebars.templates.full_screen_loader_template;

interface ModalContainerElement extends HTMLElement {
  removeAd?: (adElement: ItemElement) => void;
}

interface ModalResult {
  container: ModalContainerElement;
  registerAds: () => void;
  close: (event?: Event) => void;
}

interface GlobalLoaderResult {
  close: () => void;
}

export const modalRender = {
  renderModal(html: string, renderOptions?: RenderOptions): ModalResult {
    let itemRenderCleaners: Array<() => void>;

    const container: ModalContainerElement = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    MODALS_OPEN.push(container);

    container.removeAd = (adElement: ItemElement): void => {
      adElement.remove();
      adElement.stopRender?.();
    };

    document.body.style.overflow = 'hidden';

    const close = (event?: Event): void => {
      if (event) {
        event.stopPropagation();
      }

      itemRenderCleaners.forEach(c => c());
      MODALS_OPEN.pop();
      if (container.parentNode === document.body) {
        container.remove();
      }
      window.removeEventListener('keydown', closeOnKey);

      if (!MODALS_OPEN.length) {
        document.body.style.overflow = "initial";
      }
    };

    const closeOnKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && MODALS_OPEN[MODALS_OPEN.length - 1] === container) {
        close();
      }
    };

    window.addEventListener('keydown', closeOnKey);

    const closeButton = container.querySelector<HTMLButtonElement>('[data-wwid="close"]');
    if (closeButton) {
      closeButton.onclick = close;
    }
    container.onclick = close;

    itemRenderCleaners = adRender.registerAdsInContext(container, {renderOptions});

    const registerAds = (): void => {
      itemRenderCleaners.forEach(c => c());
      itemRenderCleaners = adRender.registerAdsInContext(container, {renderOptions});
    }

    return {container, registerAds, close};
  },

  renderGlobalLoader(longLoadingMessage: string): GlobalLoaderResult {
    const container = document.createElement('div');
    container.innerHTML = FULL_SCREEN_LOADER_TEMPLATE({});
    document.body.appendChild(container);
    document.body.style.overflow = 'hidden';

    const messageElement = container.querySelector<HTMLElement>('[data-wwid="ww-loader-message"]');

    const timeout: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (messageElement) {
        messageElement.innerHTML = longLoadingMessage;
      }
    }, 5000);

    const close = (): void => {
      clearTimeout(timeout);
      if (container.parentNode === document.body) {
        document.body.removeChild(container);
      }
      window.removeEventListener('keydown', closeOnKey);
      if (!MODALS_OPEN.length) {
        document.body.style.overflow = "initial";
      }
    };

    const closeOnKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', closeOnKey);

    return {close};
  },
};
