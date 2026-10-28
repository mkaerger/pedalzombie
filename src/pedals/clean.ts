import { dip, fader, knob, toggle } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { customizeDips, dipsSection, presetLed, rampingDips, RAMPING_IDS, switchLed } from './shared';

// Reference: docs/midi/clean.md

export const clean: PedalDefinition = {
  slug: 'clean-editor',
  name: 'Clean',
  manufacturer: 'Chase Bliss',
  tagline: 'The creative compressor: dynamics, dynamic EQ, swells, physics, noise gate and every hidden option.',
  storageKey: 'clean',
  defaultChannel: 2,
  midiReference: 'docs/midi/clean.md',
  released: '2024-04',
  theme: { body: '#f3ede3', ink: '#2b2b2b', accent: '#e8502a', knob: '#4fb34f', knobIndicator: '#ffffff' },

  controls: [
    knob('k1', 'DYNAMICS', 14, 40),
    knob('k2', 'SENSITIVITY', 15, 64, { hint: 'Dynamic threshold; also the ramp target.' }),
    knob('k3', 'WET', 16, 64),
    knob('k4', 'ATTACK', 17, 40),
    knob('k5', 'EQ', 18, 64, { hint: 'Left removes highs, right removes lows.' }),
    knob('k6', 'DRY', 19, 64),
    fader('f1', 'RAMP SPEED', 20, 64),

    toggle('t1', 'RELEASE', 21, 2, ['Fast', 'User', 'Slow']),
    toggle('t2', 'MODE', 22, 2, ['Shifty', 'Manual', 'Modulated'], { hint: 'Dynamic EQ: shifts, fixed, or modulates when you play.' }),
    toggle('t3', 'PHYSICS', 23, 2, ['Wobbly', 'Off', 'Twitchy']),

    knob('k7', 'GATE RELEASE', 24, 64),
    knob('k8', 'GATE THRESHOLD', 25, 30),
    knob('k9', 'SWELL IN', 26, 64),
    knob('k10', 'USER RELEASE', 27, 64, { hint: 'Custom value for the RELEASE toggle middle position (default 650 ms).' }),
    knob('k11', 'ENVELOPE BALANCE', 28, 64, { hint: 'Filters lows out of the control signal.' }),
    knob('k12', 'SWELL OUT', 29, 64),
    toggle('h1', 'ENVELOPE MODE', 31, 1, ['Analog', 'Hybrid', 'Adaptive']),
    {
      kind: 'toggle', id: 'h2', label: 'SHIFTY MODE', cc: 32, default: 1,
      options: [{ value: 1, label: 'ASR shifty' }, { value: 3, label: 'Env shifty' }],
    },
    toggle('h3', 'SPREAD ROUTING', 33, 2, ['EQ', 'Both', 'Vol / comp']),

    dip('s1', 'BYPASS', 102, 1),
    dip('s2', 'SWELL', 103, 0),

    ...rampingDips(['DYNAMICS', 'ATTACK', 'EQ', 'DRY', 'WET', 'BOUNCE']),
    ...customizeDips(['MISO', 'SPREAD', 'LATCH', 'SIDECHAIN', 'NOISE GATE', 'MOTION', 'SWELL AUX', 'DUSTY'], {
      LATCH: 'Hold functions latch instead of being momentary.',
      SIDECHAIN: 'Dynamics follow the 1/8" sidechain input.',
      MOTION: 'Modulates the amount of compression.',
      'SWELL AUX': 'AUX footswitch does manual swells.',
      DUSTY: 'The limiter becomes a crumbly overdrive.',
    }),
    dip('d17', 'RAMP / BOUNCE', 52, 1, { offLabel: 'Off', onLabel: 'On' }),
  ],

  face: {
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    footswitches: [
      { id: 's2', label: 'Aux', press: { type: 'toggle', control: 's2' } },
      {
        id: 's1',
        label: 'Bypass',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 106, on: 1, off: 0, label: 'Dynamics max' },
      },
    ],
  },

  sections: [
    {
      id: 'alt',
      title: 'Hidden options',
      blocks: [
        { type: 'controls', title: 'Noise gate & envelope', controls: ['k8', 'k7', 'k11', 'h1'], columns: 4 },
        { type: 'controls', title: 'Swell & release', controls: ['k9', 'k12', 'k10', 'h2'], columns: 4 },
        { type: 'controls', controls: ['h3', 'f1'], columns: 2 },
      ],
    },
    dipsSection(),
    { id: 'global', title: 'Global settings', blocks: [{ type: 'controls', controls: ['d17'], columns: 3 }] },
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },

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
        ...RAMPING_IDS, 'd9', 'd10', 'd13', 'd14', 'd16', // not LATCH, SIDECHAIN, SWELL AUX
      ],
    },
  ],

  commands: [{ id: 'factory-reset', label: 'Factory reset', cc: 56, value: 1, confirm: 'Reset the pedal to factory settings?' }],

  // Left LED is green in swell mode; right LED red while engaged, amber while dynamics are maxed.
  leds: ({ values, held, preset }) => [
    values.s2 === 1 ? { color: 'green' } : { color: 'off' },
    presetLed(preset),
    switchLed(values.s1 === 1, held.has('s1'), 'amber'),
  ],
};
