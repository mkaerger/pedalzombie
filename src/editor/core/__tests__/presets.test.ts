import { describe, expect, it } from 'vitest';
import { moodmkii } from '../../../pedals/moodmkii';
import { describeImport, parsePresetFile, PresetFileError, PresetStore, sanitize } from '../presets';
import { MemoryStorage } from './helpers';

// Shape written by the 2023 MOOD MKII editor (values partly strings, extra and missing keys)
const LEGACY = JSON.stringify({
  '1686900000000': {
    name: 'Shimmer',
    settings: { k1: 99, k2: '12', t1: '3', t2: 1, h3: '1', d9: 1, s1: 1, c1: 7, f1: 64, p1: '2', synth: 127, k13: 58 },
  },
});

describe('PresetStore', () => {
  it('reads presets written by the 2023 editor', () => {
    const storage = new MemoryStorage();
    storage.setItem('moodmkii', LEGACY);
    const [preset] = new PresetStore(moodmkii, storage).list();
    expect(preset.name).toBe('Shimmer');
    expect(preset.values).toMatchObject({ k1: 99, k2: 12, t1: 3, t2: 1, h3: 1, d9: 1, s1: 1, c1: 7, f1: 64 });
    // missing controls fall back to defaults, unknown keys are dropped
    expect(preset.values.k3).toBe(75);
    expect(preset.values).not.toHaveProperty('synth');
    expect(preset.values).not.toHaveProperty('p1');
  });

  it('writes the same format back, keeping existing presets', () => {
    const storage = new MemoryStorage();
    storage.setItem('moodmkii', LEGACY);
    const store = new PresetStore(moodmkii, storage, () => 1700000000000);
    store.save('New one', sanitize(moodmkii));
    const raw = JSON.parse(storage.getItem('moodmkii')!);
    expect(Object.keys(raw)).toEqual(['1686900000000', '1700000000000']);
    expect(raw['1700000000000']).toMatchObject({ name: 'New one', settings: { k1: 30 } });
    store.remove('1686900000000');
    expect(store.list().map((p) => p.name)).toEqual(['New one']);
  });

  it('survives corrupt storage', () => {
    const storage = new MemoryStorage();
    storage.setItem('moodmkii', '{not json');
    expect(new PresetStore(moodmkii, storage).list()).toEqual([]);
  });
});

describe('preset files', () => {
  const T0 = 1700000000000;
  function seeded() {
    const storage = new MemoryStorage();
    storage.setItem('moodmkii', LEGACY);
    const store = new PresetStore(moodmkii, storage, () => T0);
    store.save('Dry', { ...sanitize(moodmkii), k1: 0 });
    return { storage, store };
  }

  it('exports all presets with metadata and the time they were saved', () => {
    const { store } = seeded();
    const file = store.export();
    expect(file).toMatchObject({ format: 'pedalzombie-presets', version: 1, pedal: 'moodmkii', pedalName: moodmkii.name });
    expect(file.exportedAt).toBe(new Date(T0).toISOString());
    expect(file.presets.map((p) => p.name)).toEqual(['Shimmer', 'Dry']);
    expect(file.presets[0].savedAt).toBe(new Date(1686900000000).toISOString());
    expect(file.presets[0].values).toMatchObject({ k1: 99, k2: 12, k3: 75 }); // sanitized, not the raw strings
    expect(file.presets[0].values).not.toHaveProperty('synth');
    expect(JSON.parse(JSON.stringify(file))).toEqual(file); // plain data
  });

  it('exports a single preset by id', () => {
    const { store } = seeded();
    const dry = store.list().find((p) => p.name === 'Dry')!;
    expect(store.export([dry.id]).presets.map((p) => p.name)).toEqual(['Dry']);
  });

  it('restores an export into an empty browser, keeping names, values and order', () => {
    const { store } = seeded();
    const text = JSON.stringify(store.export());
    const fresh = new PresetStore(moodmkii, new MemoryStorage(), () => T0 + 5000);
    const result = fresh.import(text);
    expect(result.added.map((p) => p.name)).toEqual(['Shimmer', 'Dry']);
    expect(result.skipped).toEqual([]);
    expect(result.renamed).toEqual([]);
    expect(fresh.list()).toEqual(store.list());
  });

  it('keeps what is already there: identical presets are skipped, same names with other values get a suffix', () => {
    const { store } = seeded();
    const text = JSON.stringify({
      ...store.export(),
      presets: [
        { name: 'Shimmer', values: store.list()[0].values }, // identical
        { name: 'Dry', values: { ...sanitize(moodmkii), k1: 127 } }, // same name, other sound
        { name: 'Dry', values: { ...sanitize(moodmkii), k1: 100 } }, // and again
        { name: 'Dry', values: { ...sanitize(moodmkii), k1: 100 } }, // listed twice in the file
        { name: 'Wet', savedAt: 'not a date', values: { k1: '5', bogus: 1 } },
      ],
    });
    const before = store.list();
    const result = store.import(text);
    expect(result.skipped).toEqual(['Shimmer', 'Dry']);
    expect(result.renamed).toEqual([
      { from: 'Dry', to: 'Dry (2)' },
      { from: 'Dry', to: 'Dry (3)' },
    ]);
    expect(result.added.map((p) => p.name)).toEqual(['Dry (2)', 'Dry (3)', 'Wet']);
    const after = store.list();
    expect(after.slice(0, 2)).toEqual(before); // untouched
    expect(after.map((p) => p.name)).toEqual(['Shimmer', 'Dry', 'Dry (2)', 'Dry (3)', 'Wet']);
    expect(after.find((p) => p.name === 'Wet')!.values).toMatchObject({ k1: 5, k2: sanitize(moodmkii).k2 });
    expect(after.find((p) => p.name === 'Wet')!.values).not.toHaveProperty('bogus');
    // a preset without a usable savedAt gets a fresh id, after the existing ones
    expect(Number(after.find((p) => p.name === 'Wet')!.id)).toBeGreaterThanOrEqual(T0);
  });

  it('does not write when nothing was added', () => {
    const { store, storage } = seeded();
    const before = storage.getItem('moodmkii');
    const result = store.import(JSON.stringify(store.export()));
    expect(result.added).toEqual([]);
    expect(storage.getItem('moodmkii')).toBe(before);
  });

  it.each([
    ['{not json', 'This is not a pedalzombie preset file.'],
    ['[]', 'This is not a pedalzombie preset file.'],
    ['{"format":"something-else","version":1}', 'This is not a pedalzombie preset file.'],
    ['{"format":"pedalzombie-presets","version":"1","pedal":"moodmkii","presets":[]}', 'This preset file is damaged (no version).'],
    ['{"format":"pedalzombie-presets","version":2,"pedal":"moodmkii","presets":[]}', 'This file was made with a newer pedalzombie. Reload the page and try again.'],
    ['{"format":"pedalzombie-presets","version":1,"pedal":"mood","pedalName":"MOOD","presets":[]}', 'This file holds presets for MOOD, not for MOOD MKII.'],
    ['{"format":"pedalzombie-presets","version":1,"pedal":"mood","presets":[]}', 'This file holds presets for another pedal, not for MOOD MKII.'],
    ['{"format":"pedalzombie-presets","version":1,"pedal":"moodmkii","presets":[]}', 'This file contains no presets.'],
    ['{"format":"pedalzombie-presets","version":1,"pedal":"moodmkii","presets":{}}', 'This file contains no presets.'],
    ['{"format":"pedalzombie-presets","version":1,"pedal":"moodmkii","presets":[{"name":"ok","values":{}},{"name":" ","values":{}}]}', 'Preset 2 in this file is damaged.'],
    ['{"format":"pedalzombie-presets","version":1,"pedal":"moodmkii","presets":[{"name":"ok","values":[1]}]}', 'Preset 1 in this file is damaged.'],
  ])('rejects %s', (text, message) => {
    expect(() => parsePresetFile(moodmkii, text)).toThrow(PresetFileError);
    expect(() => parsePresetFile(moodmkii, text)).toThrow(message);
    const storage = new MemoryStorage();
    expect(() => new PresetStore(moodmkii, storage).import(text)).toThrow(message);
    expect(storage.getItem('moodmkii')).toBeNull();
  });

  it('trims and shortens names from a file', () => {
    const file = parsePresetFile(
      moodmkii,
      JSON.stringify({ format: 'pedalzombie-presets', version: 1, pedal: 'moodmkii', presets: [{ name: `  ${'x'.repeat(60)}  `, values: {} }] }),
    );
    expect(file.presets[0].name).toBe('x'.repeat(40));
    expect(file.presets[0].values).toEqual(sanitize(moodmkii));
  });

  it('describes an import in one line', () => {
    const p = (name: string) => ({ id: '1', name, values: {} });
    expect(describeImport({ added: [], skipped: ['A'], renamed: [] })).toBe('Nothing new: that preset is already here.');
    expect(describeImport({ added: [], skipped: ['A', 'B'], renamed: [] })).toBe('Nothing new: all 2 presets are already here.');
    expect(describeImport({ added: [p('A')], skipped: [], renamed: [] })).toBe('Imported 1 preset.');
    expect(describeImport({ added: [p('A'), p('B (2)')], skipped: ['C'], renamed: [{ from: 'B', to: 'B (2)' }] })).toBe(
      'Imported 2 presets. 1 was already here. "B" exists with other settings, so the file\'s one is now "B (2)".',
    );
    expect(describeImport({ added: [p('A')], skipped: ['C', 'D'], renamed: [] })).toBe('Imported 1 preset. 2 were already here.');
  });
});
