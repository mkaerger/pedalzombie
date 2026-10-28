import { coerce, controlMap, defaults } from './controls';
import type { ControlValues, PedalDefinition } from './types';

/**
 * App presets in localStorage, byte-compatible with the 2023 editors:
 *
 *   localStorage[pedal.storageKey] = {"<Date.now()>": {"name": "…", "settings": {"k1": 30, "t1": "2", …}}}
 *
 * Old presets may contain unknown keys, strings instead of numbers, or miss
 * controls that were added later — `sanitize` takes care of all of that.
 */

export interface StoredPreset {
  id: string;
  name: string;
  values: ControlValues;
}

type RawStore = Record<string, { name?: unknown; settings?: Record<string, unknown> }>;

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function readRaw(storage: KeyValueStorage, key: string): RawStore {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as RawStore) : {};
  } catch {
    return {};
  }
}

/** Fill a (possibly legacy) settings object into a complete, valid value set. */
export function sanitize(pedal: PedalDefinition, settings: Record<string, unknown> = {}): ControlValues {
  const out = defaults(pedal);
  for (const [id, control] of controlMap(pedal)) {
    const v = coerce(control, settings[id]);
    if (v !== undefined) out[id] = v;
  }
  return out;
}

export class PresetStore {
  constructor(
    private readonly pedal: PedalDefinition,
    private readonly storage: KeyValueStorage,
    private readonly now: () => number = Date.now,
  ) {}

  list(): StoredPreset[] {
    return Object.entries(readRaw(this.storage, this.pedal.storageKey))
      .filter(([, p]) => p && typeof p === 'object')
      .map(([id, p]) => ({
        id,
        name: typeof p.name === 'string' && p.name.trim() ? p.name : 'Untitled',
        values: sanitize(this.pedal, p.settings),
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));
  }

  save(name: string, values: ControlValues): StoredPreset {
    const raw = readRaw(this.storage, this.pedal.storageKey);
    let id = String(this.now());
    while (raw[id]) id = String(Number(id) + 1);
    raw[id] = { name: name.trim().slice(0, 40) || 'Untitled', settings: { ...values } };
    this.storage.setItem(this.pedal.storageKey, JSON.stringify(raw));
    return { id, name: raw[id].name as string, values: { ...values } };
  }

  remove(id: string) {
    const raw = readRaw(this.storage, this.pedal.storageKey);
    delete raw[id];
    this.storage.setItem(this.pedal.storageKey, JSON.stringify(raw));
  }
}
