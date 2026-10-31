import { dip, fader, knob, rangeOf, select, toggle } from '../editor/core/controls';
import type { LedState, Option, PedalDefinition, ValueRange } from '../editor/core/types';
import { customizeDips, dipsSection, LED_OFF, presetLed, RAMP_WAVEFORMS, rampingDips, STEPPED_CLOCK } from './shared';

// Reference: docs/midi/mood-mkii.md

const TAPE_SPEED: ValueRange[] = [
  { from: 0, to: 4, label: '4x Reverse' },
  { from: 5, to: 23, label: '2x Reverse' },
  { from: 24, to: 42, label: '1x Reverse' },
  { from: 43, to: 61, label: '0.5x Reverse' },
  { from: 62, to: 84, label: '0.5x Forward' },
  { from: 85, to: 97, label: '1x Forward' },
  { from: 98, to: 119, label: '2x Forward' },
  { from: 120, to: 127, label: '4x Forward' },
];

const STRETCH_SPEED: ValueRange[] = [
  { from: 0, to: 15, label: 'No Stretch Rev' },
  { from: 16, to: 30, label: '1.5x Reverse' },
  { from: 31, to: 46, label: '2x Reverse' },
  { from: 47, to: 60, label: '4x Reverse' },
  { from: 61, to: 80, label: 'Stalled' },
  { from: 81, to: 96, label: '4x Forward' },
  { from: 97, to: 111, label: '2x Forward' },
  { from: 112, to: 126, label: '1.5x Forward' },
  { from: 127, to: 127, label: 'No Stretch Fwd' },
];

const DIVISIONS: Option[] = [
  '1/32 note',
  '1/16 note',
  '1/8 note triplet',
  '1/8 note',
  'Dotted 1/8 note',
  '1/4 note',
  '1/2 note',
  'Whole note',
].map((label, value) => ({ value, label }));

/** Wet channel (t1): 1 reverb, 2 delay, 3 slip. Micro-looper (t3): 1 env, 2 tape, 3 stretch. */
const byWet = (labels: [string, string, string]) => (v: Record<string, number>) => labels[v.t1 - 1];
const byLoop = (labels: [string, string, string]) => (v: Record<string, number>) => labels[v.t3 - 1];



export const moodmkii: PedalDefinition = {
  slug: 'moodmkii-editor',
  name: 'MOOD MKII',
  manufacturer: 'Chase Bliss',
  tagline: 'Wet channel and micro-looper, ramping, clock divisions and every hidden option.',
  storageKey: 'moodmkii',
  defaultChannel: 2,
  midiReference: 'docs/midi/mood-mkii.md',
  released: '2023-02',
  theme: { body: '#a3749e', ink: '#fdf0f3', accent: '#f6a8b9', knob: '#e9dde7', knobIndicator: '#4e2351' },
  themeFor: (v) => (v.d9 === 1 ? { body: '#d9d4c7', ink: '#3b3a36', accent: '#8a6a3b' } : undefined),

  controls: [
    knob('k1', 'TIME', 14, 30, { detail: byWet(['Decay & size', 'Delay time', 'Refresh rate']) }),
    knob('k2', 'MIX', 15, 58),
    knob('k3', 'LENGTH', 16, 75, { detail: byLoop(['Slice size', 'Loop length', 'Slice size']) }),
    knob('k4', 'MODIFY', 17, 58, { detail: byWet(['Smear', 'Feedback', 'Speed & direction']) }),
    knob('k5', 'CLOCK', 18, 70, { readout: (value) => rangeOf(STEPPED_CLOCK, value) }),
    knob('k6', 'MODIFY', 19, 58, {
      detail: byLoop(['Sensitivity', 'Speed & direction', 'Amount & direction']),
      readout: (value, v) => (v.t3 === 2 ? rangeOf(TAPE_SPEED, value) : v.t3 === 3 ? rangeOf(STRETCH_SPEED, value) : undefined),
    }),

    knob('k7', 'STEREO WIDTH', 24, 110, { hint: 'Wet channel' }),
    knob('k8', 'RAMPING WAVEFORM', 25, 70, { readout: (value) => rangeOf(RAMP_WAVEFORMS, value) }),
    knob('k9', 'FADE', 26, 58, { hint: 'Micro-looper' }),
    knob('k10', 'TONE', 27, 58, { hint: 'Wet channel' }),
    knob('k11', 'LEVEL BALANCE', 28, 58),
    knob('k12', 'DIRECT MICRO-LOOP', 29, 58),
    fader('f1', 'RAMP SPEED', 20, 21),

    toggle('t1', 'WET CHANNEL', 21, 1, ['Reverb', 'Delay', 'Slip']),
    toggle('t2', 'ROUTING', 22, 2, ['In', 'Loop + In', 'Loop']),
    toggle('t3', 'MICRO-LOOPER', 23, 2, ['Env', 'Tape', 'Stretch']),

    toggle('h1', 'SYNC', 31, 2, ['Loop → Wet', 'No sync', 'Wet → Loop'], {
      hint: 'Left: looper synced to the wet channel. Middle: unsynced. Right: wet channel synced to the looper.',
    }),
    toggle('h2', 'SPREAD', 32, 2, ['Wet only', 'Both', 'Loop only'], {
      hint: 'Which channel the spread dip switch acts on.',
    }),
    { kind: 'toggle', id: 'h3', label: 'BUFFER LENGTH', cc: 33, default: 2, options: [
      { value: 1, label: 'Half (MKI)' },
      { value: 2, label: 'Full' },
    ] },

    // Footswitch states (latching)
    dip('s1', 'LOOP', 102, 0),
    dip('s2', 'WET', 103, 1),

    ...rampingDips(['TIME', 'MODIFY (wet)', 'CLOCK', 'MODIFY (loop)', 'LENGTH', 'BOUNCE']),
    ...customizeDips(['CLASSIC', 'MISO', 'SPREAD', 'DRY KILL', 'TRAILS', 'LATCH', 'NO DUB', 'SMOOTH'], {
      CLASSIC: 'MKI behaviour and look.',
      LATCH: 'Hold functions latch instead of being momentary.',
    }),

    dip('d17', 'MIDI CLOCK', 51, 0, { offLabel: 'Ignore', onLabel: 'Follow', hint: 'Saved globally on the pedal.' }),
    dip('d18', 'RAMPING', 52, 1, { offLabel: 'Stop', onLabel: 'Run' }),
    dip('d19', 'TRUE BYPASS', 55, 0, { offLabel: 'Buffered', onLabel: 'True' }),

    select('c1', 'Wet clock division', 53, 1, DIVISIONS, { hint: 'Saved globally on the pedal.' }),
    select('c2', 'Loop clock division', 54, 3, DIVISIONS, { hint: 'Saved globally on the pedal.' }),
  ],

  face: {
    format: 'classic',
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    footswitches: [
      {
        id: 's2',
        label: 'Wet',
        press: { type: 'toggle', control: 's2' },
        hold: { type: 'momentary', cc: 105, on: 1, off: 0, label: 'Freeze', enabled: (v) => v.s2 === 1 },
      },
      {
        id: 's1',
        label: 'Loop',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 106, on: 1, off: 0, label: 'Overdub' },
      },
    ],
  },

  sections: [
    {
      id: 'alt',
      title: 'Alt controls',
      blocks: [
        { type: 'controls', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12'], columns: 3 },
        { type: 'controls', title: 'Hidden options', controls: ['h1', 'h2', 'h3', 'f1'], columns: 4 },
      ],
    },
    dipsSection(),
    {
      id: 'clock',
      title: 'Clock & global settings',
      blocks: [
        { type: 'select', control: 'c1' },
        { type: 'select', control: 'c2' },
        { type: 'controls', controls: ['d17', 'd18', 'd19'], columns: 3 },
      ],
    },
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },
  tap: { cc: 107, value: 127 },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'alt', label: 'Alt controls', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'h1', 'h2', 'h3'] },
    { id: 'ramping', label: 'Ramping', controls: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'f1'] },
    {
      id: 'all',
      label: 'Everything',
      controls: [
        'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'f1',
        't1', 't2', 't3', 'h1', 'h2', 'h3',
        'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16',
      ],
    },
  ],

  commands: [
    { id: 'factory-reset', label: 'Factory reset', cc: 56, value: 1, confirm: 'Reset the pedal to factory settings?' },
    {
      id: 'midi-reset',
      label: 'MIDI reset',
      cc: 110,
      value: 1,
      confirm: 'Reset MIDI settings (clock ignore off, clock dividers ¼, synth settings)?',
    },
  ],

  leds: ({ values, held, preset }) => {
    const left: LedState = held.has('s2') ? { color: 'green' } : values.s2 === 1 ? { color: 'red' } : LED_OFF;
    const right: LedState = held.has('s1') ? { color: 'red' } : values.s1 === 1 ? { color: 'green' } : LED_OFF;
    return [left, presetLed(preset), right];
  },
};

