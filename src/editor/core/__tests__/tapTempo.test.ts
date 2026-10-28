import { describe, expect, it } from 'vitest';
import { TapTempo } from '../tapTempo';

describe('TapTempo', () => {
  it('needs two taps and averages the intervals', () => {
    const t = new TapTempo();
    expect(t.tap(0)).toBeUndefined();
    expect(t.tap(500)).toBe(120);
    expect(t.tap(1000)).toBe(120);
    expect(t.tap(1600)).toBe(112);
  });

  it('starts over after a pause', () => {
    const t = new TapTempo();
    t.tap(0);
    t.tap(1000);
    expect(t.tap(5000)).toBeUndefined();
    expect(t.tap(5250)).toBe(240);
  });
});
