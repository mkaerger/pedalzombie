import { dip, fader, knob } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { CLOCK_TAP, clockControls, clockOnChange, clockSection, knobBlinkMs, LED_OFF, presetLed } from './shared';

// Reference: docs/midi/warped-vinyl-hifi.md
// The model after the MKII: LAG replaces VOLUME on CC15, default channel 6. Toggles, dip switches
// and the hold functions of the TAP/HOLD switch have no MIDI control.

export const warpedvinylhifi: PedalDefinition = {
  slug: 'warpedvinylhifi-editor',
  name: 'Warped Vinyl HiFi',
  manufacturer: 'Chase Bliss',
  tagline: 'True-pitch analog vibrato and chorus with the lag knob: tone, mix, RPM, depth, warp, tap tempo and clock divisions.',
  storageKey: 'warpedvinylhifi',
  defaultChannel: 6,
  midiReference: 'docs/midi/warped-vinyl-hifi.md',
  released: '2017-06',
  theme: { body: '#1c1510', ink: '#c9a86a', accent: '#d8b56a', knob: '#b08d4f', knobIndicator: '#111111' },

  controls: [
    knob('k1', 'TONE', 14, 64, { hint: 'Wet path only. Noon is transparent, clockwise shaves lows, counter-clockwise highs. Becomes the ramp speed on the pedal while a ramping dip is on.' }),
    knob('k2', 'LAG', 15, 0, { hint: 'Delay between wet and dry. Fully down for vibrato, up for lush chorus.' }),
    knob('k3', 'MIX', 16, 64, { hint: 'Dry to wet; the middle is chorus, fully up is vibrato.' }),
    knob('k4', 'RPM', 17, 64, { hint: 'Vibrato rate; tap tempo and MIDI clock override it.' }),
    knob('k5', 'DEPTH', 18, 64),
    knob('k6', 'WARP', 19, 64, { hint: 'Noon is a symmetric wave.' }),
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
