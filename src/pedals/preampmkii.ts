import { arcade, fader } from '../editor/core/controls';
import type { ControlValues, PedalDefinition } from '../editor/core/types';
import { activeLed, bankFootswitches, bankLed, bankPresets, bypass, jumpButton } from './automatone';

// Reference: docs/midi/preamp-mkii.md
// Preamp MKII (Chase Bliss × Benson Amps): the first Automatone. All-analog preamp, fuzz and
// parametric mids under digital control with motorized faders. 30 presets in 3 banks.

const midsOff = (v: ControlValues) => v.b2 === 1;
const inactive = (v: ControlValues) => (midsOff(v) ? 'Inactive (MIDS off)' : undefined);

/** FREQ fader: roughly 150 Hz at the bottom to a little over 4 kHz at the top (manual), log scale. */
export const freqHz = (value: number) => Math.round(150 * Math.pow(4200 / 150, value / 127));

export const preampmkii: PedalDefinition = {
  slug: 'preampmkii-editor',
  name: 'Preamp MKII',
  manufacturer: 'Chase Bliss',
  tagline: 'Benson preamp with fuzz, clipping diodes and parametric mids on six motorized faders. 30 presets.',
  storageKey: 'preampmkii',
  defaultChannel: 2,
  midiReference: 'docs/midi/preamp-mkii.md',
  released: '2019-04',
  theme: { body: '#d9dad6', ink: '#26272a', accent: '#2d7ff0', knob: '#b9bcc1', knobIndicator: '#2a2b2e' },

  controls: [
    fader('f1', 'VOLUME', 14, 64, { hint: 'Master volume.' }),
    fader('f2', 'TREBLE', 15, 64),
    fader('f3', 'MIDS', 16, 64, {
      hint: 'Parametric mids, ±18 dB. Halfway = flat.',
      detail: inactive,
      readout: (value, v) => (midsOff(v) ? undefined : { from: 0, to: 127, label: `${value >= 64 ? '+' : '−'}${Math.round((Math.abs(value - 64) / 64) * 18)} dB` }),
    }),
    fader('f4', 'FREQ', 17, 64, {
      hint: 'Centre frequency of the MIDS control, about 150 Hz to 4 kHz.',
      detail: inactive,
      readout: (value, v) => (midsOff(v) ? undefined : { from: 0, to: 127, label: `≈ ${freqHz(value)} Hz` }),
    }),
    fader('f5', 'BASS', 18, 64),
    fader('f6', 'GAIN', 19, 40),

    jumpButton(),
    arcade(
      'b2',
      'MIDS',
      23,
      1,
      [
        { label: 'Off', led: 'off', hint: 'Mids removed from the signal path' },
        { label: 'Pre', led: 'blue', hint: 'Mids before the preamp' },
        { label: 'Post', led: 'red', hint: 'Mids after the preamp' },
      ],
      { hint: 'Where the parametric mids sit. Off takes MIDS and FREQ out of the path.' },
    ),
    arcade(
      'b3',
      'Q',
      24,
      1,
      [
        { label: 'Low', led: 'off', hint: 'Wide hump or scoop' },
        { label: 'Mid', led: 'blue', hint: 'More focused' },
        { label: 'High', led: 'red', hint: 'Very narrow' },
      ],
      { hint: 'Width of the mids band.' },
    ),
    arcade(
      'b4',
      'DIODE',
      25,
      1,
      [
        { label: 'Off', led: 'off', hint: 'Transistor clipping only, the stock Benson sound' },
        { label: 'Sil', led: 'blue', hint: 'Symmetric silicon clipping' },
        { label: 'Germ', led: 'red', hint: 'Asymmetric germanium clipping' },
      ],
    ),
    arcade(
      'b5',
      'FUZZ',
      26,
      1,
      [
        { label: 'Off', led: 'off' },
        { label: 'Open', led: 'blue' },
        { label: 'Gated', led: 'red' },
      ],
      { hint: 'Silicon fuzz in front of the preamp and the mids.' },
    ),

    bypass(),
  ],

  face: {
    format: 'automatone',
    faders: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
    buttons: ['b1', 'b2', 'b3', 'b4', 'b5'],
    footswitches: bankFootswitches(),
    ledLabels: ['Bank', 'Active'],
    display: (slot) => String(slot % 10),
  },

  sections: [],

  presets: bankPresets(),

  ideas: [
    {
      title: 'Starting points',
      items: [
        { label: 'Stock Benson', values: { b2: 1, b4: 1, b5: 1 } },
        { label: 'Silicon clipping', values: { b4: 2, b5: 1 } },
        { label: 'Germanium clipping', values: { b4: 3, b5: 1 } },
        { label: 'Open fuzz', values: { b5: 2 } },
        { label: 'Gated fuzz', values: { b5: 3 } },
      ],
    },
  ],

  random: [
    { id: 'faders', label: 'Faders', controls: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] },
    { id: 'buttons', label: 'Buttons', controls: ['b2', 'b3', 'b4', 'b5'] },
    { id: 'all', label: 'Everything', controls: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'b2', 'b3', 'b4', 'b5'] },
  ],

  leds: ({ values, preset }) => [bankLed(preset), activeLed(values.s1 === 1)],
};
