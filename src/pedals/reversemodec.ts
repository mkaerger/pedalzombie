import { dip, fader, knob, rangeOf, select, toggle } from '../editor/core/controls';
import type { ControlValues, LedState, PedalDefinition } from '../editor/core/types';
import { beatMs, customizeDips, dipsSection, LED_OFF, presetLed, RAMP_WAVEFORMS, rampingDips } from './shared';

// Reference: docs/midi/reverse-mode-c.md

const SUBDIVISIONS = ['×16', '×8', '×4', '×2', '×1', '×½', '×¼', '×⅛'].map((label, i) => ({ value: i * 16, label }));

/** Modulation flavour: MOD TYPE toggle (t2) plus the MOD TYPE dip (d16) for the alternate. */
const MOD_FLAVOURS: Record<number, [string, string]> = {
  1: ['Vibrato', 'Chorus'],
  2: ['Square tremolo', 'Ramp-down tremolo'],
  3: ['Frequency shift up', 'Frequency shift down'],
};
const modFlavour = (v: ControlValues) => MOD_FLAVOURS[v.t2]?.[v.d16 === 1 ? 1 : 0];

export const reversemodec: PedalDefinition = {
  slug: 'reversemodec-editor',
  name: 'Reverse Mode C',
  manufacturer: 'Chase Bliss',
  tagline: 'Multidirectional delay: three voices, sequencer, modulation, freeze and half speed.',
  storageKey: 'reversemodec',
  defaultChannel: 2,
  midiReference: 'docs/midi/reverse-mode-c.md',
  released: '2023-03',
  theme: { body: '#f1efe9', ink: '#1d1d1b', accent: '#d62236', knob: '#dedcd6', knobIndicator: '#1d1d1b' },

  controls: [
    knob('k1', 'TIME', 14, 64),
    knob('k2', 'MIX', 15, 64),
    knob('k3', 'FEEDBACK', 16, 50),
    knob('k4', 'OFFSET', 17, 64),
    knob('k5', 'BALANCE', 18, 64),
    knob('k6', 'FILTER', 19, 64),
    fader('f1', 'RAMP SPEED', 20, 64),

    toggle('t1', 'MODULATION', 21, 2, ['Sync', 'Off', 'Free']),
    toggle('t2', 'MOD TYPE', 22, 1, ['Vib', 'Trem', 'Freq']),
    toggle('t3', 'SEQUENCE', 23, 2, ['Run', 'Off', 'Env']),

    select('c1', 'Sequencer subdivision', 24, 64, SUBDIVISIONS),
    knob('k8', 'RAMPING WAVEFORM', 25, 70, { readout: (value) => rangeOf(RAMP_WAVEFORMS, value) }),
    knob('k9', 'MOD DEPTH', 27, 64, { detail: modFlavour }),
    knob('k10', 'MOD RATE', 28, 64, { detail: modFlavour }),
    toggle('h1', 'OCTAVE TYPE', 31, 2, ['Oct down', 'Both', 'Oct up']),
    { kind: 'toggle', id: 'h2', label: 'SEQUENCE SPACING', cc: 33, default: 1, options: [
      { value: 1, label: 'Rest' },
      { value: 2, label: 'Skip' },
    ], hint: 'How the sequencer treats voices muted with BALANCE: leave a rest, or skip them.' },

    // Footswitch state (latching)
    dip('s1', 'BYPASS', 102, 1),

    ...rampingDips(['TIME', 'OFFSET', 'BALANCE', 'FILTER', 'FEED', 'BOUNCE']),
    ...customizeDips(['SWAP', 'MISO', 'SPREAD', 'TRAILS', 'LATCH', 'FEED TYPE', 'FADE TYPE', 'MOD TYPE'], {
      SWAP: 'Swaps DEPTH/RATE with OFFSET/BALANCE on the pedal surface. MIDI is not affected.',
      LATCH: 'Footswitch hold functions latch instead of being momentary.',
      'FEED TYPE': 'Octave inside or outside the feedback loop.',
      'FADE TYPE': 'Sequencer steps change immediately or fade smoothly.',
      'MOD TYPE': 'Alternate modulation flavour.',
    }),

    dip('d17', 'MIDI CLOCK', 51, 0, { offLabel: 'Ignore', onLabel: 'Follow' }),
    dip('d18', 'RAMP / BOUNCE', 52, 1, { offLabel: 'Off', onLabel: 'On' }),
    dip('d19', 'DRY KILL', 57, 0, { offLabel: 'Off', onLabel: 'On' }),
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
        hold: { type: 'momentary', cc: 105, on: 1, off: 0, label: 'Freeze' },
      },
      {
        id: 's1',
        label: 'Bypass',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 106, on: 1, off: 0, label: 'Half speed' },
      },
    ],
  },

  sections: [
    {
      id: 'alt',
      title: 'Alt controls',
      blocks: [
        { type: 'controls', controls: ['k9', 'k10', 'k8'], columns: 3 },
        { type: 'controls', title: 'Hidden options', controls: ['h1', 'h2', 'f1'], columns: 3 },
        { type: 'select', control: 'c1' },
      ],
    },
    dipsSection(),
    {
      id: 'global',
      title: 'Global settings',
      blocks: [{ type: 'controls', controls: ['d17', 'd18', 'd19'], columns: 3 }],
    },
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },
  tap: { cc: 93, value: 127 },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'alt', label: 'Alt controls', controls: ['k8', 'k9', 'k10', 'c1', 'h1', 'h2'] },
    { id: 'ramping', label: 'Ramping', controls: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'f1'] },
    {
      id: 'all',
      label: 'Everything',
      controls: [
        'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k8', 'k9', 'k10', 'f1', 'c1',
        't1', 't2', 't3', 'h1', 'h2',
        'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16',
      ],
    },
  ],

  commands: [{ id: 'factory-reset', label: 'Factory reset', cc: 56, value: 1, confirm: 'Reset the pedal to factory settings?' }],

  leds: ({ values, held, preset, tapBpm }) => {
    const left: LedState = held.has('tap') ? { color: 'green' } : tapBpm ? { color: 'red', blinkMs: beatMs(tapBpm) } : LED_OFF;
    const right: LedState = held.has('s1') ? { color: 'amber' } : values.s1 === 1 ? { color: 'red' } : LED_OFF;
    return [left, presetLed(preset), right];
  },
};
