const prevOpen: string[] = [];
let currentModalState: ModalStateData | null = null;

const MODAL_STATE_KEY = 'ww:modal-state';

interface ModalStateData {
  type: string;
  meta: Record<string, any>;
}

window.addEventListener('beforeunload', () => {
  if (currentModalState) {
    localStorage.setItem(MODAL_STATE_KEY, JSON.stringify(currentModalState));
  }
});

export const modalState = {
  pushOpen(type: string, meta: Record<string, any> = {}): void {
    if (currentModalState) {
      prevOpen.push(currentModalState.type);
    }

    currentModalState = { type, meta };
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
      currentModalState = { type: prevType, meta: {} };
    } else {
      currentModalState = null;
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
