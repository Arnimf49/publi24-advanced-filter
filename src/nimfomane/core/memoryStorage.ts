export interface TopicMemoryState {
  topicAnalysisError: string | null;
}

export interface EscortMemoryState {
  escortAnalysisError: string | null;
}

const _NIMFO_TOPIC_MEMORY_STORE: Record<string, TopicMemoryState> = {};
const _NIMFO_ESCORT_MEMORY_STORE: Record<string, EscortMemoryState> = {};
const _NIMFO_TOPIC_MEMORY_CALLBACKS: Record<string, Array<() => void>> = {};
const _NIMFO_ESCORT_MEMORY_CALLBACKS: Record<string, Array<() => void>> = {};

const getEmptyTopicState = (): TopicMemoryState => ({
  topicAnalysisError: null,
});

const getEmptyEscortState = (): EscortMemoryState => ({
  escortAnalysisError: null,
});

export const NimfomaneMemoryStorage = {
  getTopicState(id: string): TopicMemoryState {
    if (!_NIMFO_TOPIC_MEMORY_STORE[id]) {
      _NIMFO_TOPIC_MEMORY_STORE[id] = getEmptyTopicState();
    }
    return _NIMFO_TOPIC_MEMORY_STORE[id];
  },

  getEscortState(user: string): EscortMemoryState {
    if (!_NIMFO_ESCORT_MEMORY_STORE[user]) {
      _NIMFO_ESCORT_MEMORY_STORE[user] = getEmptyEscortState();
    }
    return _NIMFO_ESCORT_MEMORY_STORE[user];
  },

  setTopicAnalysisError(id: string, error: string | null): void {
    const state = NimfomaneMemoryStorage.getTopicState(id);
    state.topicAnalysisError = error;
    NimfomaneMemoryStorage.triggerTopicMemoryChanged(id);
  },

  setEscortAnalysisError(user: string, error: string | null): void {
    const state = NimfomaneMemoryStorage.getEscortState(user);
    state.escortAnalysisError = error;
    NimfomaneMemoryStorage.triggerEscortMemoryChanged(user);
  },

  onTopicMemoryChanged(id: string, callback: () => void): void {
    if (!_NIMFO_TOPIC_MEMORY_CALLBACKS[id]) {
      _NIMFO_TOPIC_MEMORY_CALLBACKS[id] = [];
    }
    _NIMFO_TOPIC_MEMORY_CALLBACKS[id].push(callback);
  },

  removeOnTopicMemoryChanged(id: string, callback: () => void): void {
    if (_NIMFO_TOPIC_MEMORY_CALLBACKS[id]) {
      _NIMFO_TOPIC_MEMORY_CALLBACKS[id] = _NIMFO_TOPIC_MEMORY_CALLBACKS[id].filter(cb => cb !== callback);
    }
  },

  triggerTopicMemoryChanged(id: string): void {
    if (_NIMFO_TOPIC_MEMORY_CALLBACKS[id]) {
      _NIMFO_TOPIC_MEMORY_CALLBACKS[id].forEach(callback => callback());
    }
  },

  onEscortMemoryChanged(user: string, callback: () => void): void {
    if (!_NIMFO_ESCORT_MEMORY_CALLBACKS[user]) {
      _NIMFO_ESCORT_MEMORY_CALLBACKS[user] = [];
    }
    _NIMFO_ESCORT_MEMORY_CALLBACKS[user].push(callback);
  },

  removeOnEscortMemoryChanged(user: string, callback: () => void): void {
    if (_NIMFO_ESCORT_MEMORY_CALLBACKS[user]) {
      _NIMFO_ESCORT_MEMORY_CALLBACKS[user] = _NIMFO_ESCORT_MEMORY_CALLBACKS[user].filter(cb => cb !== callback);
    }
  },

  triggerEscortMemoryChanged(user: string): void {
    if (_NIMFO_ESCORT_MEMORY_CALLBACKS[user]) {
      _NIMFO_ESCORT_MEMORY_CALLBACKS[user].forEach(callback => callback());
    }
  },
};
