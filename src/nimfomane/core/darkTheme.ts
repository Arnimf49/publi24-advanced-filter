import {NimfomaneStorage} from './storage';

const DARK_CLASS = 'dark';
const LISTENERS = new Set<(enabled: boolean) => void>();

const apply = (enabled: boolean) => {
  document.documentElement.classList.toggle(DARK_CLASS, enabled);
  LISTENERS.forEach(listener => listener(enabled));
};

export const darkTheme = {
  init(): void {
    apply(NimfomaneStorage.isDarkMode());
  },

  isEnabled(): boolean {
    return NimfomaneStorage.isDarkMode();
  },

  setEnabled(enabled: boolean): void {
    NimfomaneStorage.setDarkMode(enabled);
    apply(enabled);
  },

  onChange(listener: (enabled: boolean) => void): () => void {
    LISTENERS.add(listener);

    return () => {
      LISTENERS.delete(listener);
    };
  },
};
