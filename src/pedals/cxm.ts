import { arcade, dip, fader } from '../editor/core/controls';
import type { ControlValues, PedalDefinition } from '../editor/core/types';
import { activeLed, bankFootswitches, bankLed, bankPresets, bypass, jumpButton } from './automatone';

// Reference: docs/midi/cxm-1978.md
// CXM 1978 (Chase Bliss × Meris): studio reverb whose decay is set by four EQ faders
// ("absorption"), with an analog dry path, 30 presets in 3 banks and the Meris aux functions.

/** CROSS fader: 0 Hz to 1700 Hz, about 362 Hz at the centre (manual) — a power curve through those points. */
export const crossHz = (value: number) => Math.round(1700 * Math.pow(value / 127, 2.23));

const PRE_DELAY_RANGE: Record<number, string> = {
  1: '≤ 42 ms (HiFi)',
  2: '≤ 168 ms (Standard)',
  3: '≤ 1.7 s, also sets the sample rate (LoFi)',
};

const FADERS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
const BUTTONS = ['b2', 'b3', 'b4', 'b5'];

export const cxm: PedalDefinition = {
  slug: 'cxm1978-editor',
  name: 'CXM 1978',
  manufacturer: 'Chase Bliss',
  tagline: 'Studio reverb from the dawn of sprawl: room, plate and hall, three eras, decay shaped by EQ. 30 presets.',
  storageKey: 'cxm',
  defaultChannel: 2,
  midiReference: 'docs/midi/cxm-1978.md',
  released: '2020-09',
  theme: { body: '#f1f1ee', ink: '#2a2b2e', accent: '#2d7ff0', knob: '#b4b7bc', knobIndicator: '#2a2b2e' },

  controls: [
    fader('f1', 'BASS', 14, 64, { hint: 'Decay time below the crossover frequency.' }),
    fader('f2', 'MIDS', 15, 64, { hint: 'Decay time above the crossover frequency.' }),
    fader('f3', 'CROSS', 16, 64, {
      hint: 'Crossover between BASS and MIDS, 0 Hz to 1700 Hz.',
      readout: (value) => ({ from: 0, to: 127, label: `≈ ${crossHz(value)} Hz` }),
    }),
    fader('f4', 'TREBLE', 17, 64, { hint: 'Darkens the reflections by increasing absorption.' }),
    fader('f5', 'MIX', 18, 64, { hint: 'Analog balance between wet and dry.' }),
    fader('f6', 'PRE-DLY', 19, 0, {
      hint: 'Delay before the reverb starts. The range follows the CLOCK button.',
      detail: (v: ControlValues) => PRE_DELAY_RANGE[v.b5],
    }),

    jumpButton(),
    arcade('b2', 'TYPE', 23, 1, [
      { label: 'Room', led: 'off' },
      { label: 'Plate', led: 'blue' },
      { label: 'Hall', led: 'red' },
    ]),
    arcade(
      'b3',
      'DIFFUSION',
      24,
      2,
      [
        { label: 'Low', led: 'off' },
        { label: 'Med', led: 'blue' },
        { label: 'High', led: 'red', hint: 'Adds regeneration to the pre-delay: flanged at short times, echoes at long times' },
      ],
      { hint: 'Low diffusion with HALL is the sparse mode.' },
    ),
    arcade('b4', 'TANK MOD', 25, 2, [
      { label: 'Low', led: 'off' },
      { label: 'Med', led: 'blue' },
      { label: 'High', led: 'red' },
    ]),
    arcade(
      'b5',
      'CLOCK',
      26,
      1,
      [
        { label: 'HiFi', led: 'off', hint: '48 kHz, 32-bit' },
        { label: 'Standard', led: 'blue', hint: '24 kHz, 16-bit' },
        { label: 'LoFi', led: 'red', hint: '48 kHz down to 2.4 kHz, set by PRE-DLY' },
      ],
      { hint: 'Era of the reverb: sample rate and bit depth, and the pre-delay range.' },
    ),

    bypass(),

    // CC31: 0 = sustain on, 1 = off — a performance state, never replayed from presets
    dip('h1', 'SUSTAIN LOCK', 31, 1, {
      off: 1,
      on: 0,
      offLabel: 'Off',
      onLabel: 'Locked',
      hint: 'Holds the reverb tail and keeps the dry signal out of the reverb. Switching off fades the tail with the decay settings.',
      sync: false,
    }),
  ],

  face: {
    format: 'automatone',
    faders: FADERS,
    buttons: ['b1', ...BUTTONS],
    footswitches: bankFootswitches(),
    ledLabels: ['Bank', 'Active'],
    display: (slot) => String(slot % 10),
  },

  sections: [
    {
      id: 'perform',
      title: 'Performance (aux switch functions)',
      blocks: [
        { type: 'commands', commands: ['heel', 'toe', 'clear'] },
        { type: 'controls', controls: ['h1'], columns: 2 },
      ],
    },
  ],

  presets: bankPresets(),

  random: [
    { id: 'faders', label: 'Faders', controls: FADERS },
    { id: 'buttons', label: 'Buttons', controls: BUTTONS },
    { id: 'all', label: 'Everything', controls: [...FADERS, ...BUTTONS] },
  ],

  commands: [
    { id: 'heel', label: 'Heel position', cc: 28, value: 127, hint: 'Moves the faders to the expression heel position of the preset; again returns to the preset.' },
    { id: 'toe', label: 'Toe position', cc: 29, value: 127, hint: 'Moves the faders to the expression toe position of the preset; again returns to the preset.' },
    { id: 'clear', label: 'Buffer clear', cc: 30, value: 127, hint: 'Cuts the reverb tail abruptly.' },
  ],

  leds: ({ values, preset }) => [bankLed(preset), activeLed(values.s1 === 1)],
};
