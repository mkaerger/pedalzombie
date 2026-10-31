import { dip, knob, toggle } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { customizeDips, dipsSection, LED_OFF, presetLed, rampingDips, RAMPING_IDS } from './shared';

// Reference: docs/midi/brothers-am.md
// Signal chain: treble booster → channel 1 → channel 2. No ramp speed / ramp-bounce CC on this pedal.

const CUSTOMIZE = ['d9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15'];

export const brothersam: PedalDefinition = {
  slug: 'brothersam-editor',
  name: 'Brothers AM',
  manufacturer: 'Chase Bliss × Analog Man',
  tagline: 'Twin gain channels and a treble booster: boost, overdrive or distortion per channel, presence and all dips.',
  storageKey: 'brothersam',
  defaultChannel: 2,
  midiReference: 'docs/midi/brothers-am.md',
  released: '2023-09',
  theme: { body: '#5c1f47', ink: '#f7e6d3', accent: '#f2b632', knob: '#3f1431', knobIndicator: '#f7e6d3' },

  controls: [
    knob('k1', 'GAIN 2', 14, 40),
    knob('k2', 'VOL 2', 15, 64),
    knob('k3', 'GAIN 1', 16, 40),
    knob('k4', 'TONE 2', 17, 64),
    knob('k5', 'VOL 1', 18, 64),
    knob('k6', 'TONE 1', 19, 64),
    knob('k7', 'PRESENCE 2', 27, 64, { hint: 'On the pedal: hold footswitch 2 and turn TONE 2.' }),
    knob('k8', 'PRESENCE 1', 29, 64, { hint: 'On the pedal: hold footswitch 1 and turn TONE 1.' }),

    toggle('t1', 'GAIN 2 TYPE', 21, 2, ['Boost', 'OD', 'Dist']),
    toggle('t2', 'TREBLE BOOST', 22, 2, ['Full sun', 'Off', 'Half sun'], { hint: 'Linked to channel 1, in front of everything.' }),
    toggle('t3', 'GAIN 1 TYPE', 23, 2, ['Dist', 'OD', 'Boost']),

    dip('s1', 'CHANNEL 1', 102, 1),
    dip('s2', 'CHANNEL 2', 103, 0),

    ...rampingDips(['VOL 1', 'VOL 2', 'GAIN 1', 'GAIN 2', 'TONE 1', 'TONE 2']),
    ...customizeDips(['HI GAIN 1', 'HI GAIN 2', 'MOTOBYP 1', 'MOTOBYP 2', 'PRES LINK 1', 'PRES LINK 2', 'MASTER'], {
      'HI GAIN 1': '+25 % gain, the channel LED turns red.',
      'HI GAIN 2': '+25 % gain, the channel LED turns red.',
      'MOTOBYP 1': 'Footswitch 1 becomes momentary on the pedal.',
      'MOTOBYP 2': 'Footswitch 2 becomes momentary on the pedal.',
      'PRES LINK 1': 'TONE 1 also moves PRESENCE 1.',
      'PRES LINK 2': 'TONE 2 also moves PRESENCE 2.',
      MASTER: 'VOL 2 becomes a master volume, even with channel 2 bypassed.',
    }),
  ],

  face: {
    format: 'classic',
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    footswitches: [
      { id: 's2', label: 'Channel 2', press: { type: 'toggle', control: 's2' } },
      { id: 's1', label: 'Channel 1', press: { type: 'toggle', control: 's1' } },
    ],
  },

  sections: [
    { id: 'alt', title: 'Hidden options', blocks: [{ type: 'controls', controls: ['k8', 'k7'], columns: 2 }] },
    dipsSection(CUSTOMIZE),
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'ch1', label: 'Channel 1', controls: ['k3', 'k5', 'k6', 'k8', 't3', 't2'] },
    { id: 'ch2', label: 'Channel 2', controls: ['k1', 'k2', 'k4', 'k7', 't1'] },
    {
      id: 'all',
      label: 'Everything',
      controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 't1', 't2', 't3', ...RAMPING_IDS, 'd9', 'd10'], // HI GAIN only
    },
  ],

  // HI GAIN turns a channel's LED red; otherwise the LED is amber while the channel is on.
  leds: ({ values, preset }) => [
    values.s2 === 1 ? { color: values.d10 === 1 ? 'red' : 'amber' } : LED_OFF,
    presetLed(preset),
    values.s1 === 1 ? { color: values.d9 === 1 ? 'red' : 'amber' } : LED_OFF,
  ],
};
