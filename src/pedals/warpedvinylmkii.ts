import { dip, fader, knob } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { CLOCK_TAP, clockControls, clockOnChange, clockSection, knobBlinkMs, LED_OFF, presetLed } from './shared';

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
    ...clockControls(60, 'vibrato period'),
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

  sections: [clockSection()],

  presets: { liveBeforeLoad: true },
  tap: CLOCK_TAP,

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'f1'] },
  ],

  onChange: clockOnChange,

  leds: ({ values, preset }) => [
    { color: 'red', blinkMs: knobBlinkMs(127 - values.k4) },
    presetLed(preset),
    values.s1 === 127 ? { color: 'red' } : LED_OFF,
  ],
};
