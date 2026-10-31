import { dip, fader, knob, select, value } from '../editor/core/controls';
import type { PedalDefinition, SwitchControl } from '../editor/core/types';
import { beatMs, clockOnChange, LED_OFF, presetLed } from './shared';

// Reference: docs/midi/tonal-recall.md
// Analog bucket-brigade delay. One editor for Tonal Recall and the RKM (Red Knob Mod, four chips,
// twice the delay): the RKM has no MIDI manual of its own and the same controls. The S/L/B and
// wave-shape toggles and the runaway hold have no CC; CC21 is the clock division.

/** CC21 note divisions in manual order. */
export const TR_DIVISIONS = ['Quarter', 'Dotted 8th', '8th triplet', 'Eighth', '8th sextolet', 'Sixteenth'].map((label, value) => ({ value, label }));

/** Setting that lives on the pedal only: which model is in front of you. Sends nothing. */
const rkm: SwitchControl = {
  kind: 'switch',
  id: 'm1',
  label: 'RED KNOB MOD',
  default: 0,
  off: 0,
  on: 1,
  offLabel: 'Tonal Recall',
  onLabel: 'RKM',
  hint: 'The RKM has four delay chips and up to 1100 ms. Same MIDI, this only changes the look and the readouts. Sends nothing.',
  sync: false,
};

const isRkm = (v: Record<string, number>) => v.m1 === 1;

export const tonalrecall: PedalDefinition = {
  slug: 'tonalrecall-editor',
  name: 'Tonal Recall',
  manufacturer: 'Chase Bliss',
  tagline: 'Analog bucket-brigade delay, also the RKM: tone, mix, time, regen, modulation, tap tempo and clock divisions.',
  storageKey: 'tonalrecall',
  defaultChannel: 2,
  midiReference: 'docs/midi/tonal-recall.md',
  released: '2016-08',
  theme: { body: '#d6d8da', ink: '#1c2430', accent: '#a8322b', knob: '#7fa3b5', knobIndicator: '#1c2430' },
  themeFor: (v) => (isRkm(v) ? { knob: '#8f1a1e', knobIndicator: '#f3e9e9' } : undefined),

  controls: [
    knob('k1', 'TONE', 14, 64, { hint: 'Becomes the ramp speed on the pedal while a ramping dip is on.' }),
    knob('k2', 'MIX', 15, 90, { hint: '50/50 is at about three quarters on the Tonal Recall, a little past noon on the RKM.' }),
    knob('k3', 'RATE', 16, 64, { hint: 'Modulation speed.' }),
    knob('k4', 'TIME', 17, 64, {
      hint: 'Tap tempo overrides it. The S/L/B toggle on the pedal sets the range.',
      detail: (v) => (isRkm(v) ? 'Up to 1100 ms' : 'Up to 550 ms'),
    }),
    knob('k5', 'REGEN', 18, 50),
    knob('k6', 'DEPTH', 19, 0, { hint: 'Modulation depth.' }),
    fader('f1', 'RAMP', 20, 64),

    dip('s1', 'BYPASS', 102, 127, { on: 127 }),
    value('s2', 'Tempo', 120, { min: 20, max: 300 }),
    select('s3', 'MIDI clock division', 21, 0, TR_DIVISIONS, { hint: 'Delay time per clock beat when following MIDI clock.' }),
    dip('s4', 'MIDI CLOCK', 51, 127, { on: 127, offLabel: 'Ignore', onLabel: 'Listen' }),

    rkm,
  ],

  face: {
    format: 'classic',
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: [],
    footswitches: [
      { id: 'tap', label: 'Tap', press: { type: 'tap' } },
      { id: 's1', label: 'Bypass', press: { type: 'toggle', control: 's1' } },
    ],
  },

  sections: [
    {
      id: 'clock',
      title: 'Ramp & clock',
      blocks: [
        { type: 'controls', controls: ['f1', 's4'], columns: 2 },
        { type: 'select', control: 's3' },
      ],
    },
    {
      id: 'reference',
      title: 'On the pedal',
      blocks: [{ type: 'controls', controls: ['m1'], columns: 3 }],
    },
  ],

  presets: { liveBeforeLoad: true },
  tap: { cc: 93, value: 127, bpmControl: 's2' },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'f1'] },
  ],

  onChange: clockOnChange,

  leds: ({ values, preset }) => [
    { color: 'red', blinkMs: beatMs(values.s2) },
    presetLed(preset),
    values.s1 === 127 ? { color: 'red' } : LED_OFF,
  ],
};
