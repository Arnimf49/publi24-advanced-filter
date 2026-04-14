export interface AdMemoryState {
  contentAnalyzeError: string | null;
  phoneSearchError: string | null;
  imageSearchError: string | null;
  analyzeImagesLoading: boolean;
  isPhoneSearchLoading: boolean;
  isImageSearchLoading: boolean;
}

const _WW_MEMORY_STORE: Record<string, AdMemoryState> = {};
const _WW_MEMORY_CALLBACKS: Record<string, Array<() => void>> = {};

const getEmptyAdState = (): AdMemoryState => ({
  contentAnalyzeError: null,
  phoneSearchError: null,
  imageSearchError: null,
  analyzeImagesLoading: false,
  isPhoneSearchLoading: false,
  isImageSearchLoading: false,
});

export const WWMemoryStorage = {
  getAdState(id: string): AdMemoryState {
    if (!_WW_MEMORY_STORE[id]) {
      _WW_MEMORY_STORE[id] = getEmptyAdState();
    }
    return _WW_MEMORY_STORE[id];
  },

  setAdAnalyzeError(id: string, error: string | null): void {
    const state = WWMemoryStorage.getAdState(id);
    state.phoneSearchError = error;
    WWMemoryStorage.triggerAdMemoryChanged(id);
  },

  setImageSearchError(id: string, error: string | null): void {
    const state = WWMemoryStorage.getAdState(id);
    state.imageSearchError = error;
    WWMemoryStorage.triggerAdMemoryChanged(id);
  },

  setAnalyzeImagesLoading(id: string, loading: boolean): void {
    const state = WWMemoryStorage.getAdState(id);
    state.analyzeImagesLoading = loading;
    WWMemoryStorage.triggerAdMemoryChanged(id);
  },

  setPhoneSearchLoading(id: string, loading: boolean): void {
    const state = WWMemoryStorage.getAdState(id);
    state.isPhoneSearchLoading = loading;
    WWMemoryStorage.triggerAdMemoryChanged(id);
  },

  setImageSearchLoading(id: string, loading: boolean): void {
    const state = WWMemoryStorage.getAdState(id);
    state.isImageSearchLoading = loading;
    WWMemoryStorage.triggerAdMemoryChanged(id);
  },

  onAdMemoryChanged(id: string, callback: () => void): void {
    if (!_WW_MEMORY_CALLBACKS[id]) {
      _WW_MEMORY_CALLBACKS[id] = [];
    }
    _WW_MEMORY_CALLBACKS[id].push(callback);
  },

  removeOnAdMemoryChanged(id: string, callback: () => void): void {
    if (_WW_MEMORY_CALLBACKS[id]) {
      _WW_MEMORY_CALLBACKS[id] = _WW_MEMORY_CALLBACKS[id].filter(cb => cb !== callback);
    }
  },

  triggerAdMemoryChanged(id: string): void {
    if (_WW_MEMORY_CALLBACKS[id]) {
      _WW_MEMORY_CALLBACKS[id].forEach(callback => callback());
    }
  },
};
