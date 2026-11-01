import type { KeyValueStorage } from './presets';

/** Persists which controls the user keeps out of Randomize. `load` is `undefined` until the user changed something. */
export interface LockPersistence {
  load(): string[] | undefined;
  save(ids: string[]): void;
}

/** localStorage[`${storageKey}_locks`] = ["d10", "k3"] */
export class LockStore implements LockPersistence {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key: string,
  ) {}

  load(): string[] | undefined {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(this.key) ?? 'null');
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : undefined;
    } catch {
      return undefined;
    }
  }

  save(ids: string[]) {
    this.storage.setItem(this.key, JSON.stringify(ids));
  }
}
