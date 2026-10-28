import { dip, knob, toggle } from '../editor/core/controls';
import type { ControlValues, MidiMessage, PedalDefinition } from '../editor/core/types';
import { knobBlinkMs, LED_OFF, presetLed } from './shared';

// Reference: docs/midi/mood.md

const LOOPER_ON = 45;
const WET_ON = 85;

/**
 * MOOD MKI has a single bypass CC (103) for both channels:
 * 127 both on · 85 wet only · 45 loop only · 0 both bypassed.
 */
function bypassState(v: ControlValues): MidiMessage[] {
  const loop = v.s1 === LOOPER_ON;
  const wet = v.s2 === WET_ON;
  const value = loop && wet ? 127 : wet ? WET_ON : loop ? LOOPER_ON : 0;
  return [{ type: 'cc', cc: 103, value }];
}

export const mood: PedalDefinition = {
  slug: 'mood-editor',
  name: 'MOOD',
  manufacturer: 'Chase Bliss',
  tagline: 'The original MOOD: wet channel and micro-looper, routing and both bypass channels.',
  storageKey: 'mood',
  defaultChannel: 2,
  midiReference: 'docs/midi/mood.md',
  released: '2019-08',
  theme: { body: '#ee8c7c', ink: '#262a5c', accent: '#4347a3', knob: '#f6f0ea', knobIndicator: '#262a5c' },

  controls: [
    knob('k1', 'TIME', 14, 63),
    knob('k2', 'MIX', 15, 80),
    knob('k3', 'LENGTH', 16, 31),
    knob('k4', 'MODIFY', 17, 59, { hint: 'Wet channel' }),
    knob('k5', 'CLOCK', 18, 58),
    knob('k6', 'MODIFY', 19, 20, { hint: 'Micro-looper' }),

    toggle('t1', 'WET CHANNEL', 21, 2, ['Reverb', 'Delay', 'Slip']),
    toggle('t2', 'ROUTING', 22, 2, ['In', 'Loop + In', 'Loop']),
    toggle('t3', 'MICRO-LOOPER', 23, 2, ['Env', 'Tape', 'Stretch']),

    // both footswitch states end up in CC103
    { ...dip('s1', 'LOOPER', 103, 0, { on: LOOPER_ON }), cc: undefined, send: (_, v) => bypassState(v) },
    { ...dip('s2', 'WET', 103, WET_ON, { on: WET_ON }), cc: undefined, send: (_, v) => bypassState(v) },
  ],

  face: {
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    footswitches: [
      { id: 's2', label: 'Wet', press: { type: 'toggle', control: 's2' } },
      { id: 's1', label: 'Loop', press: { type: 'toggle', control: 's1' } },
    ],
  },

  sections: [],

  ideas: [
    {
      title: 'Bypass',
      items: [
        { label: 'Both on', values: { s1: LOOPER_ON, s2: WET_ON } },
        { label: 'Both off', values: { s1: 0, s2: 0 } },
      ],
    },
  ],

  presets: { liveBeforeLoad: true },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 't1', 't2', 't3'] },
  ],

  // Switching the micro-looper program stops the looper, as on the pedal.
  onChange: (id, _value, v) => (id === 't3' && v.s1 === LOOPER_ON ? { s1: 0 } : undefined),

  leds: ({ values, preset }) => [
    values.s2 === WET_ON ? { color: 'red' } : LED_OFF,
    presetLed(preset),
    values.s1 === LOOPER_ON ? { color: 'green', blinkMs: knobBlinkMs(127 - values.k5) } : LED_OFF,
  ],
};
