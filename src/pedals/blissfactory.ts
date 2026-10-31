import { dip, knob, toggle } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { LED_OFF, presetLed } from './shared';

// Reference: docs/midi/bliss-factory.md
// Chase Bliss × ZVEX Fuzz Factory with digital control. The AUX footswitch (CC101) applies the function
// picked with the AUX FUNC toggle. No tap, no clock, no dip CCs.

export const blissfactory: PedalDefinition = {
  slug: 'blissfactory-editor',
  name: 'Bliss Factory',
  manufacturer: 'Chase Bliss',
  tagline: 'The Fuzz Factory with presets: volume, gate, comp, drive, stab, a resonant low-pass, the FAT switch and the AUX footswitch.',
  storageKey: 'blissfactory',
  defaultChannel: 2,
  midiReference: 'docs/midi/bliss-factory.md',
  released: '2019-10',
  theme: { body: '#a9abad', ink: '#1a1a1a', accent: '#2f7a45', knob: '#2f7a45', knobIndicator: '#e8f3ea' },

  controls: [
    knob('k1', 'VOLUME', 14, 64),
    knob('k2', 'GATE', 15, 64, { hint: 'Up closes the gate and stops squeals. Becomes the ramp speed on the pedal while a ramping dip is on.' }),
    knob('k3', 'COMP', 16, 64, { hint: 'Pinches the tone when fully up.' }),
    knob('k4', 'DRIVE', 17, 64, { detail: (v) => (v.k3 >= 127 ? 'No effect while COMP is fully up' : undefined) }),
    knob('k5', 'STAB', 18, 127, { hint: 'Fully up for classic fuzz, down for squishy self-oscillation.' }),
    knob('k6', 'LPF', 19, 127, { hint: 'Fully up is open. The LPF toggle sets slope and resonance.' }),

    toggle('t1', 'AUX FUNC', 21, 1, ['Stab', 'LPF', 'Gate'], { hint: 'What the AUX footswitch does: max STAB, jump LPF to max, or close the gate.' }),
    toggle('t2', 'FAT', 22, 3, ['Fatter', 'Fat', 'Norm'], { hint: 'Sub frequencies into the fuzz. Norm is the stock Fuzz Factory.' }),
    toggle('t3', 'LPF', 23, 1, ['One-pole', 'Two-pole', 'Self-oscillating']),

    dip('s1', 'BYPASS', 102, 1),
    dip('s2', 'AUX', 101, 0, { hint: 'Engages the AUX function; the AuxPol dip on the pedal reverses it.' }),
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

  sections: [],

  presets: { liveBeforeLoad: true },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 't1', 't2', 't3'] },
  ],

  leds: ({ values, preset }) => [
    values.s2 === 1 ? { color: 'red' } : LED_OFF,
    presetLed(preset),
    values.s1 === 1 ? { color: 'red' } : LED_OFF,
  ],
};
