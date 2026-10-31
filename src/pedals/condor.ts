import { dip, knob, toggle } from '../editor/core/controls';
import type { ControlValues, MidiMessage, PedalDefinition, Theme } from '../editor/core/types';
import { LED_OFF, presetLed } from './shared';

// References: docs/midi/condor.md, docs/midi/condor-hifi.md
// Analog EQ / preamp / filter with a drive channel. Both revisions share the CC numbers; the 2024
// HiFi changed only the value definitions. CC103 carries bypass *and* clean/drive in one message,
// so the editor keeps two switches and derives the value — CC102 is deliberately not sent.

/** CC103 values for [bypassed clean, engaged clean, bypassed drive, engaged drive]. */
type DriveValues = [number, number, number, number];

/** FREQ: about 150 Hz fully down, 1250 Hz at noon, a little over 4 kHz fully up (manual) — a curve through those points. */
export const condorFreqHz = (value: number) => Math.round(150 * Math.pow(28, Math.pow(value / 127, 0.66)));

const KNOBS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'];
const TOGGLES = ['t1', 't2', 't3'];

interface Variant {
  slug: string;
  name: string;
  storageKey: string;
  released: string;
  midiReference: string;
  tagline: string;
  theme: Theme;
  /** What the manual documents for CC103. */
  drive: DriveValues;
  bassHint: string;
}

function makeCondor(variant: Variant): PedalDefinition {
  const driveState = (v: ControlValues): MidiMessage[] => {
    const engaged = v.s1 === 1;
    const drive = v.s2 === 1;
    const value = variant.drive[(drive ? 2 : 0) + (engaged ? 1 : 0)];
    return [{ type: 'cc', cc: 103, value }];
  };

  return {
    slug: variant.slug,
    name: variant.name,
    manufacturer: 'Chase Bliss',
    tagline: variant.tagline,
    storageKey: variant.storageKey,
    defaultChannel: 2,
    midiReference: variant.midiReference,
    released: variant.released,
    theme: variant.theme,

    controls: [
      knob('k1', 'GAIN', 14, 20, { hint: 'The manual suggests keeping gain low and setting the level with VOLUME. Becomes the ramp speed on the pedal while a ramping dip is on.' }),
      knob('k2', 'FREQ', 15, 64, {
        hint: 'Centre frequency of the MIDS band.',
        readout: (value) => ({ from: 0, to: 127, label: `≈ ${condorFreqHz(value)} Hz` }),
      }),
      knob('k3', 'VOLUME', 16, 64),
      knob('k4', 'BASS', 17, 64, { hint: variant.bassHint }),
      knob('k5', 'MIDS', 18, 64, {
        hint: 'Parametric mids, ±18 dB. Noon is flat.',
        readout: (value) => ({ from: 0, to: 127, label: `${value >= 64 ? '+' : '−'}${Math.round((Math.abs(value - 64) / 64) * 18)} dB` }),
      }),
      knob('k6', 'LPF', 19, 127, { hint: 'Low-pass filter, fully up is open.' }),

      toggle('t1', 'BASS', 21, 2, ['Small', 'Moderate', 'Big'], { hint: 'How far the bass control reaches.' }),
      toggle('t2', 'MIDS', 22, 2, ['Wide', 'Focused', 'Narrow'], { hint: 'Width of the mids band.' }),
      toggle('t3', 'LPF', 23, 2, ['Gentle', 'Resonant', 'Very resonant'], { hint: 'Slope and resonance of the filter.' }),

      // both footswitch states end up in CC103
      { ...dip('s1', 'BYPASS', 103, 1), cc: undefined, send: (_, v) => driveState(v) },
      { ...dip('s2', 'DRIVE', 103, 0), cc: undefined, send: (_, v) => driveState(v) },
    ],

    face: {
      format: 'classic',
      knobs: [
        ['k1', 'k2', 'k3'],
        ['k4', 'k5', 'k6'],
      ],
      toggles: TOGGLES,
      footswitches: [
        { id: 's2', label: 'Drive', press: { type: 'toggle', control: 's2' } },
        { id: 's1', label: 'Bypass', press: { type: 'toggle', control: 's1' } },
      ],
    },

    sections: [],

    presets: { liveBeforeLoad: true },

    random: [
      { id: 'knobs', label: 'Knobs', controls: KNOBS },
      { id: 'toggles', label: 'Toggles', controls: TOGGLES },
      { id: 'all', label: 'Everything', controls: [...KNOBS, ...TOGGLES] },
    ],

    // left LED: green = clean, red = drive (manual); right LED: engaged
    leds: ({ values, preset }) => [
      { color: values.s2 === 1 ? 'red' : 'green' },
      presetLed(preset),
      values.s1 === 1 ? { color: 'red' } : LED_OFF,
    ],
  };
}

export const condor = makeCondor({
  slug: 'condor-editor',
  name: 'Condor',
  storageKey: 'condor',
  released: '2017-03',
  midiReference: 'docs/midi/condor.md',
  tagline: 'Analog EQ, preamp and filter: parametric mids, bass shelf, resonant low-pass and the drive channel.',
  theme: { body: '#f3f3f1', ink: '#111111', accent: '#8e2a2a', knob: '#111111', knobIndicator: '#ffffff' },
  // 127 engaged + drive · 85 bypassed + drive · 45 engaged + clean · 0 bypassed + clean
  drive: [0, 45, 85, 127],
  bassHint: 'Boost up to 12 dB or cut. Noon is flat.',
});

export const condorhifi = makeCondor({
  slug: 'condorhifi-editor',
  name: 'Condor HiFi',
  storageKey: 'condorhifi',
  released: '2024-05',
  midiReference: 'docs/midi/condor-hifi.md',
  tagline: 'The 2024 Condor with the 30 V rail: parametric mids, bass shelf, resonant low-pass and the drive channel.',
  theme: { body: '#d6d3cc', ink: '#111111', accent: '#2a7a8c', knob: '#111111', knobIndicator: '#ffffff' },
  // four ranges: 0–29 off + clean · 30–59 on + clean · 60–89 off + dirt · 90–127 on + dirt; the centres are sent
  drive: [15, 45, 75, 110],
  bassHint: 'Boost up to 10 dB, cut up to 20 dB. Noon is flat.',
});
