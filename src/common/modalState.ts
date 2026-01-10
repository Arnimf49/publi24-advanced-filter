const prevOpen: string[] = [];

const MODAL_STATE_KEY = 'ww:modal-state';

interface ModalStateData {
  type: string;
  meta: Record<string, any>;
}

export const modalState = {
  pushOpen(type: string, meta: Record<string, any> = {}): void {
    const currentState = this.get();
    if (currentState) {
      prevOpen.push(currentState.type);
    }

    const newState: ModalStateData = { type, meta };
    localStorage.setItem(MODAL_STATE_KEY, JSON.stringify(newState));
  },

  consumeOpenIfType(type: string): Record<string, any> | null {
    const state = this.get();
    if (state?.type === type) {
      const meta = state.meta;
      localStorage.removeItem(MODAL_STATE_KEY);
      prevOpen.length = 0;
      return meta;
    }
    return null;
  },

  revertOpen(): void {
    const prevType = prevOpen.pop();
    if (prevType) {
      const newState: ModalStateData = { type: prevType, meta: {} };
      localStorage.setItem(MODAL_STATE_KEY, JSON.stringify(newState));
    } else {
      localStorage.removeItem(MODAL_STATE_KEY);
    }
  },

  get(): ModalStateData | null {
    const stored = localStorage.getItem(MODAL_STATE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
};
