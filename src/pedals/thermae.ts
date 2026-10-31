import { dip, fader, knob, toggle, value } from '../editor/core/controls';
import type { ControlValues, LedState, PedalDefinition, SwitchControl } from '../editor/core/types';
import { beatMs, LED_OFF, presetLed } from './shared';

// Reference: docs/midi/thermae.md
// Analog delay whose time is stepped by a two-interval sequencer. The 2018 MIDI manual documents knobs,
// three toggles, tap, clock, runaway (CC24), slowdown mode (CC25) and bypass — no dip switches. The
// MODULATION dip changes what INT 1 / INT 2 and two toggles mean; it has no CC, so the editor only
// mirrors it to relabel the knobs.

const modulation = (v: ControlValues) => v.m1 === 1;

const STEP = ['Quarter', 'Dotted 8th', 'Eighth'];

/** A setting that lives on the pedal only: no CC, never sent, just steers labels in the editor. */
const reference = (id: string, label: string, hint: string): SwitchControl => ({
  kind: 'switch',
  id,
  label,
  default: 0,
  off: 0,
  on: 1,
  offLabel: 'Off',
  onLabel: 'On',
  hint,
  sync: false,
});

export const thermae: PedalDefinition = {
  slug: 'thermae-editor',
  name: 'Thermae',
  manufacturer: 'Chase Bliss',
  tagline: 'Analog delay with a pitch-shifting step sequencer: intervals, glide, resonant filter, runaway and slowdown.',
  storageKey: 'thermae',
  defaultChannel: 2,
  midiReference: 'docs/midi/thermae.md',
  released: '2018-05',
  theme: { body: '#1a2035', ink: '#9fb0c4', accent: '#b5a06a', knob: '#b39a5a', knobIndicator: '#1a2035' },

  controls: [
    knob('k1', 'MIX', 14, 64, { hint: 'Becomes the ramp speed on the pedal while a ramping dip is on.' }),
    knob('k2', 'LPF', 15, 85),
    knob('k3', 'REGEN', 16, 15),
    knob('k4', 'GLIDE', 17, 15, { hint: 'How the delay time slides between steps.' }),
    knob('k5', 'INT 1', 18, 75, {
      labelFor: (v) => (modulation(v) ? 'SPEED' : undefined),
      hint: 'First interval: noon = step off, down = slower and lower, up = faster and higher. SPEED with the MODULATION dip on.',
    }),
    knob('k6', 'INT 2', 19, 85, {
      labelFor: (v) => (modulation(v) ? 'DEPTH' : undefined),
      hint: 'Second interval, relative to INT 1. DEPTH with the MODULATION dip on.',
    }),
    fader('f1', 'RAMP', 20, 64),

    toggle('t1', 'TAP DIVISION', 21, 3, STEP, { hint: 'Length of the base step. With both INT knobs at noon this is a plain tap subdivision.' }),
    toggle('t2', 'INT 1 STEP', 22, 3, STEP, { hint: 'Length of the INT 1 step. With the MODULATION dip on the same positions are Steady / Twitchy / Abrupt.' }),
    toggle('t3', 'INT 2 STEP', 23, 3, STEP, { hint: 'Length of the INT 2 step. With the MODULATION dip on the same positions are Triangle / Sine / Square.' }),

    dip('s1', 'BYPASS', 102, 127, { on: 127 }),
    value('s2', 'Tempo', 120, { min: 20, max: 300 }),
    dip('s4', 'MIDI CLOCK', 51, 127, { on: 127, offLabel: 'Ignore', onLabel: 'Listen' }),
    // CC25: 127 enters, 0 leaves — slowdown mode in sequencer mode, tap entry in step mode; a performance state
    dip('h1', 'SLOWDOWN', 25, 0, {
      on: 127,
      offLabel: 'Normal',
      onLabel: 'Half speed',
      hint: 'Same as holding both footswitches: the sequencer runs at half speed (in step mode: tap in a new base tempo).',
      sync: false,
    }),

    reference('m1', 'MODULATION dip', 'Mirror of the MODULATION dip on the pedal: INT 1 and INT 2 become SPEED and DEPTH. Sends nothing.'),
  ],

  face: {
    format: 'classic',
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
        hold: { type: 'momentary', cc: 24, on: 127, off: 0, label: 'Runaway' },
      },
      { id: 's1', label: 'Bypass', press: { type: 'toggle', control: 's1' } },
    ],
  },

  sections: [
    {
      id: 'clock',
      title: 'Ramp, clock & hold functions',
      blocks: [{ type: 'controls', controls: ['f1', 's4', 'h1'], columns: 3 }],
    },
    {
      id: 'reference',
      title: 'On the pedal',
      blocks: [{ type: 'controls', controls: ['m1'], columns: 3 }],
    },
  ],

  presets: { liveBeforeLoad: true },
  tap: { cc: 93, value: 127, bpmControl: 's2' },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 't1', 't2', 't3', 'f1'] },
  ],

  // tap LED: green while runaway is held or in slowdown mode (manual), otherwise it follows the tempo
  leds: ({ values, held, preset }) => {
    const left: LedState = held.has('tap') || values.h1 === 127 ? { color: 'green' } : { color: 'red', blinkMs: beatMs(values.s2) };
    return [left, presetLed(preset), values.s1 === 127 ? { color: 'red' } : LED_OFF];
  },
};
