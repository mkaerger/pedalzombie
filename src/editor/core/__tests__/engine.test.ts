import { describe, expect, it } from 'vitest';
import { dip, knob, select, toggle, value } from '../controls';
import type { ControlValues, PedalDefinition } from '../types';
import { parseBpm } from '../engine';
import { cc, pc, setup } from './helpers';

const LED_OFF = { color: 'off' } as const;

const pedal: PedalDefinition = {
  slug: 'test-editor',
  name: 'Test',
  manufacturer: 'Test',
  tagline: '',
  storageKey: 'test',
  defaultChannel: 2,
  midiReference: '',
  released: '2020-01',
  theme: { body: '#000', ink: '#fff', accent: '#f00', knob: '#ccc', knobIndicator: '#000' },
  controls: [
    knob('k1', 'A', 14, 10),
    knob('k2', 'B', 15, 20),
    toggle('t1', 'T', 21, 2, ['l', 'm', 'r']),
    dip('s1', 'BYPASS', 102, 0),
    dip('s2', 'AUX', 103, 1),
    value('bpm', 'Tempo', 120, { min: 20, max: 300 }),
  ],
  face: {
    format: 'classic',
    knobs: [['k1', 'k2']],
    toggles: ['t1'],
    footswitches: [
      { id: 'left', label: 'Tap', press: { type: 'tap' }, hold: { type: 'momentary', cc: 25, on: 1, off: 0, label: 'Scan' } },
      {
        id: 'right',
        label: 'Bypass',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 24, on: 1, off: 0, label: 'Loop', enabled: (v) => v.s1 === 1 },
      },
    ],
  },
  sections: [],
  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 }, liveBeforeLoad: true },
  tap: { cc: 93, value: 127, bpmControl: 'bpm' },
  random: [{ id: 'knobs', label: 'Knobs', controls: ['k1', 'k2'] }],
  commands: [{ id: 'reset', label: 'Reset', cc: 56, value: 1, confirm: '?' }],
  // k2 follows t1: a rule like MOOD's "toggle switches the looper off"
  onChange: (id, v) => (id === 't1' && v === 3 ? { k2: 0 } : undefined),
  leds: () => [LED_OFF, LED_OFF, LED_OFF],
};

describe('EditorEngine values', () => {
  it('sends a CC once per user change and skips unchanged values', () => {
    const { engine, sink } = setup(pedal);
    engine.set('k1', 64);
    engine.set('k1', 64);
    expect(sink.take()).toEqual([cc(14, 64)]);
    expect(engine.getState().values.k1).toBe(64);
  });

  it('clamps and rounds values, rejects invalid toggle positions', () => {
    const { engine, sink } = setup(pedal);
    engine.set('k1', 300);
    engine.set('t1', 7);
    expect(sink.take()).toEqual([cc(14, 127)]);
    expect(engine.getState().values.t1).toBe(2);
  });

  it('applies onChange rules and sends the follow-up', () => {
    const { engine, sink } = setup(pedal);
    engine.set('t1', 3);
    expect(sink.take()).toEqual([cc(21, 3), cc(15, 0)]);
  });

  it('reset goes live first and sends every value exactly once', () => {
    const { engine, sink } = setup(pedal);
    engine.set('k1', 99);
    sink.take();
    engine.reset();
    const sent = sink.take();
    expect(sent[0]).toEqual(pc(0));
    expect(sent).toContainEqual(cc(14, 10));
    const ccs = sent.filter((m) => m.type === 'cc').map((m) => (m.type === 'cc' ? m.cc : -1));
    expect(new Set(ccs).size).toBe(ccs.length);
  });

  it('randomize covers the full range including 0 and 127', () => {
    const low = setup(pedal, () => 0);
    low.engine.randomize('knobs');
    expect(low.sink.take()).toEqual([cc(14, 0), cc(15, 0)]);
    const high = setup(pedal, () => 0.9999);
    high.engine.randomize('knobs');
    expect(high.sink.take()).toEqual([cc(14, 127), cc(15, 127)]);
  });
});

describe('EditorEngine presets on the pedal', () => {
  it('preset toggle maps left/middle/right to PC 2/0/1', () => {
    const { engine, sink } = setup(pedal);
    engine.presetToggle('left');
    engine.presetToggle('middle');
    engine.presetToggle('right');
    expect(sink.take()).toEqual([pc(2), pc(0), pc(1)]);
  });

  it('store uses the save CC and validates the slot range', () => {
    const { engine, sink } = setup(pedal);
    expect(engine.store(0)).toBe(false);
    expect(engine.store(45)).toBe(true);
    expect(sink.take()).toEqual([cc(111, 45)]);
  });

  it('recall sends a program change', () => {
    const { engine, sink } = setup(pedal);
    engine.recall(7);
    expect(sink.take()).toEqual([pc(7)]);
  });
});

describe('EditorEngine footswitches', () => {
  it('short press toggles, long press runs the momentary hold action', () => {
    const { engine, sink, advance } = setup(pedal);
    engine.pressStart('right');
    advance(100);
    engine.pressEnd('right');
    expect(sink.take()).toEqual([cc(102, 1)]);

    engine.pressStart('right');
    advance(700);
    expect(engine.getState().held.has('right')).toBe(true);
    engine.pressEnd('right');
    expect(sink.take()).toEqual([cc(24, 1), cc(24, 0)]);
    expect(engine.getState().values.s1).toBe(1);
  });

  it('hold is ignored when its condition is not met', () => {
    const { engine, sink, advance } = setup(pedal);
    engine.pressStart('right');
    advance(700);
    engine.pressEnd('right');
    // not held → counts as a press
    expect(sink.take()).toEqual([cc(102, 1)]);
  });

  it('pointer leaving during a hold releases it (no stuck state)', () => {
    const { engine, sink, advance } = setup(pedal);
    engine.pressStart('left');
    advance(700);
    engine.pressEnd('left', true);
    expect(sink.take()).toEqual([cc(25, 1), cc(25, 0)]);
    expect(engine.getState().held.size).toBe(0);
  });
});

describe('EditorEngine tempo', () => {
  it('each tap sends the tap CC and the BPM is stored once known', () => {
    const { engine, sink, advance } = setup(pedal);
    engine.tap();
    advance(500);
    engine.tap();
    expect(sink.take()).toEqual([cc(93, 127), cc(93, 127)]);
    expect(engine.getState().values.bpm).toBe(120);
  });

  it('setting a tempo sends two taps one beat apart', () => {
    const { engine, sink, advance } = setup(pedal);
    engine.setTempo(100);
    expect(sink.take()).toEqual([cc(93, 127)]);
    advance(599);
    expect(sink.take()).toEqual([]);
    advance(1);
    expect(sink.take()).toEqual([cc(93, 127)]);
  });

  it('commands send their CC', () => {
    const { engine, sink } = setup(pedal);
    engine.command('reset');
    expect(sink.take()).toEqual([cc(56, 1)]);
  });

  it('a tap with a bpm control stores the tempo without re-sending it', () => {
    const { engine, sink, advance } = setup(pedal);
    engine.tap();
    advance(600);
    engine.tap();
    sink.take();
    expect(engine.getState().values.bpm).toBe(100);
    expect(engine.getState().tapBpm).toBe(100);
    advance(2000);
    expect(sink.take()).toEqual([]); // no scheduled second tap after manual taps
  });

  it('dispose cancels the pending second tap', () => {
    const { engine, sink, advance } = setup(pedal);
    engine.setTempo(120);
    sink.take();
    engine.dispose();
    advance(1000);
    expect(sink.take()).toEqual([]);
  });

  it('a typed tempo works without a bpm control: two taps, BPM shown, nothing stored', () => {
    const noBpmControl: PedalDefinition = { ...pedal, tap: { cc: 93, value: 127 } };
    const { engine, sink, advance } = setup(noBpmControl);
    expect(engine.setTempo(150)).toBe(true);
    expect(sink.take()).toEqual([cc(93, 127)]);
    advance(400);
    expect(sink.take()).toEqual([cc(93, 127)]);
    expect(engine.getState().tapBpm).toBe(150);
    expect(engine.getState().values.bpm).toBe(120); // untouched default of the unused control
  });

  it('rejects tempos outside 20–300, fractions and pedals without tap', () => {
    const { engine, sink } = setup(pedal);
    for (const bad of [19, 301, 100.5, Number.NaN]) expect(engine.setTempo(bad)).toBe(false);
    expect(sink.take()).toEqual([]);
    expect(engine.setTempo(20)).toBe(true);
    expect(engine.setTempo(300)).toBe(true);
    const without = setup({ ...pedal, tap: undefined });
    expect(without.engine.setTempo(120)).toBe(false);
  });

  it('tap and typed tempo are blocked while the pedal says tap is not available', () => {
    const gated: PedalDefinition = { ...pedal, tap: { cc: 93, value: 127, enabled: (v) => v.t1 === 2 } };
    const { engine, sink } = setup(gated);
    expect(engine.tapEnabled).toBe(true);
    engine.set('t1', 1);
    sink.take();
    expect(engine.tapEnabled).toBe(false);
    engine.tap();
    expect(engine.setTempo(120)).toBe(false);
    expect(sink.take()).toEqual([]);
  });
});

describe('parseBpm', () => {
  it('accepts whole numbers in range and explains everything else', () => {
    expect(parseBpm(' 120 ')).toEqual({ bpm: 120 });
    expect(parseBpm('')).toEqual({ error: 'Enter a tempo in BPM' });
    expect(parseBpm('fast')).toEqual({ error: 'Enter a number' });
    expect(parseBpm('99.5')).toEqual({ error: 'Whole numbers only' });
    expect(parseBpm('10')).toEqual({ error: 'Between 20 and 300 BPM' });
    expect(parseBpm('301')).toEqual({ error: 'Between 20 and 300 BPM' });
  });
});

// A simpler pedal: no hold actions, no tap, no save CC, no "live before load"
const plain: PedalDefinition = {
  ...pedal,
  presets: {},
  tap: undefined,
  face: {
    ...pedal.face,
    footswitches: [
      { id: 'left', label: 'Aux', press: { type: 'toggle', control: 's2' } },
      { id: 'right', label: 'Bypass', press: { type: 'toggle', control: 's1' } },
    ],
  },
};

describe('EditorEngine loading and sending', () => {
  it('load goes live first only when the pedal needs it', () => {
    const live = setup(pedal);
    live.engine.load({ k1: 5 });
    expect(live.sink.take()[0]).toEqual(pc(0));

    const direct = setup(plain);
    direct.engine.load({ k1: 5 });
    expect(direct.sink.take().some((m) => m.type === 'pc')).toBe(false);
  });

  it('setMany re-sends values even when unchanged', () => {
    const { engine, sink } = setup(plain);
    engine.setMany({ k1: 10, t1: 2 }); // both are the defaults
    expect(sink.take()).toEqual([cc(14, 10), cc(21, 2)]);
  });

  it('sendAll pushes every CC once and re-sends the tempo', () => {
    const { engine, sink, advance } = setup(pedal);
    engine.sendAll();
    const sent = sink.take();
    const ccs = sent.filter((m) => m.type === 'cc').map((m) => (m.type === 'cc' ? m.cc : -1));
    expect(new Set(ccs).size).toBe(ccs.length);
    expect(ccs).toEqual(expect.arrayContaining([14, 15, 21, 102, 103, 93]));
    advance(500);
    expect(sink.take()).toEqual([cc(93, 127)]); // second tap one beat (120 bpm) later
  });

  it('ignores unknown controls and out-of-range values silently', () => {
    const { engine, sink } = setup(plain);
    engine.set('nope', 1);
    engine.set('k1', Number.NaN);
    expect(sink.take()).toEqual([]);
    expect(engine.getState().values.k1).toBe(10);
  });

  it('stops ping-pong onChange rules after a bounded number of steps', () => {
    const loop: PedalDefinition = {
      ...plain,
      onChange: (id, v): ControlValues | undefined => (id === 'k1' ? { k2: v } : id === 'k2' ? { k1: (v + 1) % 128 } : undefined),
    };
    const { engine, sink } = setup(loop);
    expect(() => engine.set('k1', 1)).not.toThrow();
    const sent = sink.take();
    expect(sent.length).toBe(2); // one CC per control, last value wins
    expect(engine.getState().values.k1).toBe(engine.getState().values.k2 + 1);
  });

  it('notifies subscribers once per change and stops after unsubscribe', () => {
    const { engine } = setup(plain);
    let calls = 0;
    const off = engine.subscribe(() => calls++);
    engine.set('k1', 1);
    engine.set('k1', 1);
    expect(calls).toBe(1);
    off();
    engine.set('k1', 2);
    expect(calls).toBe(1);
  });
});

describe('EditorEngine events', () => {
  it('reports user actions by name, but not internal follow-ups', () => {
    const events: string[] = [];
    const { engine, advance } = setup({ ...pedal, onChange: pedal.onChange }, undefined, (name, params) => events.push(`${name} ${JSON.stringify(params ?? {})}`));
    engine.set('t1', 3); // onChange sets k2 — no second event
    engine.randomize('knobs');
    engine.store(5);
    engine.command('reset');
    engine.pressStart('right');
    engine.pressEnd('right');
    engine.pressStart('right');
    advance(700);
    engine.pressEnd('right');
    expect(events).toEqual([
      'control_edit {"control":"t1"}',
      'randomize {"group":"knobs"}',
      'pedal_store {"slot":5}',
      'command {"command":"reset"}',
      'footswitch {"switch":"right","action":"press"}',
      'footswitch {"switch":"right","action":"hold"}',
    ]);
  });
});

describe('EditorEngine footswitches without hold actions', () => {
  it('fires on press-down for better timing and ignores double presses', () => {
    const { engine, sink } = setup(plain);
    engine.pressStart('right');
    expect(sink.take()).toEqual([cc(102, 1)]);
    engine.pressStart('right'); // already down
    engine.pressEnd('right');
    engine.pressEnd('right'); // not down any more
    expect(sink.take()).toEqual([]);
  });

  it('ignores unknown footswitches and taps on pedals without tap tempo', () => {
    const { engine, sink } = setup(plain);
    engine.pressStart('nope');
    engine.tap();
    engine.setTempo(100);
    expect(sink.take()).toEqual([]);
  });
});

describe('EditorEngine pedal preset edge cases', () => {
  it('recall 0 goes live, invalid slots are ignored, repeated recalls flip the LED', () => {
    const { engine, sink } = setup(plain);
    engine.recall(0);
    expect(sink.take()).toEqual([pc(0)]);
    expect(engine.getState().preset).toEqual({ kind: 'live' });
    engine.recall(123);
    engine.recall(1.5);
    expect(sink.take()).toEqual([]);
    engine.recall(9);
    engine.recall(9);
    expect(sink.take()).toEqual([pc(9), pc(9)]);
    expect(engine.getState().preset).toEqual({ kind: 'recall', slot: 9, flip: true });
  });

  it('store refuses slots outside the range and pedals without a save CC', () => {
    const withStore = setup(pedal);
    expect(withStore.engine.store(123)).toBe(false);
    expect(withStore.engine.store(122)).toBe(true);
    expect(withStore.sink.take()).toEqual([cc(111, 122)]);
    const without = setup(plain);
    expect(without.engine.store(1)).toBe(false);
    expect(without.sink.take()).toEqual([]);
  });
});

/** Automatone-style pedal: no live state, 0-based slots, footswitches that depend on a mode button. */
const automatone: PedalDefinition = {
  ...pedal,
  presets: { toggle: false, store: { cc: 27, minSlot: 0, maxSlot: 29 }, recall: { first: 0, last: 29, program: (s) => s, label: 'Preset' } },
  controls: [...pedal.controls, select('mode', 'MODE', 24, 0, [{ value: 0, label: 'Delay' }, { value: 3, label: 'Loop' }])],
  face: {
    ...pedal.face,
    footswitches: [
      {
        id: 'left',
        label: 'Tap',
        labelFor: (v) => (v.mode === 3 ? 'Record' : undefined),
        press: { type: 'by', action: (v) => (v.mode === 3 ? { type: 'command', id: 'rec' } : { type: 'tap' }) },
        hold: { type: 'by', action: (v) => (v.mode === 3 ? { type: 'command', id: 'delete' } : { type: 'momentary', cc: 106, on: 1, off: 0 }), label: 'Hold' },
      },
      { id: 'right', label: 'Bypass', press: { type: 'toggle', control: 's1' } },
    ],
  },
  commands: [
    { id: 'rec', label: 'Record', cc: 104, value: 127, enabled: (v) => v.mode === 3 },
    { id: 'delete', label: 'Delete', cc: 106, value: 127, enabled: (v) => v.mode === 3 },
  ],
};

describe('EditorEngine value-dependent footswitches and commands', () => {
  it('resolves `by` actions with the values at press time, for click and hold', () => {
    const { engine, sink, advance } = setup(automatone);
    engine.pressStart('left');
    engine.pressEnd('left');
    expect(sink.take()).toEqual([cc(93, 127)]); // delay mode: tap
    engine.pressStart('left');
    advance(700);
    engine.pressEnd('left');
    expect(sink.take()).toEqual([cc(106, 1), cc(106, 0)]); // delay mode: momentary hold

    engine.set('mode', 3);
    sink.take();
    engine.pressStart('left');
    engine.pressEnd('left');
    engine.pressStart('left');
    advance(700);
    engine.pressEnd('left');
    expect(sink.take()).toEqual([cc(104, 127), cc(106, 127)]); // loop mode: record, delete
  });

  it('commands with `enabled` do nothing while disabled', () => {
    const { engine, sink } = setup(automatone);
    engine.command('rec');
    expect(sink.take()).toEqual([]);
    engine.set('mode', 3);
    sink.take();
    engine.command('rec');
    expect(sink.take()).toEqual([cc(104, 127)]);
  });

  it('stores and recalls slot 0 when the pedal has no live state', () => {
    const { engine, sink } = setup(automatone);
    expect(engine.store(0)).toBe(true);
    engine.recall(0);
    engine.recall(29);
    engine.recall(30);
    expect(sink.take()).toEqual([cc(27, 0), pc(0), pc(29)]);
    expect(engine.getState().preset).toEqual({ kind: 'recall', slot: 29, flip: true });
  });
});
