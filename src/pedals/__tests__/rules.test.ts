import { describe, expect, it } from 'vitest';
import { cc, MemoryStorage, pc, setup } from '../../editor/core/__tests__/helpers';
import { PresetStore } from '../../editor/core/presets';
import { blooper } from '../blooper';
import { brothersam } from '../brothersam';
import { clean } from '../clean';
import { genlossmkii } from '../genlossmkii';
import { habit } from '../habit';
import { lossy } from '../lossy';
import { lostfound, modeFor } from '../lostfound';
import { mood } from '../mood';
import { moodmkii } from '../moodmkii';
import { onward } from '../onward';
import { reversemodec } from '../reversemodec';
import { warpedvinylmkii } from '../warpedvinylmkii';

const hold = (engine: { pressStart(id: string): void; pressEnd(id: string): void }, advance: (ms: number) => void, id: string) => {
  engine.pressStart(id);
  advance(700);
  engine.pressEnd(id);
};

const click = (engine: { pressStart(id: string): void; pressEnd(id: string): void }, id: string) => {
  engine.pressStart(id);
  engine.pressEnd(id);
};

describe('MOOD (MKI) bypass on CC103', () => {
  it('encodes both footswitches in one value', () => {
    const { engine, sink } = setup(mood);
    click(engine, 's1'); // loop on, wet already on
    expect(sink.take()).toEqual([cc(103, 127)]);
    click(engine, 's2'); // wet off
    expect(sink.take()).toEqual([cc(103, 45)]);
    click(engine, 's1'); // loop off
    expect(sink.take()).toEqual([cc(103, 0)]);
  });

  it('switching the micro-looper program stops the looper', () => {
    const { engine, sink } = setup(mood);
    click(engine, 's1');
    sink.take();
    engine.set('t3', 3);
    expect(sink.take()).toEqual([cc(23, 3), cc(103, 85)]);
  });

  it('loads 2023 presets with the 45/85 encoding', () => {
    const storage = new MemoryStorage();
    storage.setItem('mood', JSON.stringify({ 1: { name: 'x', settings: { s1: 45, s2: 0, s5: 85 } } }));
    expect(new PresetStore(mood, storage).list()[0].values).toMatchObject({ s1: 45, s2: 0 });
  });

  it('loading a preset goes live first and sends CC103 exactly once', () => {
    const { engine, sink } = setup(mood);
    engine.load({ ...engine.getState().values, s1: 45, s2: 85 });
    const sent = sink.take();
    expect(sent[0]).toEqual(pc(0));
    expect(sent.filter((m) => m.type === 'cc' && m.cc === 103)).toEqual([cc(103, 127)]);
  });

  it('"both off" idea bypasses both channels', () => {
    const { engine, sink } = setup(mood);
    engine.setMany({ s1: 0, s2: 0 });
    expect(sink.take()).toEqual([cc(103, 0)]);
  });
});

describe('MOOD MKII', () => {
  it('freeze only works while the wet channel is on', () => {
    const { engine, sink, advance } = setup(moodmkii);
    engine.pressStart('s2');
    advance(700);
    engine.pressEnd('s2');
    expect(sink.take()).toEqual([cc(105, 1), cc(105, 0)]);
    engine.set('s2', 0);
    sink.take();
    engine.pressStart('s2');
    advance(700);
    engine.pressEnd('s2');
    expect(sink.take()).toEqual([cc(103, 1)]); // treated as a click
  });

  it('taps with CC107 and a non-zero value every time', () => {
    const { engine, sink } = setup(moodmkii);
    engine.tap();
    engine.tap();
    expect(sink.take()).toEqual([cc(107, 127), cc(107, 127)]);
  });

  it('randomize everything never touches the global settings', () => {
    const { engine, sink } = setup(moodmkii);
    engine.randomize('all');
    const ccs = sink.take().map((m) => (m.type === 'cc' ? m.cc : -1));
    for (const global of [51, 52, 55, 53, 54]) expect(ccs).not.toContain(global);
  });

  it('loop footswitch: click toggles CC102, hold overdubs on CC106', () => {
    const { engine, sink, advance } = setup(moodmkii);
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(102, 1)]);
    engine.pressStart('s1');
    advance(700);
    engine.pressEnd('s1');
    expect(sink.take()).toEqual([cc(106, 1), cc(106, 0)]);
  });

  it('stores in slots 1–122 only and resets MIDI with CC110', () => {
    const { engine, sink } = setup(moodmkii);
    expect(engine.store(0)).toBe(false);
    expect(engine.store(122)).toBe(true);
    engine.command('midi-reset');
    expect(sink.take()).toEqual([cc(111, 122), cc(110, 1)]);
  });

  it('the classic dip switches the editor to the classic look', () => {
    const { engine } = setup(moodmkii);
    expect(moodmkii.themeFor?.(engine.getState().values)).toBeUndefined();
    engine.set('d9', 1);
    expect(moodmkii.themeFor?.(engine.getState().values)).toMatchObject({ body: expect.any(String) });
  });
});

describe('Generation Loss MKII', () => {
  it('bypassing also switches aux off; aux needs the pedal engaged', () => {
    const { engine, sink } = setup(genlossmkii);
    click(engine, 's2');
    expect(sink.take()).toEqual([cc(103, 1)]);
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(102, 0), cc(103, 0)]);
    click(engine, 's2');
    expect(sink.take()).toEqual([cc(103, 0)]);
  });

  it('classic mode relabels knobs', () => {
    const { engine } = setup(genlossmkii);
    const k3 = engine.control('k3');
    engine.set('d10', 1);
    expect(k3?.kind === 'knob' && k3.labelFor?.(engine.getState().values)).toBe('LOW PASS');
  });

  it('maps legacy BYPASS TYPE knob values to the CC26 threshold', () => {
    const storage = new MemoryStorage();
    storage.setItem('genlossmkii', JSON.stringify({ 1: { name: 'a', settings: { k8: 30 } }, 2: { name: 'b', settings: { k8: 90 } } }));
    const [a, b] = new PresetStore(genlossmkii, storage).list();
    expect([a.values.k8, b.values.k8]).toEqual([0, 127]);
  });

  it('randomize everything leaves bypass, aux, bypass type and ramp/bounce alone', () => {
    const { engine, sink } = setup(genlossmkii);
    engine.randomize('all');
    const ccs = sink.take().map((m) => (m.type === 'cc' ? m.cc : -1));
    for (const keep of [102, 103, 26, 32, 52]) expect(ccs).not.toContain(keep);
  });
});

describe('Warped Vinyl MKII', () => {
  it('a clock division switches MIDI clock listening on', () => {
    const { engine, sink } = setup(warpedvinylmkii);
    engine.set('s4', 0);
    sink.take();
    engine.set('s3', 4);
    expect(sink.take()).toEqual([cc(21, 4), cc(51, 127)]);
  });

  it('sends no CCs for the toggles', () => {
    expect(warpedvinylmkii.controls.some((c) => c.cc === 22 || c.cc === 23)).toBe(false);
  });

  it('bypass uses 0 / 127 as the manual requires', () => {
    const { engine, sink } = setup(warpedvinylmkii);
    click(engine, 's1');
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(102, 0), cc(102, 127)]);
  });

  it('tempo: taps set the BPM, the BPM input sends two taps, presets go live first', () => {
    const { engine, sink, advance } = setup(warpedvinylmkii);
    click(engine, 'tap');
    advance(500);
    click(engine, 'tap');
    expect(sink.take()).toEqual([cc(93, 127), cc(93, 127)]);
    expect(engine.getState().values.s2).toBe(120);

    engine.setTempo(90);
    advance(667);
    expect(sink.take()).toEqual([cc(93, 127), cc(93, 127)]);

    engine.load({ ...engine.getState().values, k1: 3 });
    expect(sink.take()[0]).toEqual(pc(0));
  });
});

describe('Habit', () => {
  it('holding bypass loops momentarily, holding tap scans', () => {
    const { engine, sink, advance } = setup(habit);
    engine.pressStart('s1');
    advance(700);
    engine.pressEnd('s1');
    engine.pressStart('tap');
    advance(700);
    engine.pressEnd('tap');
    expect(sink.take()).toEqual([cc(24, 1), cc(24, 0), cc(25, 1), cc(25, 0)]);
  });

  it('clear memory uses CC26 (manual), not CC53', () => {
    const { engine, sink } = setup(habit);
    engine.command('clear');
    expect(sink.take()).toEqual([cc(26, 127)]);
  });

  it('applying an idea sets the modifier toggles', () => {
    const { engine, sink } = setup(habit);
    engine.setMany(habit.ideas![0].items[0].values);
    expect(sink.take()).toEqual([cc(21, 2), cc(22, 3), cc(23, 1), cc(17, 80)]);
  });

  it('randomize everything keeps bypass, loop, scan and MIDI clock', () => {
    const { engine, sink } = setup(habit);
    engine.randomize('all');
    const ccs = sink.take().map((m) => (m.type === 'cc' ? m.cc : -1));
    for (const keep of [102, 24, 25, 51, 93]) expect(ccs).not.toContain(keep);
  });

  it('the LED follows the tempo and shows scanning / looping', () => {
    const { engine } = setup(habit);
    const leds = () => habit.leds(engine.getState());
    expect(leds()[0]).toEqual({ color: 'red', blinkMs: 500 }); // 120 bpm
    engine.set('s4', 1);
    engine.set('s3', 1);
    expect(leds()[0]).toEqual({ color: 'green' });
    expect(leds()[2]).toEqual({ color: 'green' });
  });
});

describe('Reverse Mode C', () => {
  it('tap hold freezes (CC105), bypass hold halves the speed (CC106)', () => {
    const { engine, sink, advance } = setup(reversemodec);
    engine.pressStart('tap');
    advance(700);
    engine.pressEnd('tap');
    engine.pressStart('s1');
    advance(700);
    engine.pressEnd('s1');
    expect(sink.take()).toEqual([cc(105, 1), cc(105, 0), cc(106, 1), cc(106, 0)]);
  });

  it('short presses tap (CC93) and toggle bypass (CC102)', () => {
    const { engine, sink } = setup(reversemodec);
    click(engine, 'tap');
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(93, 127), cc(102, 0)]);
  });

  it('sequencer subdivision sends the start of each manual range', () => {
    const { engine, sink } = setup(reversemodec);
    engine.set('c1', 112);
    expect(sink.take()).toEqual([cc(24, 112)]);
  });

  it('mod depth shows the modulation flavour incl. the MOD TYPE dip', () => {
    const { engine } = setup(reversemodec);
    const k9 = engine.control('k9');
    const detail = () => (k9?.kind === 'knob' ? k9.detail?.(engine.getState().values) : undefined);
    expect(detail()).toBe('Vibrato');
    engine.set('t2', 3);
    engine.set('d16', 1);
    expect(detail()).toBe('Frequency shift down');
  });

  it('stores on the pedal with CC111', () => {
    const { engine, sink } = setup(reversemodec);
    engine.store(12);
    expect(sink.take()).toEqual([cc(111, 12)]);
  });

  it('randomize everything skips SWAP, bypass and the global settings', () => {
    const { engine, sink } = setup(reversemodec);
    engine.randomize('all');
    const ccs = sink.take().map((m) => (m.type === 'cc' ? m.cc : -1));
    for (const keep of [71, 102, 51, 52, 57]) expect(ccs).not.toContain(keep);
    expect(ccs).toEqual(expect.arrayContaining([14, 21, 24, 25, 31, 33, 61, 78]));
  });

  it('LEDs: tap blinks with the tempo, bypass shows red while engaged', () => {
    const { engine, advance } = setup(reversemodec);
    const leds = () => reversemodec.leds(engine.getState());
    expect(leds()).toEqual([{ color: 'off' }, { color: 'off' }, { color: 'red' }]);
    click(engine, 'tap');
    advance(500);
    click(engine, 'tap');
    expect(leds()[0]).toEqual({ color: 'red', blinkMs: 500 });
    click(engine, 's1');
    expect(leds()[2]).toEqual({ color: 'off' });
  });
});

describe('Brothers AM', () => {
  it('left footswitch is channel 2 (CC103), right is channel 1 (CC102)', () => {
    const { engine, sink } = setup(brothersam);
    click(engine, 's2');
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(103, 1), cc(102, 0)]);
  });

  it('gain types count in opposite directions, as printed on the pedal', () => {
    const { engine, sink } = setup(brothersam);
    engine.set('t1', 1); // GAIN 2: Boost
    engine.set('t3', 1); // GAIN 1: Dist
    expect(sink.take()).toEqual([cc(21, 1), cc(23, 1)]);
    const t1 = engine.control('t1');
    const t3 = engine.control('t3');
    expect(t1?.kind === 'toggle' && t1.options[0].label).toBe('Boost');
    expect(t3?.kind === 'toggle' && t3.options[0].label).toBe('Dist');
  });

  it('HI GAIN turns the channel LED red', () => {
    const { engine } = setup(brothersam);
    const leds = () => brothersam.leds(engine.getState());
    expect(leds()[2]).toEqual({ color: 'amber' });
    engine.set('d9', 1);
    expect(leds()[2]).toEqual({ color: 'red' });
  });

  it('has no ramp speed, no ramp/bounce and no MIDI clock', () => {
    expect(brothersam.controls.some((c) => c.cc === 20 || c.cc === 52 || c.cc === 51)).toBe(false);
  });
});

describe('Clean', () => {
  it('bypass hold maxes the dynamics (CC106); aux toggles swell (CC103)', () => {
    const { engine, sink, advance } = setup(clean);
    hold(engine, advance, 's1');
    click(engine, 's2');
    expect(sink.take()).toEqual([cc(106, 1), cc(106, 0), cc(103, 1)]);
  });

  it('shifty mode uses the manual values 1 and 3', () => {
    const { engine, sink } = setup(clean);
    engine.set('h2', 3);
    engine.set('h2', 2); // not a valid position
    expect(sink.take()).toEqual([cc(32, 3)]);
  });
});

describe('Onward', () => {
  it('footswitches: glitch left (CC103, hold CC105), freeze right (CC102, hold CC106)', () => {
    const { engine, sink, advance } = setup(onward);
    click(engine, 's2');
    hold(engine, advance, 's2');
    click(engine, 's1');
    hold(engine, advance, 's1');
    expect(sink.take()).toEqual([cc(103, 1), cc(105, 1), cc(105, 0), cc(102, 1), cc(106, 1), cc(106, 0)]);
  });

  it('retrigger commands fire without confirmation', () => {
    const { engine, sink } = setup(onward);
    engine.command('retrigger-glitch');
    engine.command('retrigger-freeze');
    expect(sink.take()).toEqual([cc(108, 127), cc(109, 127)]);
    expect(onward.commands?.find((c) => c.id === 'retrigger-glitch')?.confirm).toBeUndefined();
    expect(onward.commands?.find((c) => c.id === 'factory-reset')?.confirm).toBeDefined();
  });

  it('octave and texture are off at noon', () => {
    const { engine } = setup(onward);
    const k3 = engine.control('k3');
    const readout = (v: number) => (k3?.kind === 'knob' ? k3.readout?.(v, engine.getState().values)?.label : undefined);
    expect(readout(64)).toBe('Off');
    expect(readout(10)).toBe('Lower octave');
    expect(readout(120)).toBe('Upper octave');
  });

  it('sync subdivision sends CC53 0–8', () => {
    const { engine, sink } = setup(onward);
    engine.set('c1', 8);
    expect(sink.take()).toEqual([cc(53, 8)]);
  });
});

describe('Lossy', () => {
  it('freeze: press = slushie (CC103), hold = solid (CC105); bypass hold = gate (CC106)', () => {
    const { engine, sink, advance } = setup(lossy);
    click(engine, 's2');
    hold(engine, advance, 's2');
    hold(engine, advance, 's1');
    expect(sink.take()).toEqual([cc(103, 1), cc(105, 1), cc(105, 0), cc(106, 1), cc(106, 0)]);
  });

  it('randomize everything keeps bypass, freeze, TRAILS, LATCH and the globals', () => {
    const { engine, sink } = setup(lossy);
    engine.randomize('all');
    const ccs = sink.take().map((m) => (m.type === 'cc' ? m.cc : -1));
    for (const keep of [102, 103, 73, 74, 52, 57]) expect(ccs).not.toContain(keep);
  });
});

describe('Lost + Found', () => {
  it('resolves the mode from the effect toggle and the MODIFY side', () => {
    const { engine } = setup(lostfound);
    const v = () => engine.getState().values;
    expect(modeFor('L', v())?.name).toBe('Slow-verb'); // t1 = 1, MODIFY below noon
    engine.set('k4', 100);
    expect(modeFor('L', v())?.name).toBe('Useful Ambience');
    engine.set('t3', 3);
    expect(modeFor('R', v())?.name).toBe('Ensemble Expander');
    engine.set('k6', 64);
    expect(modeFor('R', v())).toBeUndefined(); // noon = no effect
  });

  it('SWAP dips take the other channel\'s modes', () => {
    const { engine } = setup(lostfound);
    engine.set('d12', 1); // L SWAP
    expect(modeFor('L', engine.getState().values)?.name).toBe('Tape Echo');
    engine.set('d13', 1); // R SWAP
    expect(modeFor('R', engine.getState().values)?.name).toBe('Slow-verb');
  });

  it('TIME and ALT knobs explain what they do in the current mode', () => {
    const { engine } = setup(lostfound);
    engine.set('t1', 3);
    const k1 = engine.control('k1');
    const k7 = engine.control('k7');
    expect(k1?.kind === 'knob' && k1.detail?.(engine.getState().values)).toBe('Pinging Phaser · Rate');
    expect(k7?.kind === 'knob' && k7.detail?.(engine.getState().values)).toBe('Pinging Phaser · Resonance');
  });

  it('subdivisions, random-mode commands and ramping polarity follow the manual', () => {
    const { engine, sink } = setup(lostfound);
    engine.set('c1', 12); // double whole = >11
    engine.set('c2', 0);
    engine.command('random-both');
    engine.set('d18', 0); // ramping stopped
    expect(sink.take()).toEqual([cc(53, 12), cc(54, 0), cc(114, 127), cc(52, 0)]);
  });
});

describe('Blooper', () => {
  it('left footswitch toggles RECORD (CC1 127/0), hold = one-shot overdub (CC9)', () => {
    const { engine, sink, advance } = setup(blooper);
    click(engine, 'rec');
    click(engine, 'rec');
    hold(engine, advance, 'rec');
    expect(sink.take()).toEqual([cc(1, 127), cc(1, 0), cc(9, 127)]);
  });

  it('right footswitch stops (CC4), hold = hold switch B (CC8); transport buttons send their CC', () => {
    const { engine, sink, advance } = setup(blooper);
    click(engine, 'stop');
    hold(engine, advance, 'stop');
    engine.command('play');
    engine.command('undo');
    engine.command('undo'); // repeatable
    expect(sink.take()).toEqual([cc(4, 127), cc(8, 127), cc(2, 127), cc(5, 127), cc(5, 127)]);
  });

  it('modifier buttons send 127 on every click and are never replayed', () => {
    const { engine, sink } = setup(blooper);
    engine.set('b1', 1);
    engine.set('b1', 0);
    expect(sink.take()).toEqual([cc(30, 127), cc(30, 127)]);
    engine.set('b1', 1);
    sink.take();
    engine.sendAll();
    engine.reset();
    engine.load({ ...engine.getState().values, b1: 0, b2: 1, rec: 127 });
    const ccs = sink.take().map((m) => (m.type === 'cc' ? m.cc : -1));
    for (const transient of [1, 2, 3, 4, 5, 6, 7, 8, 9, 30, 31]) expect(ccs).not.toContain(transient);
    expect(engine.getState().values.b1).toBe(1); // state kept, not overwritten by the preset
  });

  it('LEDs follow the transport: red recording, green playing, off stopped; buttons blue', () => {
    const { engine } = setup(blooper);
    const leds = () => blooper.leds(engine.getState());
    expect(leds()[0]).toEqual({ color: 'off' });
    engine.set('rec', 127);
    expect(leds()[0]).toEqual({ color: 'red' });
    engine.set('rec', 0);
    expect(leds()[0]).toEqual({ color: 'green' });
    engine.command('stop');
    expect(leds()[0]).toEqual({ color: 'off' });
    engine.set('b2', 1);
    expect(blooper.buttonLeds?.(engine.getState())).toEqual([{ color: 'off' }, { color: 'blue' }]);
  });

  it('loops are zero-based program changes 0–15 and there is no live / preset toggle', () => {
    const { engine, sink } = setup(blooper);
    engine.recall(1);
    engine.recall(16);
    engine.recall(0);
    engine.recall(17);
    engine.presetToggle('middle');
    expect(sink.take()).toEqual([pc(0), pc(15)]);
    expect(engine.recallRange.label).toBe('Loop');
  });
});
