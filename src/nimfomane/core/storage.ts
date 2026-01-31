interface TopicItem {
  url?: string;
  isOfEscort?: boolean;
  ownerUser?: string;
  escortDeterminationTime?: number;
  publiLink?: string | false;
  publiLinkDeterminationTime?: number;
}

interface EscortItem {
  optimizedProfileImage?: string | null;
  optimizedProfileImageTime?: number;
  profileLink?: string;
}

const CALLBACKS = {
  topicChanged: {} as Record<string, Array<(topic: TopicItem) => any>>,
  escortChanged: {} as Record<string, Array<(topic: EscortItem) => any>>,
};

export const NimfomaneStorage = {
  getVersion(): string | null {
    return localStorage.getItem('p24fa:nimfo:storage:version');
  },

  getTopicStoreKeys(id: string): string[] {
    const ownerUser = NimfomaneStorage.getTopic(id).ownerUser;
    const baseKey = `p24fa:nimfo:topic:${id}`;
    return [baseKey].concat(ownerUser ? [
      `p24fa:nimfo:escort:${ownerUser}`,
    ] : []);
  },

  getTopic(id: string): TopicItem {
    const itemString = localStorage.getItem(`p24fa:nimfo:topic:${id}`);
    return itemString ? JSON.parse(itemString) : {};
  },
  setTopicProp<T extends keyof TopicItem>(id: string, prop: T, value: TopicItem[T]): void {
    const item = this.getTopic(id);
    item[prop] = value;
    localStorage.setItem(`p24fa:nimfo:topic:${id}`, JSON.stringify(item));
    NimfomaneStorage.triggerTopicChanged(id);
  },
  onTopicChanged(id: string, callback: (topic: TopicItem) => any) {
    CALLBACKS.topicChanged[id] = CALLBACKS.topicChanged[id] || [];
    CALLBACKS.topicChanged[id].push(callback);
  },
  removeOnTopicChanged(id: string, callback: (topic: TopicItem) => any) {
    CALLBACKS.topicChanged[id] = CALLBACKS.topicChanged[id].filter(c => c !== callback);
  },
  triggerTopicChanged(id: string) {
    (CALLBACKS.topicChanged[id] || []).forEach(callback => callback(NimfomaneStorage.getTopic(id)));
  },

  getEscort(user: string): EscortItem {
    const itemString = localStorage.getItem(`p24fa:nimfo:escort:${user}`);
    return itemString ? JSON.parse(itemString) : {};
  },
  hasEscort(user: string): boolean {
    return !!localStorage.getItem(`p24fa:nimfo:escort:${user}`);
  },
  setEscortProp<T extends keyof EscortItem>(user: string, prop: T, value: EscortItem[T]): void {
    const item = this.getEscort(user);
    item[prop] = value;
    localStorage.setItem(`p24fa:nimfo:escort:${user}`, JSON.stringify(item));
    NimfomaneStorage.triggerEscortChanged(user);
  },
  onEscortChanged(user: string, callback: (topic: EscortItem) => any) {
    CALLBACKS.escortChanged[user] = CALLBACKS.escortChanged[user] || [];
    CALLBACKS.escortChanged[user].push(callback);
  },
  removeOnEscortChanged(user: string, callback: (topic: EscortItem) => any) {
    CALLBACKS.escortChanged[user] = CALLBACKS.escortChanged[user].filter(c => c !== callback);
  },
  triggerEscortChanged(user: string) {
    (CALLBACKS.escortChanged[user] || []).forEach(callback => callback(NimfomaneStorage.getEscort(user)));
  },

  async upgrade(): Promise<void> {
    const version = NimfomaneStorage.getVersion();
    const currentVersion = 1;
    const parsedVersion = version ? parseInt(version, 10) : currentVersion;

    type MigrationFunction = () => void;
    const migrations: Record<number, MigrationFunction> = {};

    if (parsedVersion < currentVersion) {
      console.log(`Upgrading NimfomaneStorage from v${parsedVersion} to v${currentVersion}`);
      for (let i = parsedVersion; i < currentVersion; i++) {
        if (migrations[i]) {
          try {
            console.log(`Running migration for v${i + 1}...`);
            migrations[i]();
            console.log(`Migration for v${i + 1} completed.`);
          } catch (e) {
            console.error(`Error during migration for v${i + 1}:`, e);
          }
        } else {
          console.warn(`No migration found for version ${i+1}`);
        }
      }

      localStorage.setItem('p24fa:nimfo:storage:version', String(currentVersion));
      console.log(`NimfomaneStorage upgrade complete. Current version: ${currentVersion}`);
    } else {
      console.log(`NimfomaneStorage is up to date (v${currentVersion}).`);
    }
  }
};
