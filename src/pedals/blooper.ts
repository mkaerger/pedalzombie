import { dip, fader, knob, select, toggle, value } from '../editor/core/controls';
import type { LedState, MidiMessage, PedalDefinition } from '../editor/core/types';
import { LED_OFF, presetLed } from './shared';

// Reference: docs/midi/blooper.md
// Blooper is a looper: transport is one-shot CCs, loops are zero-based program changes, the modifier
// buttons on the bottom edge *toggle* the pedal (CC30/31 with any value), so the editor keeps its own
// on/off state for them and never replays it.

const NOTE_DIVISIONS = ['Whole', 'Half', 'Dotted', 'Quarter', 'Eighth', 'Triplet', 'Sixteenth', 'Thirty-second']
  .map((label, value) => ({ value, label }));

/** A button whose CC toggles the pedal: any click sends 127, the editor remembers the state. */
const modifierButton = (id: string, label: string, cc: number) => ({
  ...dip(id, label, cc, 0, { hint: 'Toggles the modifier. On the pedal: quick press = on/off, hold = momentary.' }),
  send: (): MidiMessage[] => [{ type: 'cc', cc, value: 127 }],
  sync: false as const,
});

/** Transport state the editor tracks for the LEDs: recording, playing (no CC). */
const STOPPED = { rec: 0, play: 0 };

export const blooper: PedalDefinition = {
  slug: 'blooper-editor',
  name: 'Blooper',
  manufacturer: 'Chase Bliss',
  tagline: 'Bottomless looper: transport, layers, modifiers with their buttons, stability, ramping and 16 loop slots.',
  storageKey: 'blooper',
  defaultChannel: 2,
  midiReference: 'docs/midi/blooper.md',
  released: '2019-10',
  theme: { body: '#a9cbe3', ink: '#1d3d5c', accent: '#2a6fa8', knob: '#f4f6f8', knobIndicator: '#1d3d5c' },

  controls: [
    knob('k1', 'VOLUME', 14, 64, { hint: 'Unity at noon. Ramp speed while ramping is on.' }),
    knob('k2', 'LAYERS', 15, 127, { hint: 'Counter-clockwise removes layers (undo), clockwise adds them back.' }),
    knob('k3', 'REPEATS', 16, 127, { hint: 'Max = infinite; lower lets layers fade while overdubbing.' }),
    knob('k4', 'MOD A', 17, 64, { hint: 'Noon = neutral.' }),
    knob('k5', 'STABILITY', 18, 0, { hint: 'Min = bypassed; wow, flutter, noise and filtering.' }),
    knob('k6', 'MOD B', 19, 64, { hint: 'Noon = neutral.' }),
    fader('f1', 'RAMP', 20, 64),

    toggle('t1', 'MOD A', 21, 1, ['1', '2', '3'], { hint: 'Stock: 1 Chromatic speed · 2 Pitcher · 3 Stutter' }),
    toggle('t2', 'MODE', 22, 1, ['Normal', 'Additive', 'Sampler']),
    toggle('t3', 'MOD B', 23, 1, ['4', '5', '6'], { hint: 'Stock: 4 Filter · 5 Stopper · 6 Swapper' }),
    toggle('t4', 'SAVE', 24, 2, ['Preview', 'Loop', 'Save / Load'], { hint: 'Preview scrolls through loops; Save / Load: hold left to save, right to load.' }),

    // transport: RECORD is a state (CC1 on/off), the rest are one-shot commands below
    { ...dip('rec', 'RECORD', 1, 0, { on: 127 }), sync: false },
    { ...value('play', 'Playing', 0, { min: 0, max: 1 }), sync: false },

    modifierButton('b1', 'MOD A', 30),
    modifierButton('b2', 'MOD B', 31),

    dip('d17', 'MIDI CLOCK', 51, 0, { offLabel: 'Ignore', onLabel: 'Listen' }),
    dip('d18', 'RAMPING', 52, 0, { offLabel: 'Off', onLabel: 'On', hint: 'VOLUME becomes the ramp speed.' }),
    select('c1', 'Note division', 54, 3, NOTE_DIVISIONS),
  ],

  face: {
    format: 'classic',
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    centerToggle: 't4',
    footswitches: [
      {
        id: 'rec',
        label: 'Record / Play',
        press: { type: 'toggle', control: 'rec' },
        hold: { type: 'command', id: 'oneshot', label: 'One-shot overdub' },
      },
      {
        id: 'stop',
        label: 'Stop',
        press: { type: 'command', id: 'stop' },
        hold: { type: 'command', id: 'hold-b', label: 'Undo / redo menu' },
      },
    ],
    buttons: ['b1', 'b2'],
  },

  sections: [
    {
      id: 'transport',
      title: 'Transport',
      blocks: [
        { type: 'commands', commands: ['play', 'overdub', 'stop', 'undo', 'redo', 'oneshot', 'hold-b', 'erase'] },
      ],
    },
    {
      id: 'ramping',
      title: 'Ramping & clock',
      blocks: [
        { type: 'controls', controls: ['f1', 'd18', 'd17'], columns: 3 },
        { type: 'select', control: 'c1' },
      ],
    },
  ],

  presets: {
    toggle: false,
    recall: { first: 1, last: 16, program: (loop) => loop - 1, label: 'Loop' },
    manualStoreHint: 'Blooper saves a loop when it receives a program change while the right footswitch is held: hold it on the pedal and press Recall.',
  },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'modifiers', label: 'Modifiers', controls: ['k4', 'k6', 't1', 't3'] },
    { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 't1', 't2', 't3', 'f1'] },
  ],

  commands: [
    { id: 'play', label: 'Play', cc: 2, value: 127, then: { rec: 0, play: 1 } },
    { id: 'overdub', label: 'Overdub', cc: 3, value: 127, then: { rec: 127, play: 1 } },
    { id: 'stop', label: 'Stop', cc: 4, value: 127, then: STOPPED },
    { id: 'undo', label: 'Undo', cc: 5, value: 127 },
    { id: 'redo', label: 'Redo', cc: 6, value: 127 },
    { id: 'oneshot', label: 'One-shot overdub', cc: 9, value: 127, then: { play: 1 } },
    { id: 'hold-b', label: 'Hold switch B', cc: 8, value: 127 },
    { id: 'erase', label: 'Erase loop', cc: 7, value: 127, confirm: 'Erase the loop on the pedal?', then: STOPPED },
  ],

  // Recording turns the left LED red; it stays green while the loop plays.
  onChange: (id, v) => (id === 'rec' && v === 127 ? { play: 1 } : undefined),

  leds: ({ values, held, preset }) => [
    values.rec === 127 ? { color: 'red' } : values.play === 1 ? { color: 'green' } : LED_OFF,
    presetLed(preset),
    held.has('stop') ? { color: 'amber' } : LED_OFF,
  ],

  buttonLeds: ({ values }) => {
    const led = (on: boolean): LedState => (on ? { color: 'blue' } : LED_OFF);
    return [led(values.b1 === 1), led(values.b2 === 1)];
  },
};
