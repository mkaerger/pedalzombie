import { dip, fader, knob } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { beatMs, CLOCK_TAP, clockControls, clockOnChange, clockSection, LED_OFF, presetLed } from './shared';

// Reference: docs/midi/spectre.md
// Analog through-zero flanger. Old-style MIDI map: knobs, CC21 clock division, CC51 clock, CC93 tap,
// CC102 bypass. The tap-division toggle, both wave-shape toggles and the dip switches have no CC.

export const spectre: PedalDefinition = {
  slug: 'spectre-editor',
  name: 'Spectre',
  manufacturer: 'Chase Bliss',
  tagline: 'Analog through-zero flanger: zero point, regen, rate, width and shift, tap tempo and clock divisions.',
  storageKey: 'spectre',
  defaultChannel: 3,
  midiReference: 'docs/midi/spectre.md',
  released: '2016-10',
  theme: { body: '#1f1e22', ink: '#e6e6ea', accent: '#9ad1ea', knob: '#6b2d6f', knobIndicator: '#ffffff' },

  controls: [
    knob('k1', 'MIX', 14, 64, { hint: 'Becomes the ramp speed on the pedal while a ramping dip is on.' }),
    knob('k2', 'ZERO', 15, 90, { hint: 'Manual delay time. The zero point sits between 1 and 3 o’clock.' }),
    knob('k3', 'REGEN', 16, 40, { hint: 'Up to self-oscillation.' }),
    knob('k4', 'RATE', 17, 64, { hint: 'Tap tempo and MIDI clock override it.' }),
    knob('k5', 'WIDTH', 18, 64),
    knob('k6', 'SHIFT', 19, 64, { hint: 'Skew of the modulation wave. Noon is symmetric.' }),
    fader('f1', 'RAMP', 20, 64),

    dip('s1', 'BYPASS', 102, 127, { on: 127 }),
    ...clockControls(120, 'flanger period'),
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
