import { coerce, controlMap, defaults } from './controls';
import type { ControlValues, PedalDefinition } from './types';

/**
 * App presets in localStorage, byte-compatible with the 2023 editors:
 *
 *   localStorage[pedal.storageKey] = {"<Date.now()>": {"name": "…", "settings": {"k1": 30, "t1": "2", …}}}
 *
 * Old presets may contain unknown keys, strings instead of numbers, or miss
 * controls that were added later — `sanitize` takes care of all of that.
 *
 * Presets can also travel as a file (backup, sharing), see `PresetFile`:
 *
 *   {"format": "pedalzombie-presets", "version": 1, "pedal": "moodmkii", "pedalName": "MOOD MKII",
 *    "exportedAt": "2026-11-02T10:00:00.000Z", "presets": [{"name": "…", "savedAt": "…", "values": {…}}]}
 */

export interface StoredPreset {
  id: string;
  name: string;
  values: ControlValues;
}

type RawStore = Record<string, { name?: unknown; settings?: Record<string, unknown> }>;

const NAME_MAX = 40;

export const PRESET_FILE_FORMAT = 'pedalzombie-presets';
export const PRESET_FILE_VERSION = 1;

export interface PresetFile {
  format: typeof PRESET_FILE_FORMAT;
  /** Bumped when the shape changes in a way older editors cannot read. */
  version: number;
  /** `pedal.storageKey` — a file only ever fits one pedal. */
  pedal: string;
  pedalName: string;
  exportedAt: string;
  presets: FilePreset[];
}

export interface FilePreset {
  name: string;
  /** When the preset was saved in the editor (ISO 8601); kept on import so a restored list keeps its order. */
  savedAt?: string;
  values: ControlValues;
}

/** A file that cannot be imported; the message is meant for the person who chose the file. */
export class PresetFileError extends Error {}

export interface ImportResult {
  added: StoredPreset[];
  /** Left out: an identical preset (same name, same values) is already here. */
  skipped: string[];
  /** Added under a new name because a different preset of that name is already here. */
  renamed: { from: string; to: string }[];
}

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

const cleanName = (name: string) => name.trim().slice(0, NAME_MAX) || 'Untitled';

/**
 * Check a file's text against the format and this pedal. Returns the file with
 * names trimmed and values sanitized; throws `PresetFileError` otherwise.
 */
export function parsePresetFile(pedal: PedalDefinition, text: string): PresetFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new PresetFileError('This is not a pedalzombie preset file.');
  }
  if (!isRecord(data) || data.format !== PRESET_FILE_FORMAT) {
    throw new PresetFileError('This is not a pedalzombie preset file.');
  }
  if (typeof data.version !== 'number' || !Number.isInteger(data.version) || data.version < 1) {
    throw new PresetFileError('This preset file is damaged (no version).');
  }
  if (data.version > PRESET_FILE_VERSION) {
    throw new PresetFileError('This file was made with a newer pedalzombie. Reload the page and try again.');
  }
  if (data.pedal !== pedal.storageKey) {
    const other = typeof data.pedalName === 'string' && data.pedalName.trim() ? data.pedalName : 'another pedal';
    throw new PresetFileError(`This file holds presets for ${other}, not for ${pedal.name}.`);
  }
  if (!Array.isArray(data.presets) || data.presets.length === 0) {
    throw new PresetFileError('This file contains no presets.');
  }
  const presets = data.presets.map((p: unknown, i: number): FilePreset => {
    if (!isRecord(p) || typeof p.name !== 'string' || !p.name.trim() || !isRecord(p.values)) {
      throw new PresetFileError(`Preset ${i + 1} in this file is damaged.`);
    }
    const savedAt = typeof p.savedAt === 'string' && Number.isFinite(Date.parse(p.savedAt)) ? p.savedAt : undefined;
    return { name: cleanName(p.name), ...(savedAt && { savedAt }), values: sanitize(pedal, p.values) };
  });
  return {
    format: PRESET_FILE_FORMAT,
    version: data.version,
    pedal: pedal.storageKey,
    pedalName: pedal.name,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
    presets,
  };
}

/** One line for the person who imported, e.g. "Imported 2 presets. 1 was already here." */
export function describeImport({ added, skipped, renamed }: ImportResult): string {
  if (added.length === 0) {
    return skipped.length === 1 ? 'Nothing new: that preset is already here.' : `Nothing new: all ${skipped.length} presets are already here.`;
  }
  const parts = [`Imported ${added.length} preset${added.length === 1 ? '' : 's'}.`];
  if (skipped.length > 0) parts.push(`${skipped.length === 1 ? '1 was' : `${skipped.length} were`} already here.`);
  for (const r of renamed) parts.push(`"${r.from}" exists with other settings, so the file's one is now "${r.to}".`);
  return parts.join(' ');
}

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
    raw[id] = { name: cleanName(name), settings: { ...values } };
    this.storage.setItem(this.pedal.storageKey, JSON.stringify(raw));
    return { id, name: raw[id].name as string, values: { ...values } };
  }

  remove(id: string) {
    const raw = readRaw(this.storage, this.pedal.storageKey);
    delete raw[id];
    this.storage.setItem(this.pedal.storageKey, JSON.stringify(raw));
  }

  /** The presets (all, or the given ids) as a file to keep or share. */
  export(ids?: string[]): PresetFile {
    const presets = this.list().filter((p) => !ids || ids.includes(p.id));
    return {
      format: PRESET_FILE_FORMAT,
      version: PRESET_FILE_VERSION,
      pedal: this.pedal.storageKey,
      pedalName: this.pedal.name,
      exportedAt: new Date(this.now()).toISOString(),
      presets: presets.map((p) => {
        const at = Number(p.id);
        return { name: p.name, ...(Number.isFinite(at) && at > 0 && { savedAt: new Date(at).toISOString() }), values: { ...p.values } };
      }),
    };
  }

  /**
   * Add the presets of a file. Nothing already here is changed: an identical
   * preset is skipped, a different one of the same name gets "(2)" appended.
   */
  import(text: string): ImportResult {
    const file = parsePresetFile(this.pedal, text);
    const raw = readRaw(this.storage, this.pedal.storageKey);
    const existing = this.list();
    const taken = new Set(existing.map((p) => p.name));
    // what is here under which name as the file calls it; grows as the import adds, so a file listing a preset twice adds it once
    const seen = existing.map((p) => ({ name: p.name, values: p.values }));
    const result: ImportResult = { added: [], skipped: [], renamed: [] };
    const same = (a: ControlValues, b: ControlValues) => this.pedal.controls.every((c) => a[c.id] === b[c.id]);

    for (const preset of file.presets) {
      if (seen.some((p) => p.name === preset.name && same(p.values, preset.values))) {
        result.skipped.push(preset.name);
        continue;
      }
      let name = preset.name;
      for (let n = 2; taken.has(name); n++) name = `${preset.name} (${n})`;
      if (name !== preset.name) result.renamed.push({ from: preset.name, to: name });

      const savedAt = preset.savedAt ? Date.parse(preset.savedAt) : Number.NaN;
      let id = String(Number.isFinite(savedAt) && savedAt > 0 ? savedAt : this.now());
      while (raw[id]) id = String(Number(id) + 1);
      raw[id] = { name, settings: { ...preset.values } };
      taken.add(name);
      seen.push({ name: preset.name, values: preset.values });
      result.added.push({ id, name, values: { ...preset.values } });
    }
    if (result.added.length > 0) this.storage.setItem(this.pedal.storageKey, JSON.stringify(raw));
    return result;
  }
}
