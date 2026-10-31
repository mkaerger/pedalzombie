import { dip, fader, knob } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { beatMs, CLOCK_TAP, clockControls, clockOnChange, clockSection, LED_OFF, presetLed } from './shared';

// Reference: docs/midi/gravitas.md
// Analog tremolo with a clean boost. The three toggles (tap division / mode, both wave shapes) and
// the dip switches have no MIDI control; CC21 only sets the MIDI clock division.

export const gravitas: PedalDefinition = {
  slug: 'gravitas-editor',
  name: 'Gravitas',
  manufacturer: 'Chase Bliss',
  tagline: 'Analog and harmonic tremolo with a clean boost: drive, tone, rate, depth and sway, tap tempo and clock divisions.',
  storageKey: 'gravitas',
  defaultChannel: 4,
  midiReference: 'docs/midi/gravitas.md',
  released: '2015-06',
  theme: { body: '#1b1b1e', ink: '#cfcfd4', accent: '#cfcfd4', knob: '#4a4a4e', knobIndicator: '#ffffff' },

  controls: [
    knob('k1', 'DRIVE', 14, 40, { hint: 'Gain of the clean boost. Becomes the ramp speed on the pedal while a ramping dip is on.' }),
    knob('k2', 'VOLUME', 15, 127, { hint: 'The manual suggests leaving it fully up and setting the level with DRIVE.' }),
    knob('k3', 'TONE', 16, 64, { hint: 'Noon is transparent. In harmonic mode it sets the top of the sweep.' }),
    knob('k4', 'RATE', 17, 64, { hint: 'Tap tempo and MIDI clock override it.' }),
    knob('k5', 'DEPTH', 18, 64),
    knob('k6', 'SWAY', 19, 64, { hint: 'Noon is a symmetric wave.' }),
    fader('f1', 'RAMP', 20, 64),

    dip('s1', 'BYPASS', 102, 127, { on: 127 }),
    ...clockControls(120, 'tremolo period'),
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
    { color: 'red', blinkMs: beatMs(values.s2) },
    presetLed(preset),
    values.s1 === 127 ? { color: 'red' } : LED_OFF,
  ],
};
