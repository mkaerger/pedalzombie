import { dip, knob, toggle } from '../editor/core/controls';
import type { ControlValues, MidiMessage, PedalDefinition } from '../editor/core/types';
import { LED_OFF, presetLed } from './shared';

// Reference: docs/midi/dark-world.md
// Dual-channel reverb: Dark (MOD / SHIM / BLACK) on the left footswitch, World (SPRING / PLATE / HALL)
// on the right. Both channel states travel in CC103 (127 both · 85 Dark · 45 World · 0 none); CC102
// ("last saved bypass state") is not needed. No tap tempo, no clock, no dip CCs.

const byDark = (labels: [string, string, string]) => (v: ControlValues) => labels[v.t1 - 1];

/** The pair of channel states as the pedal wants it. */
function channels(v: ControlValues): MidiMessage[] {
  const dark = v.s1 === 1;
  const world = v.s2 === 1;
  const value = dark && world ? 127 : dark ? 85 : world ? 45 : 0;
  return [{ type: 'cc', cc: 103, value }];
}

export const darkworld: PedalDefinition = {
  slug: 'darkworld-editor',
  name: 'Dark World',
  manufacturer: 'Chase Bliss',
  tagline: 'Dual-channel reverb: Dark (mod, shimmer, black) and World (spring, plate, hall), routed in parallel or series.',
  storageKey: 'darkworld',
  defaultChannel: 2,
  midiReference: 'docs/midi/dark-world.md',
  released: '2018-11',
  theme: { body: '#b4b6b8', ink: '#1c2a3a', accent: '#1f6f78', knob: '#d9dbdd', knobIndicator: '#1c2a3a' },

  controls: [
    knob('k1', 'DECAY', 14, 64, {
      detail: byDark(['Reverb decay', 'Path-swap LFO time', 'Freeze threshold']),
      hint: 'Dark channel. Becomes the ramp speed on the pedal while a ramping dip is on.',
    }),
    knob('k2', 'MIX', 15, 64, { hint: 'Fully down is 100 % analog dry.' }),
    knob('k3', 'DWELL', 16, 64, { hint: 'World channel intensity and decay.' }),
    knob('k4', 'MODIFY', 17, 64, {
      detail: byDark(['Warble & VHS degradation', 'Octave mix: down · none · up', 'Frozen audio volume']),
      hint: 'Dark channel.',
    }),
    knob('k5', 'TONE', 18, 64, { hint: 'Low-pass on both channels; a gentler one on World.' }),
    knob('k6', 'PRE-DELAY', 19, 0, {
      hint: 'World channel, 0 to 200 ms.',
      readout: (value) => ({ from: 0, to: 127, label: `≈ ${Math.round((value / 127) * 200)} ms` }),
    }),

    toggle('t1', 'DARK', 21, 1, ['Mod', 'Shim', 'Black']),
    toggle('t2', 'ROUTING', 22, 1, ['Parallel', 'Dark → World', 'World → Dark'], { hint: 'Only matters while both channels are on.' }),
    toggle('t3', 'WORLD', 23, 1, ['Spring', 'Plate', 'Hall']),

    // both footswitch states end up in CC103
    { ...dip('s1', 'DARK', 103, 1), cc: undefined, send: (_, v) => channels(v) },
    { ...dip('s2', 'WORLD', 103, 1), cc: undefined, send: (_, v) => channels(v) },
  ],

  face: {
    format: 'classic',
    knobs: [
      ['k1', 'k2', 'k3'],
      ['k4', 'k5', 'k6'],
    ],
    toggles: ['t1', 't2', 't3'],
    footswitches: [
      { id: 's1', label: 'Dark', press: { type: 'toggle', control: 's1' } },
      { id: 's2', label: 'World', press: { type: 'toggle', control: 's2' } },
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
    values.s1 === 1 ? { color: 'red' } : LED_OFF,
    presetLed(preset),
    values.s2 === 1 ? { color: 'red' } : LED_OFF,
  ],
};
