import { dip, fader, knob, select, toggle } from '../editor/core/controls';
import type { ControlValues, PedalDefinition } from '../editor/core/types';
import { beatMs, customizeDips, dipsSection, presetLed, rampingDips, RAMPING_IDS, switchLed } from './shared';

// Reference: docs/midi/lost-found.md

/** What TIME, MODIFY and ALT do in one of the twelve modes. */
interface Mode {
  name: string;
  time: string;
  modify: string;
  alt: string;
}
const mode = (name: string, time: string, modify: string, alt: string): Mode => ({ name, time, modify, alt });

/** Toggle position 1–3 → [A, B]; A is MODIFY below noon, B above noon. */
const LEFT_MODES: [Mode, Mode][] = [
  [mode('Slow-verb', 'Size', 'Decay', 'Diffusion'), mode('Useful Ambience', 'Size', 'Decay', 'Diffusion')],
  [mode('Orchestral Swell', 'Swell time', 'Pitch', 'Feedback'), mode('Pitch Repeater', 'Delay', 'Pitch', 'Number of repeats')],
  [mode('Pinging Phaser', 'Rate', 'Poles', 'Resonance'), mode('Spectral Modulator', 'Rate', 'Depth', 'Resonance')],
];
const RIGHT_MODES: [Mode, Mode][] = [
  [mode('Tape Echo', 'Delay time', 'Feedback', 'Stability'), mode('Grain Tumbler', 'Grain size', 'Feedback', 'Grain shape')],
  [mode('Impulse Synthesizer', 'Portamento', 'Texture', 'Attack / release'), mode('Sympathic Resonator', 'Onset', 'Feedback', 'Octave')],
  [mode('Ensemble Expander', 'Rate', 'Depth', 'Number of voices'), mode('Gen Lite', 'Rate', 'Depth', 'Drops and snags')],
];

type Side = 'L' | 'R';

/** The active mode of a channel: effect toggle, MODIFY side, and the SWAP dips (d12 = L SWAP, d13 = R SWAP). */
export function modeFor(side: Side, v: ControlValues): Mode | undefined {
  const swapped = side === 'L' ? v.d12 === 1 : v.d13 === 1;
  const bank = (side === 'L') !== swapped ? LEFT_MODES : RIGHT_MODES;
  const position = side === 'L' ? v.t1 : v.t3;
  const modify = side === 'L' ? v.k4 : v.k6;
  if (modify === 64) return undefined; // noon: no effect, GLUE only
  return bank[position - 1]?.[modify < 64 ? 0 : 1];
}

const detail = (side: Side, part: 'time' | 'alt') => (v: ControlValues) => {
  const m = modeFor(side, v);
  return m && `${m.name} · ${m[part]}`;
};
const modifyReadout = (side: Side) => (value: number, v: ControlValues) => {
  const m = modeFor(side, v);
  return m ? { from: 0, to: 127, label: `${value < 64 ? 'A' : 'B'} · ${m.name} · ${m.modify}` } : { from: 64, to: 64, label: 'Noon · no effect' };
};

const SUBDIVISIONS = [
  'Thirty-second', 'Sixteenth', 'Triplet sixteenth', 'Eighth', 'Triplet eighth', 'Dotted eighth', 'Quarter',
  'Triplet quarter', 'Dotted quarter', 'Half', 'Dotted half', 'Whole', 'Double whole',
].map((label, value) => ({ value, label }));

export const lostfound: PedalDefinition = {
  slug: 'lostfound-editor',
  name: 'Lost + Found',
  manufacturer: 'Chase Bliss',
  tagline: 'Twelve-mode multi-effect: reverb, pitch, warp, delay, synth and bend on two channels with routing and glue.',
  storageKey: 'lostfound',
  defaultChannel: 2,
  midiReference: 'docs/midi/lost-found.md',
  released: '2025-10',
  theme: { body: '#7c9f7f', ink: '#102a1c', accent: '#d7ec6b', knob: '#1e2a22', knobIndicator: '#d7ec6b' },

  controls: [
    knob('k1', 'TIME', 14, 64, { detail: detail('L', 'time') }),
    knob('k2', 'MIX', 15, 64, { hint: 'Both channels; also the ramp target.' }),
    knob('k3', 'TIME', 16, 64, { detail: detail('R', 'time') }),
    knob('k4', 'MODIFY', 17, 32, { readout: modifyReadout('L'), hint: 'A below noon, B above noon, noon = no effect.' }),
    knob('k5', 'BLEND', 18, 64, { hint: 'Parallel: which channel is louder. Series: mix of the second effect.' }),
    knob('k6', 'MODIFY', 19, 32, { readout: modifyReadout('R'), hint: 'A below noon, B above noon, noon = no effect.' }),

    toggle('t1', 'L EFFECT', 21, 1, ['1 Reverb', '2 Pitch', '3 Warp']),
    toggle('t2', 'ROUTING', 22, 2, ['L > R', 'L + R', 'L < R'], { hint: 'Series left into right, parallel, series right into left.' }),
    toggle('t3', 'R EFFECT', 23, 1, ['4 Delay', '5 Synth', '6 Bend']),

    fader('f1', 'RAMP SPEED', 20, 64),
    knob('k7', 'L ALT', 24, 64, { detail: detail('L', 'alt') }),
    knob('k8', 'SPILL', 25, 0, { hint: 'In series: apply the second effect to the dry signal too.' }),
    knob('k9', 'R ALT', 26, 64, { detail: detail('R', 'alt') }),
    knob('k10', 'L EQ', 27, 64, { hint: 'Clockwise thins, counter-clockwise darkens.' }),
    knob('k11', 'GLUE', 28, 0, { hint: 'Compression first, then overload.' }),
    knob('k12', 'R EQ', 29, 64, { hint: 'Clockwise thins, counter-clockwise darkens.' }),
    knob('k13', 'MASTER WET VOLUME', 30, 64),
    toggle('h1', 'SPREAD ROUTING', 32, 2, ['L only', 'Both', 'R only']),
    select('c1', 'L tap subdivision', 53, 6, SUBDIVISIONS),
    select('c2', 'R tap subdivision', 54, 6, SUBDIVISIONS),

    dip('s1', 'R CHANNEL', 102, 1),
    dip('s2', 'L CHANNEL', 103, 1),

    ...rampingDips(['L TIME', 'L MODIFY', 'BLEND', 'R MODIFY', 'R TIME', 'BOUNCE']),
    ...customizeDips(['MISO', 'SPREAD', 'LATCH', 'L SWAP', 'R SWAP', 'UNSYNC', 'TRAILS', 'BANK'], {
      LATCH: 'Hold functions latch instead of being momentary.',
      'L SWAP': 'Left channel gets the right channel effects (4–6).',
      'R SWAP': 'Right channel gets the left channel effects (1–3).',
      UNSYNC: 'Free, unsynced TIME on both channels.',
      BANK: 'Presets 3 and 4 on the preset toggle.',
    }),

    dip('d17', 'MIDI CLOCK', 51, 0, { offLabel: 'Ignore', onLabel: 'Follow' }),
    dip('d18', 'RAMPING', 52, 1, { offLabel: 'Stopped', onLabel: 'Running', hint: 'Manual: STOP RAMPING, on = 0, off = 1 or >.' }),
    dip('d19', 'DRY KILL', 57, 0, { offLabel: 'Off', onLabel: 'On' }),
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
        label: 'L',
        press: { type: 'toggle', control: 's2' },
        hold: { type: 'momentary', cc: 105, on: 1, off: 0, label: 'Secondary' },
      },
      {
        id: 's1',
        label: 'R',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 106, on: 1, off: 0, label: 'Secondary' },
      },
    ],
  },

  sections: [
    {
      id: 'alt',
      title: 'Hidden options',
      blocks: [
        { type: 'controls', controls: ['k7', 'k8', 'k9'], columns: 3 },
        { type: 'controls', controls: ['k10', 'k11', 'k12'], columns: 3 },
        { type: 'controls', controls: ['k13', 'h1', 'f1'], columns: 3 },
      ],
    },
    dipsSection(),
    {
      id: 'global',
      title: 'Global settings & tap tempo',
      blocks: [
        { type: 'controls', controls: ['d17', 'd18', 'd19'], columns: 3 },
        { type: 'select', control: 'c1' },
        { type: 'select', control: 'c2' },
      ],
    },
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },
  tap: { cc: 93, value: 127 },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'alt', label: 'Hidden options', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'k13', 'h1'] },
    { id: 'ramping', label: 'Ramping', controls: [...RAMPING_IDS, 'f1'] },
    {
      id: 'all',
      label: 'Everything',
      controls: [
        'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'k13', 'f1',
        't1', 't2', 't3', 'h1',
        ...RAMPING_IDS, 'd9', 'd10', 'd12', 'd13', 'd14', // not LATCH, TRAILS, BANK
      ],
    },
  ],

  commands: [
    { id: 'random-l', label: 'Random L mode', cc: 112, value: 127 },
    { id: 'random-r', label: 'Random R mode', cc: 113, value: 127 },
    { id: 'random-both', label: 'Random both modes', cc: 114, value: 127 },
    { id: 'factory-reset', label: 'Factory reset', cc: 56, value: 1, confirm: 'Reset the pedal to factory settings?' },
  ],

  leds: ({ values, held, preset, tapBpm }) => [
    switchLed(values.s2 === 1, held.has('s2')),
    tapBpm ? { color: 'red', blinkMs: beatMs(tapBpm) } : presetLed(preset),
    switchLed(values.s1 === 1, held.has('s1')),
  ],
};
