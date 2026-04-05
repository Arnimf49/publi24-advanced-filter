const USER_ID_KEY = 'ww:instance-user-id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const userId = {
  async init(): Promise<void> {
    if (!localStorage.getItem(USER_ID_KEY)) {
      localStorage.setItem(USER_ID_KEY, generateUUID());
    }
  },

  get(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  },
};
