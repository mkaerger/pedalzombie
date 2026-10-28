import { dip, fader, knob, rangeOf, select, toggle } from '../editor/core/controls';
import type { PedalDefinition, ValueRange } from '../editor/core/types';
import { beatMs, customizeDips, dipsSection, LED_OFF, presetLed, rampingDips, RAMPING_IDS, switchLed } from './shared';

// Reference: docs/midi/onward.md

/** Knobs that are "off" at noon and do two different things on each side. */
const sides = (left: string, right: string): ValueRange[] => [
  { from: 0, to: 60, label: left },
  { from: 61, to: 67, label: 'Off' },
  { from: 68, to: 127, label: right },
];
const OCTAVE = sides('Lower octave', 'Upper octave');
const TEXTURE = sides('Sample rate reduction', 'Soft clipping');

const SUBDIVISIONS = ['Whole', 'Dotted half', 'Half', 'Dotted quarter', 'Quarter', 'Dotted 8th', '8th', '8th triplet', 'Sixteenth']
  .map((label, value) => ({ value, label }));

const ROUTING = ['Glitch', 'Both', 'Freeze'];

export const onward: PedalDefinition = {
  slug: 'onward-editor',
  name: 'Onward',
  manufacturer: 'Chase Bliss',
  tagline: 'Dynamic sampler: glitch and freeze channels, errors, sustain, octave, texture, routing and clock sync.',
  storageKey: 'onward',
  defaultChannel: 2,
  midiReference: 'docs/midi/onward.md',
  released: '2024-10',
  theme: { body: '#b5aa9d', ink: '#2b2420', accent: '#5e5048', knob: '#5e5048', knobIndicator: '#f5f1ea' },

  controls: [
    knob('k1', 'SIZE', 14, 64),
    knob('k2', 'MIX', 15, 64),
    knob('k3', 'OCTAVE', 16, 64, { readout: (v) => rangeOf(OCTAVE, v) }),
    knob('k4', 'ERROR', 17, 30),
    knob('k5', 'SUSTAIN', 18, 80),
    knob('k6', 'TEXTURE', 19, 64, { readout: (v) => rangeOf(TEXTURE, v) }),
    fader('f1', 'RAMP SPEED', 20, 64),

    toggle('t1', 'ERROR TYPE', 21, 1, ['Timing', 'Condition', 'Playback']),
    toggle('t2', 'FADE', 22, 1, ['Slow', 'User', 'Fast'], { hint: 'Manual: LONG = left, SHORT = right.' }),
    toggle('t3', 'ANIMATE', 23, 2, ['Vibrato', 'Off', 'Chorus']),

    knob('k7', 'SENSITIVITY', 24, 64),
    knob('k8', 'BALANCE', 25, 64, { hint: 'Loudness of glitch vs. freeze.' }),
    knob('k9', 'DUCK DEPTH', 26, 64),
    knob('k10', 'ERROR BLEND', 27, 0, { hint: 'Blends in the two unselected error types.' }),
    knob('k11', 'USER FADE', 28, 64),
    knob('k12', 'FILTER', 29, 64, { hint: 'Two-sided EQ: thin out or darken.' }),
    toggle('h1', 'ERROR ROUTING', 31, 2, ROUTING),
    toggle('h2', 'SUSTAIN ROUTING', 32, 2, ROUTING),
    toggle('h3', 'EFFECTS ROUTING', 33, 2, ROUTING),
    select('c1', 'MIDI sync subdivision', 53, 4, SUBDIVISIONS),

    dip('s1', 'FREEZE', 102, 0),
    dip('s2', 'GLITCH', 103, 0),

    ...rampingDips(['SIZE', 'ERROR', 'SUSTAIN', 'TEXTURE', 'OCTAVE', 'BOUNCE']),
    ...customizeDips(['MISO', 'SPREAD', 'LATCH', 'SIDECHAIN', 'DUCK', 'REVERSE', '1/2 SPEED', 'MANUAL'], {
      LATCH: 'Hold functions latch instead of being momentary.',
      SIDECHAIN: 'The freeze dips whenever the glitch resets.',
      REVERSE: 'The glitch side plays in reverse.',
      '1/2 SPEED': 'Half recording quality, double SIZE for the glitch.',
      MANUAL: 'Resample only when a footswitch is tapped.',
    }),

    dip('d17', 'MIDI CLOCK', 51, 0, { offLabel: 'Ignore', onLabel: 'Follow' }),
    dip('d18', 'RAMP / BOUNCE', 52, 1, { offLabel: 'Off', onLabel: 'On' }),
    dip('d19', 'DRY KILL', 57, 0, { offLabel: 'Off', onLabel: 'On' }),
    dip('d20', 'TRAILS', 58, 0, { offLabel: 'Off', onLabel: 'On' }),
  ],

  face: {
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    footswitches: [
      {
        id: 's2',
        label: 'Glitch',
        press: { type: 'toggle', control: 's2' },
        hold: { type: 'momentary', cc: 105, on: 1, off: 0, label: 'Lock sample' },
      },
      {
        id: 's1',
        label: 'Freeze',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 106, on: 1, off: 0, label: 'Lock sample' },
      },
    ],
  },

  sections: [
    {
      id: 'alt',
      title: 'Hidden options',
      blocks: [
        { type: 'controls', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12'], columns: 3 },
        { type: 'controls', title: 'Routing', controls: ['h1', 'h2', 'h3'], columns: 3 },
        { type: 'controls', controls: ['f1'], columns: 2 },
      ],
    },
    dipsSection(),
    {
      id: 'global',
      title: 'Global settings',
      blocks: [
        { type: 'controls', controls: ['d17', 'd18', 'd19', 'd20'], columns: 4 },
        { type: 'select', control: 'c1' },
      ],
    },
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },
  tap: { cc: 93, value: 127 },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'alt', label: 'Hidden options', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'h1', 'h2', 'h3'] },
    { id: 'ramping', label: 'Ramping', controls: [...RAMPING_IDS, 'f1'] },
    {
      id: 'all',
      label: 'Everything',
      controls: [
        'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'f1',
        't1', 't2', 't3', 'h1', 'h2', 'h3',
        ...RAMPING_IDS, 'd9', 'd10', 'd12', 'd13', 'd14', 'd15', // not LATCH, MANUAL
      ],
    },
  ],

  commands: [
    { id: 'retrigger-glitch', label: 'Retrigger glitch', cc: 108, value: 127 },
    { id: 'retrigger-freeze', label: 'Retrigger freeze', cc: 109, value: 127 },
    { id: 'factory-reset', label: 'Factory reset', cc: 56, value: 1, confirm: 'Reset the pedal to factory settings?' },
  ],

  leds: ({ values, held, preset, tapBpm }) => [
    switchLed(values.s2 === 1, held.has('s2')),
    tapBpm ? { color: 'red', blinkMs: beatMs(tapBpm) } : presetLed(preset),
    values.s1 === 1 || held.has('s1') ? switchLed(true, held.has('s1')) : LED_OFF,
  ],
};
