import { dip, fader, knob, toggle, value } from '../editor/core/controls';
import type { PedalDefinition } from '../editor/core/types';
import { beatMs, LED_OFF, presetLed } from './shared';

// Reference: docs/midi/habit.md

/** Modifier = MOD NUMBER (t1) + MOD BANK (t2) + MODE (t3), with a MOD (k4) starting point. */
const modifier = (label: string, image: string, t1: number, t2: number, t3: number, k4: number) => ({
  label,
  image: `${image}.png`,
  values: { t1, t2, t3, k4 },
});

export const habit: PedalDefinition = {
  slug: 'habit-editor',
  name: 'Habit',
  manufacturer: 'Chase Bliss',
  tagline: 'Echo collector: modifiers, memory scan and loop, tap tempo and ready-made ideas.',
  storageKey: 'habit',
  defaultChannel: 2,
  midiReference: 'docs/midi/habit.md',
  released: '2022-03',
  theme: { body: '#f4b71f', ink: '#23304f', accent: '#d8336b', knob: '#e9e9ec', knobIndicator: '#2a7de1' },

  controls: [
    knob('k1', 'VOLUME', 14, 63),
    knob('k2', 'REPEATS', 15, 63),
    knob('k3', 'SIZE', 16, 31),
    knob('k4', 'MOD', 17, 0),
    knob('k5', 'SPREAD', 18, 0),
    knob('k6', 'SCAN', 19, 0),
    fader('f1', 'RAMP', 20, 64),

    toggle('t1', 'MOD NUMBER', 21, 2, ['1', '2', '3']),
    toggle('t2', 'MOD BANK', 22, 2, ['A', 'Off', 'B']),
    toggle('t3', 'MODE', 23, 2, ['In', 'Out', 'Feed']),

    dip('s1', 'BYPASS', 102, 1),
    value('s2', 'Tempo', 120, { min: 20, max: 300 }),
    dip('s3', 'LOOP', 24, 0, { offLabel: 'Off', onLabel: 'Looping', hint: 'Same as holding the bypass footswitch.' }),
    dip('s4', 'SCAN', 25, 0, { offLabel: 'Off', onLabel: 'Scanning', hint: 'Same as holding the tap footswitch.' }),
    dip('s5', 'MIDI CLOCK', 51, 0, { offLabel: 'Ignore', onLabel: 'Listen' }),
  ],

  face: {
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    footswitches: [
      {
        id: 'tap',
        label: 'Tap',
        press: { type: 'tap' },
        hold: { type: 'momentary', cc: 25, on: 1, off: 0, label: 'Scan' },
      },
      {
        id: 's1',
        label: 'Bypass',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 24, on: 1, off: 0, label: 'Loop' },
      },
    ],
  },

  sections: [
    {
      id: 'memory',
      title: 'Memory & clock',
      blocks: [{ type: 'controls', controls: ['s3', 's4', 's5', 'f1'], columns: 4 }],
    },
  ],

  ideas: [
    {
      title: 'Modifiers',
      items: [
        modifier('Floating away', 'b2in', 2, 3, 1, 80),
        modifier('Crumbling echoes', 'b3in', 3, 3, 1, 52),
        modifier('Interruption patterns', 'b3out', 3, 3, 2, 80),
        modifier('Wizard jazz', 'b1in', 1, 3, 1, 80),
        modifier('Tape delay', 'a2in', 2, 1, 1, 52),
        modifier('Sliced subdivisions', 'a3out', 3, 1, 2, 42),
        modifier('Reverse delay', 'a1out', 1, 1, 2, 42),
        modifier('Special', 'a1out', 1, 1, 2, 90),
      ],
    },
    {
      title: 'Spreads',
      items: [
        { label: 'Tidy taps', image: 'a1out.png', values: { k2: 78, k3: 27, k5: 27 } },
        { label: 'Here and there', image: 'a3out.png', values: { k2: 82, k3: 44, k5: 73 } },
      ],
    },
  ],

  presets: {},
  tap: { cc: 93, value: 127, bpmControl: 's2' },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 't1', 't2', 't3', 'f1'] },
  ],

  commands: [{ id: 'clear', label: 'Clear memory', cc: 26, value: 127, confirm: 'Clear the memory of the pedal?' }],

  leds: ({ values, held, preset }) => [
    held.has('tap') || values.s4 === 1 ? { color: 'green' } : { color: 'red', blinkMs: beatMs(values.s2) },
    presetLed(preset),
    held.has('s1') || values.s3 === 1 ? { color: 'green' } : values.s1 === 1 ? { color: 'red' } : LED_OFF,
  ],
};
