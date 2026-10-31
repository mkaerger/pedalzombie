import { describe, expect, it } from 'vitest';
import { cc, MemoryStorage, pc, setup } from '../../editor/core/__tests__/helpers';
import { PresetStore } from '../../editor/core/presets';
import { describeSlot, nextBank, nextPreset } from '../automatone';
import { badmood, FLIP_CHORDS } from '../badmood';
import { bigtime, SUBDIVISIONS } from '../bigtime';
import { blissfactory } from '../blissfactory';
import { blooper } from '../blooper';
import { brothersam } from '../brothersam';
import { clean } from '../clean';
import { condor, condorFreqHz, condorhifi } from '../condor';
import { crossHz, cxm } from '../cxm';
import { darkworld } from '../darkworld';
import { genlossmkii } from '../genlossmkii';
import { gravitas } from '../gravitas';
import { habit } from '../habit';
import { lossy } from '../lossy';
import { lostfound, modeFor } from '../lostfound';
import { mood } from '../mood';
import { moodmkii } from '../moodmkii';
import { onward } from '../onward';
import { freqHz, preampmkii } from '../preampmkii';
import { reversemodec } from '../reversemodec';
import { thermae } from '../thermae';
import { tonalrecall, TR_DIVISIONS } from '../tonalrecall';
import { warpedvinylhifi } from '../warpedvinylhifi';
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

describe('BAD MOOD', () => {
  it('footswitches mirror MOOD MKII: wet left (CC103, hold freeze CC105), loop right (CC102, hold overdub CC106)', () => {
    const { engine, sink, advance } = setup(badmood);
    click(engine, 's2');
    hold(engine, advance, 's2');
    click(engine, 's1');
    hold(engine, advance, 's1');
    expect(sink.take()).toEqual([cc(103, 0), cc(105, 1), cc(105, 0), cc(102, 1), cc(106, 1), cc(106, 0)]);
  });

  it('names the Flip chord on the wet MODIFY knob and the radio station on the loop MODIFY knob', () => {
    const { engine } = setup(badmood);
    const readout = (id: string, v: number) => {
      const c = engine.control(id);
      return c?.kind === 'knob' ? c.readout?.(v, engine.getState().values)?.label : undefined;
    };
    expect(readout('k4', 64)).toBeUndefined(); // Soup: no chords
    engine.set('t1', 3); // Flip
    expect(readout('k4', 0)).toBe('Chord 1 · -Oct');
    expect(readout('k4', 17)).toBe('Chord 7 · -Oct -5th');
    expect(readout('k4', 107)).toBe('Chord 41 · -Oct -5th -4th +4th');
    expect(readout('k4', 127)).toBe('Chord 48 · +4th +Oct -Oct -4th');
    expect(readout('k6', 63)).toBe('Orchestral'); // Radio is the default looper mode
    expect(readout('k5', 127)).toBe('64k');
  });

  it('has 48 contiguous chord ranges covering 0–127', () => {
    expect(FLIP_CHORDS).toHaveLength(48);
    expect(FLIP_CHORDS[0].from).toBe(0);
    expect(FLIP_CHORDS[47].to).toBe(127);
    for (let i = 1; i < FLIP_CHORDS.length; i++) expect(FLIP_CHORDS[i].from).toBe(FLIP_CHORDS[i - 1].to + 1);
  });

  it('clock divisions go up to double whole (8), EQ per channel on CC85, tap on CC93', () => {
    const { engine, sink } = setup(badmood);
    engine.set('c1', 8);
    engine.set('c2', 0);
    engine.set('h4', 3);
    engine.tap();
    expect(sink.take()).toEqual([cc(53, 8), cc(54, 0), cc(85, 3), cc(93, 127)]);
  });
});

describe('Preamp MKII', () => {
  it('arcade buttons send only the documented values 1, 2 and 3', () => {
    const { engine, sink } = setup(preampmkii);
    engine.set('b5', 3);
    engine.set('b5', 0); // not a documented value
    engine.set('b5', 4);
    expect(sink.take()).toEqual([cc(26, 3)]);
    for (const c of preampmkii.controls) if (c.kind === 'arcade') expect(c.options.map((o) => o.value)).toEqual([1, 2, 3]);
  });

  it('PRESET steps through the bank, hold switches the bank, hold BYPASS saves to the current preset', () => {
    const { engine, sink, advance } = setup(preampmkii);
    click(engine, 'preset'); // unknown → preset 0
    click(engine, 'preset');
    hold(engine, advance, 'preset'); // bank 2, preset 1
    expect(sink.take()).toEqual([pc(0), pc(1), pc(11)]);
    hold(engine, advance, 'bypass');
    expect(sink.take()).toEqual([cc(27, 11)]);
    expect(engine.getState().preset).toMatchObject({ kind: 'store', slot: 11 });
    expect(preampmkii.leds(engine.getState())[0]).toMatchObject({ color: 'red' }); // bank 2
  });

  it('wraps presets within the bank and banks after the third', () => {
    expect(nextPreset(9)).toBe(0);
    expect(nextPreset(19)).toBe(10);
    expect(nextBank(25)).toBe(5);
    expect(describeSlot(17)).toBe('Bank 2 · preset 7');
  });

  it('hold BYPASS does nothing before a preset is known; click toggles CC102', () => {
    const { engine, sink, advance } = setup(preampmkii);
    hold(engine, advance, 'bypass');
    click(engine, 'bypass');
    expect(sink.take()).toEqual([cc(102, 0)]);
    expect(preampmkii.leds(engine.getState())[1]).toEqual({ color: 'off' });
  });

  it('MIDS and FREQ are marked inactive while the MIDS button is off', () => {
    const { engine } = setup(preampmkii);
    const f4 = engine.control('f4');
    const detail = () => (f4?.kind === 'fader' ? f4.detail?.(engine.getState().values) : undefined);
    expect(detail()).toBe('Inactive (MIDS off)');
    engine.set('b2', 2);
    expect(detail()).toBeUndefined();
    expect(freqHz(0)).toBe(150);
    expect(freqHz(127)).toBe(4200);
  });

  it('stores presets 0–29 and shows the preset number of the bank on the display', () => {
    const { engine } = setup(preampmkii);
    expect(engine.store(29)).toBe(true);
    expect(engine.store(30)).toBe(false);
    expect(preampmkii.face.format === 'automatone' && preampmkii.face.display?.(17)).toBe('7');
  });
});

describe('CXM 1978', () => {
  it('aux performance switches are one-shot 127s; sustain lock is inverted and never replayed', () => {
    const { engine, sink } = setup(cxm);
    engine.command('heel');
    engine.command('toe');
    engine.command('clear');
    engine.set('h1', 0); // locked
    expect(sink.take()).toEqual([cc(28, 127), cc(29, 127), cc(30, 127), cc(31, 0)]);
    engine.sendAll();
    expect(sink.take().some((m) => m.type === 'cc' && m.cc === 31)).toBe(false);
  });

  it('pre-delay explains its range from the CLOCK button; CROSS reads in Hz', () => {
    const { engine } = setup(cxm);
    const f6 = engine.control('f6');
    const detail = () => (f6?.kind === 'fader' ? f6.detail?.(engine.getState().values) : undefined);
    expect(detail()).toBe('≤ 42 ms (HiFi)');
    engine.set('b5', 3);
    expect(detail()).toMatch(/1\.7 s/);
    expect(crossHz(0)).toBe(0);
    expect(crossHz(64)).toBeGreaterThan(340);
    expect(crossHz(64)).toBeLessThan(380);
    expect(crossHz(127)).toBe(1700);
  });

  it('randomize everything keeps bypass, JUMP and sustain lock', () => {
    const { engine, sink } = setup(cxm);
    engine.randomize('all');
    const ccs = sink.take().map((m) => (m.type === 'cc' ? m.cc : -1));
    for (const keep of [102, 22, 31]) expect(ccs).not.toContain(keep);
    expect(ccs).toEqual(expect.arrayContaining([14, 19, 23, 26]));
  });
});

describe('Big Time', () => {
  const loop = (engine: { set(id: string, v: number): void }) => engine.set('b3', 3);

  it('buttons are 0-based with four states', () => {
    const { engine, sink } = setup(bigtime);
    engine.set('b1', 3);
    engine.set('b2', 1);
    engine.set('b2', 0);
    engine.set('b2', 4); // not a state
    expect(sink.take()).toEqual([cc(22, 3), cc(23, 1), cc(23, 0)]);
  });

  it('left switch: tap in SHORT / LONG, motion in MOD, rec / play / dub in LOOP — all on CC103', () => {
    const { engine, sink } = setup(bigtime);
    click(engine, 'tempo');
    engine.set('b3', 0);
    click(engine, 'tempo');
    loop(engine);
    click(engine, 'tempo');
    expect(sink.take()).toEqual([cc(103, 127), cc(24, 0), cc(103, 127), cc(24, 3), cc(103, 127)]);
    const label = (v: Record<string, number>) => bigtime.face.footswitches[0].labelFor?.(v);
    expect(label({ b3: 1 })).toBeUndefined();
    expect(label({ b3: 0 })).toBe('Motion');
    expect(label({ b3: 3 })).toBe('Rec / Play / Dub');
  });

  it('right switch: bypass (hold = HOLD) in the delay modes, play / stop (hold = delete) in LOOP', () => {
    const { engine, sink, advance } = setup(bigtime);
    click(engine, 'bypass');
    hold(engine, advance, 'bypass');
    expect(sink.take()).toEqual([cc(102, 0), cc(106, 1), cc(106, 0)]);
    loop(engine);
    sink.take();
    click(engine, 'bypass');
    hold(engine, advance, 'bypass');
    expect(sink.take()).toEqual([cc(102, 127), cc(106, 127)]);
  });

  it('in LOOP mode the bypass switch and preset loads never touch CC102, the transport is enabled', () => {
    const { engine, sink } = setup(bigtime);
    engine.command('record');
    expect(sink.take()).toEqual([]); // disabled outside LOOP
    loop(engine);
    sink.take();
    engine.set('s1', 0);
    engine.load({ ...engine.getState().values, s1: 1 });
    expect(sink.take().some((m) => m.type === 'cc' && m.cc === 102)).toBe(false);
    engine.command('record');
    engine.command('stop');
    expect(sink.take()).toEqual([cc(104, 127), cc(107, 127)]);
  });

  it('saves with CC27 = slot (0–126) or CC28 for the current slot', () => {
    const { engine, sink } = setup(bigtime);
    expect(engine.store(0)).toBe(true);
    expect(engine.store(126)).toBe(true);
    expect(engine.store(127)).toBe(false);
    engine.command('save-current');
    expect(sink.take()).toEqual([cc(27, 0), cc(27, 126), cc(28, 127)]);
  });

  it('the bypass LED is green with balanced I/O and red unbalanced', () => {
    const { engine } = setup(bigtime);
    expect(bigtime.leds(engine.getState())[1]).toEqual({ color: 'green' });
    engine.set('o7', 1);
    expect(bigtime.leds(engine.getState())[1]).toEqual({ color: 'red' });
    engine.set('s1', 0);
    expect(bigtime.leds(engine.getState())[1]).toEqual({ color: 'off' });
  });

  it('randomize everything keeps bypass, MODE, the options menu and the MIDI settings', () => {
    const { engine, sink } = setup(bigtime);
    engine.randomize('all');
    const ccs = sink.take().map((m) => (m.type === 'cc' ? m.cc : -1));
    for (const keep of [102, 24, 42, 43, 44, 45, 46, 47, 48, 54, 110, 112]) expect(ccs).not.toContain(keep);
    expect(ccs).toEqual(expect.arrayContaining([14, 19, 22, 26, 32, 37, 38, 41]));
  });

  it('has twelve tap subdivisions in manual order', () => {
    expect(SUBDIVISIONS).toHaveLength(12);
    expect(SUBDIVISIONS[6]).toEqual({ value: 6, label: 'Quarter' });
  });
});

describe('Condor and Condor HiFi', () => {
  it('bypass and drive travel together in CC103 with the original values 0 / 45 / 85 / 127', () => {
    const { engine, sink } = setup(condor);
    click(engine, 's2'); // drive on while engaged
    expect(sink.take()).toEqual([cc(103, 127)]);
    click(engine, 's1'); // bypass, drive still on
    expect(sink.take()).toEqual([cc(103, 85)]);
    click(engine, 's2'); // drive off, bypassed
    expect(sink.take()).toEqual([cc(103, 0)]);
    click(engine, 's1'); // engaged, clean
    expect(sink.take()).toEqual([cc(103, 45)]);
  });

  it('the HiFi sends the centre of each documented CC103 range', () => {
    const { engine, sink } = setup(condorhifi);
    click(engine, 's2');
    click(engine, 's1');
    click(engine, 's2');
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(103, 110), cc(103, 75), cc(103, 15), cc(103, 45)]);
  });

  it('never sends CC102 and goes live before loading a preset', () => {
    for (const pedal of [condor, condorhifi]) {
      const { engine, sink } = setup(pedal);
      engine.load({ ...engine.getState().values, s1: 0, s2: 1 });
      const sent = sink.take();
      expect(sent[0]).toEqual(pc(0));
      expect(sent.filter((m) => m.type === 'cc' && m.cc === 102)).toEqual([]);
      expect(sent.filter((m) => m.type === 'cc' && m.cc === 103)).toHaveLength(1);
    }
  });

  it('reads FREQ in Hz and the left LED shows clean / drive', () => {
    const { engine } = setup(condor);
    expect(condorFreqHz(0)).toBe(150);
    expect(condorFreqHz(64)).toBeGreaterThan(1150);
    expect(condorFreqHz(64)).toBeLessThan(1350);
    expect(condorFreqHz(127)).toBe(4200);
    expect(condor.leds(engine.getState())[0]).toEqual({ color: 'green' });
    engine.set('s2', 1);
    expect(condor.leds(engine.getState())[0]).toEqual({ color: 'red' });
  });
});

describe('Gravitas and Warped Vinyl HiFi', () => {
  it.each([
    ['Gravitas', gravitas, 4],
    ['Warped Vinyl HiFi', warpedvinylhifi, 6],
  ])('%s: tap on CC93, division switches the clock on, bypass is 0 / 127, channel %i', (_, pedal, channel) => {
    const { engine, sink, advance } = setup(pedal);
    expect(pedal.defaultChannel).toBe(channel);
    click(engine, 'tap');
    advance(500);
    click(engine, 'tap');
    expect(sink.take()).toEqual([cc(93, 127), cc(93, 127)]);
    expect(engine.getState().values.s2).toBe(120);
    engine.set('s4', 0);
    sink.take();
    engine.set('s3', 5);
    expect(sink.take()).toEqual([cc(21, 5), cc(51, 127)]);
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(102, 0)]);
  });

  it('has no toggle CCs: CC22 and CC23 are never sent', () => {
    for (const pedal of [gravitas, warpedvinylhifi]) {
      expect(pedal.controls.some((c) => c.cc === 22 || c.cc === 23)).toBe(false);
      expect(pedal.face.format === 'classic' && pedal.face.toggles).toEqual([]);
    }
  });

  it('LAG replaces VOLUME on CC15 of the HiFi', () => {
    expect(warpedvinylhifi.controls.find((c) => c.cc === 15)?.label).toBe('LAG');
    expect(warpedvinylmkii.controls.find((c) => c.cc === 15)?.label).toBe('VOLUME');
  });
});

describe('Thermae', () => {
  it('runaway is a momentary hold on CC24 with 127 / 0; slowdown mode is CC25 and never replayed', () => {
    const { engine, sink, advance } = setup(thermae);
    hold(engine, advance, 'tap');
    engine.set('h1', 127);
    expect(sink.take()).toEqual([cc(24, 127), cc(24, 0), cc(25, 127)]);
    engine.sendAll();
    expect(sink.take().some((m) => m.type === 'cc' && m.cc === 25)).toBe(false);
  });

  it('the MODULATION dip mirror relabels INT 1 / INT 2 and sends nothing', () => {
    const { engine, sink } = setup(thermae);
    const label = (id: string) => {
      const c = engine.control(id);
      return c?.kind === 'knob' ? c.labelFor?.(engine.getState().values) : undefined;
    };
    expect(label('k5')).toBeUndefined();
    engine.set('m1', 1);
    expect(sink.take()).toEqual([]);
    expect(label('k5')).toBe('SPEED');
    expect(label('k6')).toBe('DEPTH');
  });

  it('tap LED turns green in slowdown mode and while runaway is held', () => {
    const { engine, advance } = setup(thermae);
    expect(thermae.leds(engine.getState())[0]).toEqual({ color: 'red', blinkMs: 500 });
    engine.set('h1', 127);
    expect(thermae.leds(engine.getState())[0]).toEqual({ color: 'green' });
    engine.set('h1', 0);
    engine.pressStart('tap');
    advance(700);
    expect(thermae.leds(engine.getState())[0]).toEqual({ color: 'green' });
    engine.pressEnd('tap');
  });
});

describe('Dark World', () => {
  it('both channels travel in CC103: 127 both, 85 Dark, 45 World, 0 none', () => {
    const { engine, sink } = setup(darkworld);
    click(engine, 's2'); // World off
    expect(sink.take()).toEqual([cc(103, 85)]);
    click(engine, 's1'); // Dark off
    expect(sink.take()).toEqual([cc(103, 0)]);
    click(engine, 's2');
    expect(sink.take()).toEqual([cc(103, 45)]);
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(103, 127)]);
    expect(darkworld.controls.some((c) => c.cc === 102)).toBe(false);
  });

  it('DECAY and MODIFY explain themselves per Dark program; pre-delay reads in ms', () => {
    const { engine } = setup(darkworld);
    const detail = (id: string) => {
      const c = engine.control(id);
      return c?.kind === 'knob' ? c.detail?.(engine.getState().values) : undefined;
    };
    expect(detail('k1')).toBe('Reverb decay');
    engine.set('t1', 2);
    expect(detail('k4')).toBe('Octave mix: down · none · up');
    engine.set('t1', 3);
    expect(detail('k1')).toBe('Freeze threshold');
    const k6 = engine.control('k6');
    expect(k6?.kind === 'knob' && k6.readout?.(127, engine.getState().values)?.label).toBe('≈ 200 ms');
  });
});

describe('Tonal Recall', () => {
  it('clock divisions are the six manual values on CC21 and switch the clock on', () => {
    const { engine, sink } = setup(tonalrecall);
    expect(TR_DIVISIONS.map((d) => d.label)).toEqual(['Quarter', 'Dotted 8th', '8th triplet', 'Eighth', '8th sextolet', 'Sixteenth']);
    engine.set('s4', 0);
    sink.take();
    engine.set('s3', 4);
    expect(sink.take()).toEqual([cc(21, 4), cc(51, 127)]);
  });

  it('the RKM mirror changes the look and the TIME readout without sending anything', () => {
    const { engine, sink } = setup(tonalrecall);
    const k4 = engine.control('k4');
    const detail = () => (k4?.kind === 'knob' ? k4.detail?.(engine.getState().values) : undefined);
    expect(detail()).toBe('Up to 550 ms');
    expect(tonalrecall.themeFor?.(engine.getState().values)).toBeUndefined();
    engine.set('m1', 1);
    expect(sink.take()).toEqual([]);
    expect(detail()).toBe('Up to 1100 ms');
    expect(tonalrecall.themeFor?.(engine.getState().values)).toMatchObject({ knob: expect.any(String) });
  });

  it('has no CC for the toggles or the runaway hold', () => {
    expect(tonalrecall.controls.some((c) => c.cc === 22 || c.cc === 23)).toBe(false);
    expect(tonalrecall.face.footswitches[0].hold).toBeUndefined();
  });
});

describe('Bliss Factory', () => {
  it('AUX is the left footswitch on CC101, bypass the right on CC102', () => {
    const { engine, sink } = setup(blissfactory);
    click(engine, 's2');
    click(engine, 's2');
    click(engine, 's1');
    expect(sink.take()).toEqual([cc(101, 1), cc(101, 0), cc(102, 0)]);
    expect(blissfactory.leds(engine.getState())).toEqual([{ color: 'off' }, { color: 'off' }, { color: 'off' }]);
  });

  it('DRIVE warns while COMP is fully up; no tap, no clock', () => {
    const { engine } = setup(blissfactory);
    const k4 = engine.control('k4');
    const detail = () => (k4?.kind === 'knob' ? k4.detail?.(engine.getState().values) : undefined);
    expect(detail()).toBeUndefined();
    engine.set('k3', 127);
    expect(detail()).toBe('No effect while COMP is fully up');
    expect(blissfactory.tap).toBeUndefined();
    expect(blissfactory.controls.some((c) => c.cc === 51 || c.cc === 93)).toBe(false);
  });
});
