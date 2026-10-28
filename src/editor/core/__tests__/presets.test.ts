import { describe, expect, it } from 'vitest';
import { moodmkii } from '../../../pedals/moodmkii';
import { PresetStore, sanitize } from '../presets';
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
