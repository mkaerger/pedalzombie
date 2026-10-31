import { dip, fader, knob, select, value } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { knobBlinkMs, LED_OFF, presetLed } from './shared';

// Reference: docs/midi/warped-vinyl-mkii.md
// The three toggles and the dip switches have no MIDI control on this pedal.

export const warpedvinylmkii: PedalDefinition = {
  slug: 'warpedvinyl-editor',
  name: 'Warped Vinyl MKII',
  manufacturer: 'Chase Bliss',
  tagline: 'Analog vibrato and chorus: tone, RPM, depth and warp, tap tempo and MIDI clock divisions.',
  storageKey: 'warpedvinylmkii',
  defaultChannel: 5,
  midiReference: 'docs/midi/warped-vinyl-mkii.md',
  released: '2016-04',
  theme: { body: '#f3eee3', ink: '#5a3e1b', accent: '#b5852a', knob: '#e2ddd3', knobIndicator: '#5a3e1b' },

  controls: [
    knob('k1', 'TONE', 14, 63),
    knob('k2', 'VOLUME', 15, 105),
    knob('k3', 'MIX', 16, 90),
    knob('k4', 'RPM', 17, 100),
    knob('k5', 'DEPTH', 18, 100),
    knob('k6', 'WARP', 19, 58),
    fader('f1', 'RAMP', 20, 64),

    dip('s1', 'BYPASS', 102, 127, { on: 127 }),
    value('s2', 'Tempo', 60, { min: 20, max: 300 }),
    select('s3', 'MIDI clock division', 21, 3, [
      { value: 0, label: 'Whole' },
      { value: 1, label: 'Half' },
      { value: 2, label: '1/4 triplet' },
      { value: 3, label: 'Quarter' },
      { value: 4, label: 'Eighth' },
      { value: 5, label: 'Sixteenth' },
    ], { hint: 'Notes per vibrato period when following MIDI clock.' }),
    dip('s4', 'MIDI CLOCK', 51, 127, { on: 127, offLabel: 'Ignore', onLabel: 'Listen' }),
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
  ],

  presets: { liveBeforeLoad: true },
  tap: { cc: 93, value: 127, bpmControl: 's2' },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'f1'] },
  ],

  // A clock division only has an effect while the pedal listens to MIDI clock.
  onChange: (id, _value, v) => (id === 's3' && v.s4 !== 127 ? { s4: 127 } : undefined),

  leds: ({ values, preset }) => [
    { color: 'red', blinkMs: knobBlinkMs(127 - values.k4) },
    presetLed(preset),
    values.s1 === 127 ? { color: 'red' } : LED_OFF,
  ],
};
