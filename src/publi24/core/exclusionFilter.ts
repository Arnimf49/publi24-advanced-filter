import {WWStorage} from './storage';

const normalize = (value: string): string => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLocaleLowerCase('ro-RO');

const splitValues = (value: string): string[] => value
  .split(',')
  .map((part) => part.trim())
  .filter(Boolean);

const getCountyName = (): string => (
  document.querySelector<HTMLInputElement>('[data-key="county_name"]')?.value.trim() ?? ''
);

const getCityName = (item: Element): string => {
  const location = item.querySelector<HTMLElement>('.article-location')?.innerText ?? '';
  return splitValues(location)[0] ?? '';
};

const isExcluded = (item: Element, countyName: string, excludedValues: string[]): boolean => {
  const cityName = getCityName(item);
  if (!cityName || !countyName) {
    return false;
  }

  const locationKey = normalize(`${cityName}, ${countyName}`);
  return excludedValues.some((value) => {
    const normalizedValue = normalize(value);
    return normalizedValue === normalize(cityName)
      || normalizedValue === locationKey;
  });
};

export const exclusionFilter = {
  getSelectedValues(): string[] {
    return WWStorage.getExcludedCities();
  },

  setSelectedValues(values: string[]): void {
    WWStorage.setExcludedCities(values);
  },

  getCountyName,

  getAvailableCities(): string[] {
    const cityInput = document.querySelector<HTMLInputElement>('[data-key="city_name"]');
    if (!cityInput) {
      return [];
    }

    const cities = Array.from(
      cityInput.parentElement?.querySelectorAll<HTMLAnchorElement>('.dropdown-menu a') ?? [],
    ).map((link) => link.textContent?.replace(/\s*\([^)]*\)\s*$/, '').trim() ?? '');

    return [...new Set(cities.filter(Boolean))];
  },

  removeUnavailableValues(): void {
    const cityInput = document.querySelector<HTMLInputElement>('[data-key="city_name"]');
    const selectedValues = WWStorage.getExcludedCities();

    if (
      cityInput
      && (cityInput.value.trim() || cityInput.getAttribute('data-slug')?.trim())
      && selectedValues.length > 0
    ) {
      WWStorage.setExcludedCities([]);
      return;
    }

    if (!this.shouldRenderControl()) {
      return;
    }

    const availableCities = this.getAvailableCities();
    if (availableCities.length === 0) {
      return;
    }

    const availableCityKeys = new Set(availableCities.map(normalize));
    const validValues = selectedValues.filter((value) => {
      const cityValue = splitValues(value)[0] ?? '';
      return availableCityKeys.has(normalize(cityValue));
    });

    if (validValues.length !== selectedValues.length) {
      WWStorage.setExcludedCities(validValues);
    }
  },

  shouldRenderControl(): boolean {
    const countyInput = document.querySelector<HTMLInputElement>('[data-key="county_name"]');
    const cityInput = document.querySelector<HTMLInputElement>('[data-key="city_name"]');

    if (!countyInput || !cityInput) {
      return false;
    }

    return Boolean(countyInput.value.trim())
      && !cityInput.value.trim()
      && !cityInput.getAttribute('data-slug')?.trim();
  },

  removeExcludedAds(context: HTMLElement | Document): number {
    const countyName = getCountyName();
    const excludedValues = WWStorage.getExcludedCities();

    if (!countyName || excludedValues.length === 0) {
      return 0;
    }

    let removedCount = 0;
    const items = context.querySelectorAll<HTMLElement>('[data-articleid]');
    items.forEach((item) => {
      if (isExcluded(item, countyName, excludedValues)) {
        item.remove();
        removedCount++;
      }
    });

    return removedCount;
  },
};
