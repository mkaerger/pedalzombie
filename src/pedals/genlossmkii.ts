import { dip, fader, knob, rangeOf, toggle } from '../editor/core/controls';
import type { PedalDefinition, ValueRange } from '../editor/core/types';
import { LED_OFF, presetLed } from './shared';

// Reference: docs/midi/generation-loss-mkii.md

/** Tape machine models on MODEL (CC16). The manual lists the exact value of each model. */
const MODELS: ValueRange[] = [
  { from: 0, to: 0, label: 'Off / unfiltered', image: 'na.png' },
  { from: 1, to: 15, label: 'CPR-3300 Gen 1', image: 'vhs-gen1.png' },
  { from: 16, to: 24, label: 'CPR-3300 Gen 2', image: 'vhs-gen2.png' },
  { from: 25, to: 33, label: 'CPR-3300 Gen 3', image: 'vhs-gen3.png' },
  { from: 34, to: 43, label: 'Portamax-RT', image: 'portamax-rt.png' },
  { from: 44, to: 53, label: 'Portamax-HT', image: 'portamax-ht.png' },
  { from: 54, to: 62, label: 'CAM-8', image: 'cam8.png' },
  { from: 63, to: 72, label: 'DICTATRON-EX', image: 'dictatron-ex.png' },
  { from: 73, to: 82, label: 'DICTATRON-IN', image: 'dictatron-in.png' },
  { from: 83, to: 91, label: 'FISHY 60', image: 'fishy-60.png' },
  { from: 92, to: 101, label: 'MS-WALKER', image: 'ms-walker.png' },
  { from: 102, to: 111, label: 'AMU-2', image: 'amu-2.png' },
  { from: 112, to: 127, label: 'M-PEX', image: 'm-pex.png' },
];

const classic = (v: Record<string, number>) => v.d10 === 1;
const inClassic = (label: string) => (v: Record<string, number>) => (classic(v) ? label : undefined);

export const genlossmkii: PedalDefinition = {
  slug: 'generationloss-editor',
  name: 'Generation Loss MKII',
  manufacturer: 'Chase Bliss',
  tagline: 'Tape machine models, wow and flutter, the noise section, classic mode and all dip switches.',
  storageKey: 'genlossmkii',
  defaultChannel: 2,
  midiReference: 'docs/midi/generation-loss-mkii.md',
  released: '2022-10',
  theme: { body: '#a3b9c9', ink: '#243640', accent: '#2f6f9f', knob: '#f2f4f6', knobIndicator: '#4a6b7f' },
  themeFor: (v) => (classic(v) ? { body: '#c9c3b6', ink: '#2c2b28', accent: '#c0392b' } : undefined),

  controls: [
    knob('k1', 'WOW', 14, 1),
    knob('k2', 'VOLUME', 15, 58),
    knob('k3', 'MODEL', 16, 75, {
      labelFor: inClassic('LOW PASS'),
      readout: (value, v) => (classic(v) ? { from: 0, to: 127, label: 'Classic', image: 'classic.png' } : rangeOf(MODELS, value)),
    }),
    knob('k4', 'FLUTTER', 17, 58),
    knob('k5', 'SATURATE', 18, 58, { labelFor: inClassic('GEN') }),
    knob('k6', 'FAILURE', 19, 58, { labelFor: inClassic('HIGH PASS') }),

    knob('k7', 'AUX ONSET', 24, 25),
    knob('k9', 'HISS', 27, 10),
    knob('k10', 'MECHANICAL NOISE', 28, 10),
    knob('k11', 'CRINKLE & POP', 29, 10),
    fader('f1', 'RAMP SPEED', 20, 64),
    // CC26 is a threshold on the pedal: < 64 true bypass, > 64 DSP bypass
    dip('k8', 'BYPASS TYPE', 26, 127, { on: 127, offLabel: 'True bypass', onLabel: 'DSP bypass' }),
    toggle('g1', 'INPUT GAIN', 32, 1, ['Line', 'Instrument', 'High gain']),

    toggle('t1', 'AUX', 21, 1, ['1', '2', '3']),
    toggle('t2', 'DRY', 22, 2, ['1', '2', '3']),
    toggle('t3', 'NOISE', 23, 1, ['1', '2', '3']),

    dip('s1', 'BYPASS', 102, 1),
    dip('s2', 'AUX', 103, 0),

    dip('d1', 'WOW', 61),
    dip('d2', 'FLUTTER', 62),
    dip('d3', 'SAT / GEN', 63),
    dip('d4', 'FAILURE / HP', 64),
    dip('d5', 'MODEL / LP', 65),
    dip('d6', 'BOUNCE', 66),
    dip('d7', 'RANDOM', 67),
    dip('d8', 'SWEEP', 68, 0, { offLabel: 'B', onLabel: 'T' }),
    dip('d9', 'POLARITY', 71, 0, { offLabel: 'F', onLabel: 'R' }),
    dip('d10', 'CLASSIC', 72),
    dip('d11', 'MISO', 73, 1),
    dip('d12', 'SPREAD', 74),
    dip('d13', 'DRY TYPE', 75),
    dip('d14', 'DROP BYP', 76, 1),
    dip('d15', 'SNAG BYP', 77),
    dip('d16', 'HUM BYP', 78),
    dip('d17', 'RAMP / BOUNCE', 52, 1, { offLabel: 'Off', onLabel: 'On' }),
  ],

  face: {
    format: 'classic',
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    footswitches: [
      { id: 's2', label: 'Aux', press: { type: 'toggle', control: 's2' } },
      { id: 's1', label: 'Bypass', press: { type: 'toggle', control: 's1' } },
    ],
  },

  sections: [
    {
      id: 'alt',
      title: 'Alt controls',
      blocks: [
        { type: 'controls', controls: ['k7', 'k9', 'k10', 'k11'], columns: 4 },
        { type: 'controls', title: 'Hidden options', controls: ['g1', 'k8', 'f1'], columns: 3 },
      ],
    },
    {
      id: 'dips',
      title: 'Dip switches',
      blocks: [
        {
          type: 'dips',
          banks: [
            { title: 'Ramping', controls: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'] },
            { title: 'Customize', controls: ['d9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16'] },
          ],
        },
        { type: 'controls', controls: ['d17'], columns: 3 },
      ],
    },
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'alt', label: 'Alt controls', controls: ['k7', 'k9', 'k10', 'k11'] },
    { id: 'ramping', label: 'Ramping', controls: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'f1'] },
    {
      id: 'all',
      label: 'Everything',
      controls: [
        'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k9', 'k10', 'k11', 'f1',
        't1', 't2', 't3',
        'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16',
      ],
    },
  ],

  // Aux only works while the pedal is engaged; bypassing also switches aux off.
  onChange: (id, value, v) => {
    if (id === 's1' && value === 0 && v.s2 === 1) return { s2: 0 };
    if (id === 's2' && value === 1 && v.s1 === 0) return { s2: 0 };
    return undefined;
  },

  leds: ({ values, preset }) => [
    values.s2 === 1 ? { color: 'red' } : LED_OFF,
    presetLed(preset),
    values.s1 === 1 ? { color: 'red' } : LED_OFF,
  ],
};
