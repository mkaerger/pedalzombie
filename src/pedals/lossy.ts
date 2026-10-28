import { dip, fader, knob, toggle } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { customizeDips, dipsSection, presetLed, rampingDips, RAMPING_IDS, switchLed } from './shared';

// Reference: docs/midi/lossy.md

export const lossy: PedalDefinition = {
  slug: 'lossy-editor',
  name: 'Lossy',
  manufacturer: 'Chase Bliss × Goodhertz',
  tagline: 'Artifacts on demand: loss and packet modes, filter, reverb, freeze, gate and every hidden option.',
  storageKey: 'lossy',
  defaultChannel: 2,
  midiReference: 'docs/midi/lossy.md',
  released: '2023-11',
  theme: { body: '#f2a0b4', ink: '#8e1250', accent: '#d6267a', knob: '#faf4f6', knobIndicator: '#8e1250' },

  controls: [
    knob('k1', 'FILTER', 14, 0, { hint: 'Minimum = no filtering.' }),
    knob('k2', 'GLOBAL', 15, 64, { hint: 'Overall intensity; also the ramp target.' }),
    knob('k3', 'VERB', 16, 0),
    knob('k4', 'FREQ', 17, 64),
    knob('k5', 'SPEED', 18, 64),
    knob('k6', 'LOSS', 19, 64),
    fader('f1', 'RAMP SPEED', 20, 64),

    toggle('t1', 'SLOPE', 21, 2, ['6 dB', '24 dB', '96 dB']),
    toggle('t2', 'PACKETS', 22, 2, ['Repeat', 'Clean', 'Loss']),
    toggle('t3', 'MODE', 23, 2, ['Inverse', 'Standard', 'Jitter']),

    knob('k7', 'GATE', 24, 30, { hint: 'Cutoff for the gate (hold BYPASS).' }),
    knob('k8', 'FREEZER', 25, 127, { hint: 'Balance between live and frozen signal.' }),
    knob('k9', 'DECAY', 26, 64),
    knob('k10', 'THRESHOLD', 27, 127, { hint: 'Built-in limiter; lower = more limiting.' }),
    knob('k11', 'AUTO GAIN', 28, 0),
    knob('k12', 'LOSS GAIN', 29, 64, { hint: '±36 dB on the wet signal.' }),
    toggle('h1', 'WEIGHTING', 33, 2, ['Dark', 'Neutral', 'Bright']),

    dip('s1', 'BYPASS', 102, 1),
    dip('s2', 'FREEZE', 103, 0, { hint: 'Slushie freeze; hold the footswitch for a solid freeze.' }),

    ...rampingDips(['FILTER', 'FREQ', 'SPEED', 'LOSS', 'VERB', 'BOUNCE']),
    ...customizeDips(['MISO', 'SPREAD', 'TRAILS', 'LATCH', 'PRE/POST', 'SLOW', 'INVERT', 'ALL WET'], {
      LATCH: 'Hold functions latch instead of being momentary.',
      'PRE/POST': 'Reverb before or after the loss section.',
      SLOW: 'The classic Lossy plugin sound: bigger, darker, more latency.',
      INVERT: 'Band-reject instead of band-pass filter.',
      'ALL WET': 'Analog dry-through; VERB becomes the mix control.',
    }),

    dip('d17', 'RAMP / BOUNCE', 52, 1, { offLabel: 'Off', onLabel: 'On' }),
    dip('d18', 'DRY KILL', 57, 0, { offLabel: 'Off', onLabel: 'On' }),
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
        label: 'Freeze',
        press: { type: 'toggle', control: 's2' },
        hold: { type: 'momentary', cc: 105, on: 1, off: 0, label: 'Solid freeze' },
      },
      {
        id: 's1',
        label: 'Bypass',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 106, on: 1, off: 0, label: 'Gate' },
      },
    ],
  },

  sections: [
    {
      id: 'alt',
      title: 'Hidden options',
      blocks: [
        { type: 'controls', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12'], columns: 3 },
        { type: 'controls', controls: ['h1', 'f1'], columns: 2 },
      ],
    },
    dipsSection(),
    { id: 'global', title: 'Global settings', blocks: [{ type: 'controls', controls: ['d17', 'd18'], columns: 3 }] },
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'alt', label: 'Hidden options', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'h1'] },
    { id: 'ramping', label: 'Ramping', controls: [...RAMPING_IDS, 'f1'] },
    {
      id: 'all',
      label: 'Everything',
      controls: [
        'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'f1',
        't1', 't2', 't3', 'h1',
        ...RAMPING_IDS, 'd9', 'd10', 'd13', 'd14', 'd15', 'd16', // not TRAILS, LATCH
      ],
    },
  ],

  commands: [{ id: 'factory-reset', label: 'Factory reset', cc: 56, value: 1, confirm: 'Reset the pedal to factory settings?' }],

  leds: ({ values, held, preset }) => [
    switchLed(values.s2 === 1, held.has('s2')),
    presetLed(preset),
    switchLed(values.s1 === 1, held.has('s1'), 'amber'),
  ],
};
