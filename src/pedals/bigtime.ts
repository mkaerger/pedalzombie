import { arcade, dip, fader, select } from '../editor/core/controls';
import type { ControlValues, FootswitchAction, MidiMessage, PedalDefinition } from '../editor/core/types';
import { activeLed, bypass } from './automatone';
import { LED_OFF } from './shared';

// Reference: docs/midi/big-time.md
// Big Time (Chase Bliss × Electronic Audio Experiments): analog/digital hybrid echo with an alt
// layer (SHIFT), an options menu, MIDI clock in/out and a looper mode. 127 preset slots.
// The footswitches and CC102/103/106 change meaning in LOOP mode.

const MODE = { mod: 0, short: 1, long: 2, loop: 3 } as const;
const inLoop = (v: ControlValues) => v.b3 === MODE.loop;
const inMod = (v: ControlValues) => v.b3 === MODE.mod;

/** Tap subdivisions on CC54, in manual order. */
export const SUBDIVISIONS = [
  'Sixteenth',
  'Eighth triplet',
  'Dotted sixteenth',
  'Eighth',
  'Quarter triplet',
  'Dotted eighth',
  'Quarter',
  'Half triplet',
  'Dotted quarter',
  'Half',
  'Whole triplet',
  'Dotted half',
].map((label, value) => ({ value, label }));

const FADERS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
const ALT_FADERS = ['f7', 'f8', 'f9', 'f10', 'f11', 'f12'];
const BUTTONS = ['b1', 'b2', 'b3', 'b4', 'b5'];
const ALT_BUTTONS = ['b6', 'b7', 'b8', 'b9'];

const twoState = (id: string, label: string, cc: number, onLabel: string, hint?: string) =>
  arcade(id, label, cc, 0, [{ label: 'Normal', led: 'off' }, { label: onLabel, led: 'blue' }], { first: 0, hint });

const option = (id: string, label: string, cc: number, hint?: string) => dip(id, label, cc, 0, { offLabel: 'Off', onLabel: 'On', hint });

/** Left footswitch: tap tempo in the delay modes, motion on/off in MOD, record / play / dub in LOOP. */
const leftPress = (v: ControlValues): FootswitchAction =>
  inLoop(v) ? { type: 'command', id: 'rec-play-dub' } : inMod(v) ? { type: 'command', id: 'motion-engage' } : { type: 'tap' };

export const bigtime: PedalDefinition = {
  slug: 'bigtime-editor',
  name: 'Big Time',
  manufacturer: 'Chase Bliss',
  tagline: 'Hybrid echo with a limiter in the loop: cluster taps, motion, scales, voicings, the alt layer, options menu and looper.',
  storageKey: 'bigtime',
  defaultChannel: 2,
  midiReference: 'docs/midi/big-time.md',
  released: '2026-04',
  theme: { body: '#3b3e44', ink: '#e9e9ec', accent: '#7fb6ff', knob: '#a7abb1', knobIndicator: '#25272b' },

  controls: [
    fader('f1', 'COLOR', 14, 40, { hint: 'Preamp gain into the delay line: more saturation, more limiter.' }),
    fader('f2', 'TIME', 15, 64, { hint: 'Delay time. Range from MODE, stepping from SCALE.' }),
    fader('f3', 'CLUSTER', 16, 0, { hint: 'Blends in additional delay taps, then diffusion.' }),
    fader('f4', 'TILT EQ', 17, 64, {
      hint: 'Up cuts lows, down cuts highs, centre is flat.',
      readout: (value) => ({ from: 0, to: 127, label: value === 64 ? 'Flat' : value > 64 ? 'Cuts lows' : 'Cuts highs' }),
    }),
    fader('f5', 'FEEDBACK', 18, 40, { hint: 'Gain of the feedback loop.' }),
    fader('f6', 'WET', 19, 64, { hint: 'Output level of the effect.' }),

    // alt layer (SHIFT)
    fader('f7', 'TEXTURE', 32, 64, { hint: 'Character of the STATE: aliasing (Digital), amount (Compressed), clipping symmetry (Saturated), misbias (#!&%).' }),
    fader('f8', 'RATE', 33, 64, { hint: 'MOTION speed; glide time for ENV and STEP.' }),
    fader('f9', 'DEPTH', 34, 64, { hint: 'MOTION range; the harmonic interval when a scale is on.' }),
    fader('f10', 'CROSSOVER', 35, 64, { hint: 'Split frequency of the TILT EQ.' }),
    fader('f11', 'DIFFUSE', 36, 0, { hint: 'Diffusion amount.' }),
    fader('f12', 'DRY', 37, 127, { hint: 'Dry output level.' }),

    arcade(
      'b1',
      'SCALE',
      22,
      0,
      [
        { label: 'Off', led: 'off' },
        { label: 'Chromatic', led: 'blue' },
        { label: 'Oct+4+5', led: 'red' },
        { label: 'Octave', led: 'purple' },
      ],
      { first: 0, hint: 'How TIME and MOTION respond: smoothly or in tuned steps.' },
    ),
    arcade(
      'b2',
      'MOTION',
      23,
      0,
      [
        { label: 'Off', led: 'off' },
        { label: 'Sine', led: 'blue' },
        { label: 'Square', led: 'red' },
        { label: 'Env', led: 'purple' },
      ],
      { first: 0, hint: 'Modulation type. Speed and range are RATE and DEPTH in the alt layer.' },
    ),
    arcade(
      'b3',
      'MODE',
      24,
      MODE.short,
      [
        { label: 'Mod', led: 'off', hint: '3–46 ms' },
        { label: 'Short', led: 'blue', hint: '46–736 ms' },
        { label: 'Long', led: 'red', hint: '736 ms – 12.2 s' },
        { label: 'Loop', led: 'purple', hint: 'Looper, 12 s – 3.2 min' },
      ],
      { first: 0, hint: 'Range of the delay and behaviour of the footswitches.' },
    ),
    arcade(
      'b4',
      'VOICING',
      25,
      0,
      [
        { label: 'HiFi', led: 'off' },
        { label: 'Focus', led: 'blue' },
        { label: 'Warm', led: 'red' },
        { label: 'Analog', led: 'purple' },
      ],
      { first: 0, hint: 'Core tone, independent of TILT EQ.' },
    ),
    arcade(
      'b5',
      'STATE',
      26,
      0,
      [
        { label: 'Digital', led: 'off' },
        { label: 'Compressed', led: 'blue' },
        { label: 'Saturated', led: 'red' },
        { label: '#!&%', led: 'purple' },
      ],
      { first: 0, hint: 'Role of the limiter. TEXTURE in the alt layer tunes each state.' },
    ),

    arcade(
      'b6',
      'SPREAD',
      38,
      0,
      [
        { label: 'Off', led: 'off' },
        { label: 'Wide', led: 'blue', hint: 'Offsets CLUSTER and MOTION between the channels' },
        { label: 'Ping-pong', led: 'red' },
      ],
      { first: 0, hint: 'Stereo behaviour (MOTION alt).' },
    ),
    twoState('b7', '0.5X', 39, '0.5x', 'Half the sample rate at 12 bit (MODE alt).'),
    twoState('b8', 'DIFFUSE TYPE', 40, 'Double', 'Diffusion type (VOICING alt).'),
    twoState('b9', '+12 dB', 41, '+12 dB', 'Preamp boost (STATE alt).'),

    // options menu
    option('o1', 'PLAY / DUB', 42, 'What a tap on the left switch does while a loop plays.'),
    option('o2', 'SCALE IGNORE', 43),
    option('o3', 'STEP', 44, 'Stepped motion.'),
    option('o4', 'TRAILS', 45, 'Delay trails ring out when bypassed.'),
    option('o5', 'DRY KILL', 46),
    option('o6', 'DRY CLEAN', 47, 'Dry signal skips the preamp.'),
    dip('o7', 'I/O', 48, 0, { offLabel: 'Balanced', onLabel: 'Unbalanced', hint: 'Matches the bypass LED: green balanced, red unbalanced.' }),

    select('c1', 'Tap subdivision', 54, 6, SUBDIVISIONS),
    select(
      'c2',
      'MIDI clock',
      110,
      0,
      [
        { value: 0, label: 'No clock' },
        { value: 1, label: 'Clock in' },
        { value: 2, label: 'Clock out', hint: 'The MIDI OUT jack sends clock instead of thru, 60–240 BPM' },
      ],
      { hint: 'Not available in MOD mode.' },
    ),
    select(
      'c3',
      'MIDI notes',
      112,
      0,
      [
        { value: 0, label: 'Off' },
        { value: 1, label: 'Channel' },
        { value: 2, label: 'Global' },
      ],
      { hint: 'Responds to MIDI notes on the pedal’s channel or on all channels. The manual does not explain more.' },
    ),

    // CC102 is play / stop in LOOP mode — the bypass switch stays quiet there, see the looper commands
    {
      ...bypass(),
      send: (value, v): MidiMessage[] => (inLoop(v) ? [] : [{ type: 'cc', cc: 102, value }]),
    },
  ],

  face: {
    format: 'automatone',
    faders: FADERS,
    buttons: BUTTONS,
    alt: { faders: ALT_FADERS, buttons: [null, ...ALT_BUTTONS] },
    footswitches: [
      {
        id: 'tempo',
        label: 'Tempo',
        labelFor: (v) => (inLoop(v) ? 'Rec / Play / Dub' : inMod(v) ? 'Motion' : undefined),
        press: { type: 'by', action: leftPress },
      },
      {
        id: 'bypass',
        label: 'Bypass',
        labelFor: (v) => (inLoop(v) ? 'Play / Stop' : undefined),
        press: { type: 'by', action: (v) => (inLoop(v) ? { type: 'command', id: 'play-stop' } : { type: 'toggle', control: 's1' }) },
        hold: {
          type: 'by',
          action: (v) => (inLoop(v) ? { type: 'command', id: 'delete' } : { type: 'momentary', cc: 106, on: 1, off: 0 }),
          label: 'Hold',
          labelFor: (v) => (inLoop(v) ? 'Delete' : undefined),
        },
      },
    ],
    ledLabels: ['Preset', 'Bypass'],
  },

  sections: [
    {
      id: 'alt',
      title: 'Alt layer (SHIFT)',
      blocks: [
        { type: 'controls', controls: ALT_FADERS, columns: 3 },
        { type: 'controls', controls: ALT_BUTTONS, columns: 4 },
      ],
    },
    {
      id: 'clock',
      title: 'Tempo & clock',
      blocks: [
        { type: 'select', control: 'c1' },
        { type: 'select', control: 'c2' },
      ],
    },
    {
      id: 'looper',
      title: 'Looper (LOOP mode)',
      blocks: [
        { type: 'commands', commands: ['rec-play-dub', 'play-stop', 'record', 'play', 'stop', 'delete'] },
        { type: 'controls', controls: ['o1'], columns: 2 },
      ],
    },
    {
      id: 'options',
      title: 'Options menu',
      blocks: [{ type: 'controls', controls: ['o2', 'o3', 'o4', 'o5', 'o6', 'o7'], columns: 3 }],
    },
    {
      id: 'midi',
      title: 'MIDI',
      blocks: [
        { type: 'select', control: 'c3' },
        { type: 'commands', title: 'Save on the pedal', commands: ['save-current'] },
      ],
    },
  ],

  presets: {
    toggle: false,
    // "127 total slots" — whether PC 127 is one of them is not documented, so 0–126
    store: { cc: 27, minSlot: 0, maxSlot: 126 },
    recall: { first: 0, last: 126, program: (slot) => slot, label: 'Preset' },
  },

  tap: { cc: 103, value: 127 },

  random: [
    { id: 'faders', label: 'Faders', controls: FADERS },
    { id: 'buttons', label: 'Buttons', controls: ['b1', 'b2', 'b4', 'b5'] },
    { id: 'alt', label: 'Alt layer', controls: [...ALT_FADERS, ...ALT_BUTTONS] },
    { id: 'all', label: 'Everything', controls: [...FADERS, 'b1', 'b2', 'b4', 'b5', ...ALT_FADERS, ...ALT_BUTTONS] },
  ],

  commands: [
    { id: 'motion-engage', label: 'Motion on / off', cc: 103, value: 127, enabled: inMod, hint: 'MOD mode: what the left footswitch does.' },
    { id: 'rec-play-dub', label: 'Rec / Play / Dub', cc: 103, value: 127, enabled: inLoop, hint: 'The left footswitch in LOOP mode.' },
    { id: 'play-stop', label: 'Play / Stop', cc: 102, value: 127, enabled: inLoop, hint: 'The right footswitch in LOOP mode.' },
    { id: 'record', label: 'Record', cc: 104, value: 127, enabled: inLoop },
    { id: 'play', label: 'Play', cc: 105, value: 127, enabled: inLoop },
    { id: 'stop', label: 'Stop', cc: 107, value: 127, enabled: inLoop },
    { id: 'delete', label: 'Delete loop', cc: 106, value: 127, enabled: inLoop, confirm: 'Delete the loop on the pedal?' },
    { id: 'save-current', label: 'Save to current slot', cc: 28, value: 127, confirm: 'Overwrite the preset slot the pedal is on?', hint: 'For when the editor does not know which slot the pedal is on.' },
  ],

  leds: ({ values, preset }) => [
    preset.kind === 'store' ? { color: 'green', flash: preset.at } : LED_OFF,
    activeLed(values.s1 === 1, values.o7 === 0),
  ],
};
