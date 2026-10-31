import { dip, fader, knob, rangeOf, select, toggle } from '../editor/core/controls';
import type { ControlValues, LedState, Option, PedalDefinition, ValueRange } from '../editor/core/types';
import { customizeDips, dipsSection, LED_OFF, presetLed, rampingDips, STEPPED_CLOCK } from './shared';

// Reference: docs/midi/bad-mood.md

/** Radio stations on the loop MODIFY knob (Radio mode). The manual gives one value per station; ranges are the midpoints. */
const RADIO_STATIONS: ValueRange[] = [
  { from: 0, to: 15, label: 'Tape' },
  { from: 16, to: 47, label: 'Ambient' },
  { from: 48, to: 79, label: 'Orchestral' },
  { from: 80, to: 111, label: 'Shoegaze' },
  { from: 112, to: 127, label: 'Dance' },
];

/**
 * Flip mode chords on the wet MODIFY knob, transcribed from the MIDI manual (page 08):
 * 48 value ranges, each adding up to four intervals.
 */
const CHORD_RANGES =
  '0-2 3-5 6-7 8-10 11-13 14-15 16-18 19-21 22-23 24-26 27-29 30-31 32-34 35-37 38-39 40-42 43-44 45-47 48-50 51-52 53-55 56-58 59-60 61-63 64-66 67-68 69-71 72-74 75-76 77-79 80-82 83-84 85-87 88-89 90-92 93-95 96-97 98-100 101-103 104-105 106-108 109-111 112-113 114-116 117-119 120-121 122-124 125-127'.split(' ');
const NOTE_1 = '-Oct -5th -4th +4th +5th +Oct -Oct -5th -Oct -4th -Oct +4th -Oct +5th -Oct -5th -4th -5th -5th -4th +4th -Oct -5th +Oct +5th -Oct -5th +Oct +5th -Oct -Oct -4th +Oct +5th -Oct -5th -Oct +Oct -Oct +Oct -Oct -5th -4th +5th -5th +5th +4th +4th'.split(' ');
// notes 2–4 start at chord 7, 22 and 41 respectively
const NOTE_2 = '-5th +Oct -4th +Oct +4th +Oct +5th +Oct +Oct -4th +4th +4th +5th +5th +5th -5th -4th +5th +4th -5th +4th +5th -5th -5th -4th +4th +5th -4th -4th -4th +4th -4th +4th +5th -5th -4th +Oct -Oct +4th +Oct +5th +Oct'.split(' ');
const NOTE_3 = '-4th +4th +4th -4th +4th +5th -5th -Oct +Oct +4th +Oct -4th -Oct +Oct +5th +5th -5th +Oct -Oct -4th +5th -Oct -5th +Oct -Oct -Oct -Oct'.split(' ');
const NOTE_4 = '+4th -Oct -5th +4th -Oct -5th -4th -4th'.split(' ');

export const FLIP_CHORDS: ValueRange[] = CHORD_RANGES.map((range, i) => {
  const [from, to] = range.split('-').map(Number);
  const notes = [NOTE_1[i], NOTE_2[i - 6], NOTE_3[i - 21], NOTE_4[i - 40]].filter(Boolean);
  return { from, to, label: `Chord ${i + 1} · ${notes.join(' ')}` };
});

const DIVISIONS: Option[] = [
  '1/32 note',
  '1/16 note',
  '1/8 note triplet',
  '1/8 note',
  '1/4 note',
  '1/2 note',
  'Dotted 1/2 note',
  'Whole note',
  'Double whole note',
].map((label, value) => ({ value, label }));

/** Wet channel (t1): 1 Soup, 2 Relay, 3 Flip. Micro-looper (t3): 1 Burst, 2 Radio, 3 Mask. */
const byWet = (labels: [string, string, string]) => (v: ControlValues) => labels[v.t1 - 1];
const byLoop = (labels: [string, string, string]) => (v: ControlValues) => labels[v.t3 - 1];

export const badmood: PedalDefinition = {
  slug: 'badmood-editor',
  name: 'BAD MOOD',
  manufacturer: 'Chase Bliss',
  tagline: 'The wild side of MOOD: Soup, Relay and Flip chords, Burst, Radio and Mask loops, cross modulation and glue.',
  storageKey: 'badmood',
  defaultChannel: 2,
  midiReference: 'docs/midi/bad-mood.md',
  released: '2026-01',
  theme: { body: '#e3302b', ink: '#fff4f2', accent: '#ffd23f', knob: '#1c1a1a', knobIndicator: '#fff4f2' },

  controls: [
    knob('k1', 'TIME', 14, 40, { detail: byWet(['Decay / size', 'Delay time', 'Lag / spacing']) }),
    knob('k2', 'MIX', 15, 64, { hint: 'Both channels; ramp speed while ramping is on.' }),
    knob('k3', 'LENGTH', 16, 64, { detail: byLoop(['Size / speed', 'Station dependent', 'Character']) }),
    knob('k4', 'MODIFY', 17, 64, {
      detail: byWet(['Character', 'Feedback', 'Harmony']),
      readout: (value, v) => (v.t1 === 3 ? rangeOf(FLIP_CHORDS, value) : undefined),
    }),
    knob('k5', 'CLOCK', 18, 100, { hint: 'Sample rate; moves in harmonised steps.', readout: (value) => rangeOf(STEPPED_CLOCK, value) }),
    knob('k6', 'MODIFY', 19, 64, {
      detail: byLoop(['Sensitivity', 'Scan', 'Sensitivity']),
      readout: (value, v) => (v.t3 === 2 ? rangeOf(RADIO_STATIONS, value) : undefined),
    }),
    fader('f1', 'RAMP SPEED', 20, 64),

    toggle('t1', 'WET CHANNEL', 21, 1, ['Soup', 'Relay', 'Flip']),
    toggle('t2', 'ROUTING', 22, 2, ['In', 'Loop + In', 'Loop'], { hint: 'What the wet channel processes; only matters with both channels on.' }),
    toggle('t3', 'MICRO-LOOPER', 23, 2, ['Burst', 'Radio', 'Mask']),

    knob('k7', 'CROSS', 24, 0, { hint: 'Modulation of pitch and loudness; the source is CROSS INPUT.' }),
    knob('k8', 'BALANCE', 25, 64, { hint: 'Relative loudness of the two channels.' }),
    knob('k9', 'FADE', 26, 127, { hint: 'Micro-looper: lower values fade loops while overdubbing.' }),
    knob('k10', 'EQ', 27, 64, { hint: 'Global two-way EQ: clockwise removes lows, counter-clockwise highs.' }),
    knob('k11', 'GLUE', 28, 20, { hint: 'End-of-chain saturator / destroyer.' }),
    knob('k12', 'BLEND', 29, 0, { hint: 'Micro-looper: clean loop when routed through the wet channel.' }),
    knob('k13', 'MASTER VOLUME', 30, 64),
    toggle('h1', 'SYNC', 31, 2, ['Loop → Wet', 'No sync', 'Wet → Loop'], {
      hint: 'Left: looper synced to the wet channel. Right: wet channel synced to the looper.',
    }),
    toggle('h2', 'SPREAD', 32, 2, ['Wet only', 'Both', 'Loop only'], { hint: 'Which channel the SPREAD dip switch acts on.' }),
    toggle('h3', 'CROSS INPUT', 33, 2, ['Wet → Loop', 'Input → both', 'Loop → Wet'], { hint: 'Source of the CROSS modulation.' }),

    // Footswitch states (latching)
    dip('s1', 'LOOP', 102, 0),
    dip('s2', 'WET', 103, 1),

    ...rampingDips(['TIME', 'MODIFY (wet)', 'CLOCK', 'MODIFY (loop)', 'LENGTH', 'BOUNCE']),
    ...customizeDips(['MISO', 'SPREAD', 'DRY KILL', 'TRAILS', 'LATCH', 'HALF', 'SMOOTH', 'DRY GLUE'], {
      LATCH: 'Hold functions latch instead of being momentary.',
      HALF: 'Half loop length, like the original MOOD.',
      SMOOTH: 'CLOCK moves smoothly instead of in harmonised steps.',
      'DRY GLUE': 'GLUE also on the dry signal.',
    }),

    dip('d17', 'MIDI CLOCK', 51, 0, { offLabel: 'Ignore', onLabel: 'Follow', hint: 'Saved globally on the pedal.' }),
    dip('d18', 'RAMPING', 52, 1, { offLabel: 'Stop', onLabel: 'Run' }),
    dip('d19', 'TRUE BYPASS', 55, 0, { offLabel: 'Buffered', onLabel: 'True' }),
    toggle('h4', 'EQ PER CHANNEL', 85, 2, ['Wet only', 'Both', 'Loop only']),

    select('c1', 'Wet clock division', 53, 4, DIVISIONS, { hint: 'Saved globally on the pedal.' }),
    select('c2', 'Loop clock division', 54, 4, DIVISIONS, { hint: 'Saved globally on the pedal.' }),
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
        id: 's2',
        label: 'Wet',
        press: { type: 'toggle', control: 's2' },
        hold: { type: 'momentary', cc: 105, on: 1, off: 0, label: 'Freeze' },
      },
      {
        id: 's1',
        label: 'Loop',
        press: { type: 'toggle', control: 's1' },
        hold: { type: 'momentary', cc: 106, on: 1, off: 0, label: 'Overdub' },
      },
    ],
  },

  sections: [
    {
      id: 'alt',
      title: 'Hidden options',
      blocks: [
        { type: 'controls', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12'], columns: 3 },
        { type: 'controls', title: 'Routing', controls: ['h1', 'h2', 'h3'], columns: 3 },
        { type: 'controls', controls: ['k13', 'f1'], columns: 2 },
      ],
    },
    dipsSection(),
    {
      id: 'clock',
      title: 'Clock & global settings',
      blocks: [
        { type: 'select', control: 'c1' },
        { type: 'select', control: 'c2' },
        { type: 'controls', controls: ['d17', 'd18', 'd19', 'h4'], columns: 4 },
      ],
    },
  ],

  presets: { store: { cc: 111, minSlot: 1, maxSlot: 122 } },
  tap: { cc: 93, value: 127 },

  random: [
    { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
    { id: 'toggles', label: 'Toggles', controls: ['t1', 't2', 't3'] },
    { id: 'alt', label: 'Hidden options', controls: ['k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'k13', 'h1', 'h2', 'h3'] },
    { id: 'ramping', label: 'Ramping', controls: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'f1'] },
    {
      id: 'all',
      label: 'Everything',
      controls: [
        'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'k13', 'f1',
        't1', 't2', 't3', 'h1', 'h2', 'h3',
        'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd14', 'd15', 'd16', // not DRY KILL, TRAILS, LATCH
      ],
    },
  ],

  commands: [
    { id: 'factory-reset', label: 'Factory reset', cc: 56, value: 1, confirm: 'Reset the pedal to factory settings?' },
    {
      id: 'midi-reset',
      label: 'MIDI reset',
      cc: 110,
      value: 1,
      confirm: 'Reset MIDI settings (clock ignore off, clock divisions ¼, synth settings)?',
    },
  ],

  leds: ({ values, held, preset }) => {
    const left: LedState = held.has('s2') ? { color: 'green' } : values.s2 === 1 ? { color: 'red' } : LED_OFF;
    const right: LedState = held.has('s1') ? { color: 'red' } : values.s1 === 1 ? { color: 'green' } : LED_OFF;
    return [left, presetLed(preset), right];
  },
};
