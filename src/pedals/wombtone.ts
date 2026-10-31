import { dip, fader, knob } from '../editor/core/controls';
import type { PedalDefinition, Theme } from '../editor/core/types';
import { beatMs, CLOCK_TAP, clockControls, clockOnChange, clockSection, LED_OFF, presetLed } from './shared';

// References: docs/midi/wombtone-mkii.md, docs/midi/billy-strings-wombtone.md
// Analog phaser, 2 / 4 / 6 stages. Both versions share the old-style map (knobs, CC21 clock division,
// CC51 clock, CC93 tap, CC102 bypass); the stage toggle, wave-shape toggles, dip switches and the
// Billy Strings envelope section have no CC. The signature version listens on channel 2 and reads
// bypass as a threshold at 64, which 0 / 127 satisfy.

interface Variant {
  slug: string;
  name: string;
  storageKey: string;
  defaultChannel: number;
  released: string;
  midiReference: string;
  tagline: string;
  theme: Theme;
  rateHint: string;
}

function makeWombtone(variant: Variant): PedalDefinition {
  return {
    slug: variant.slug,
    name: variant.name,
    manufacturer: 'Chase Bliss',
    tagline: variant.tagline,
    storageKey: variant.storageKey,
    defaultChannel: variant.defaultChannel,
    midiReference: variant.midiReference,
    released: variant.released,
    theme: variant.theme,

    controls: [
      knob('k1', 'FEED', 14, 64, { hint: 'Feedback / resonance. Becomes the ramp speed on the pedal while a ramping dip is on.' }),
      knob('k2', 'VOLUME', 15, 64, { hint: 'Plenty of boost available.' }),
      knob('k3', 'MIX', 16, 64, { hint: 'Classic phasing in the middle, phase vibrato fully up.' }),
      knob('k4', 'RATE', 17, 64, { hint: variant.rateHint }),
      knob('k5', 'DEPTH', 18, 64),
      knob('k6', 'FORM', 19, 64, { hint: 'Skew of the modulation wave. Noon is symmetric.' }),
      fader('f1', 'RAMP', 20, 64),

      dip('s1', 'BYPASS', 102, 127, { on: 127 }),
      ...clockControls(120, 'phaser period'),
    ],

    face: {
      format: 'classic',
      knobs: [
        ['k1', 'k2', 'k3'],
        ['k4', 'k5', 'k6'],
      ],
      toggles: [],
      footswitches: [
        { id: 'tap', label: 'Tap', press: { type: 'tap' } },
        { id: 's1', label: 'Bypass', press: { type: 'toggle', control: 's1' } },
      ],
    },

    sections: [clockSection()],

    presets: { liveBeforeLoad: true },
    tap: CLOCK_TAP,

    random: [
      { id: 'knobs', label: 'Knobs', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
      { id: 'all', label: 'Everything', controls: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'f1'] },
    ],

    onChange: clockOnChange,

    leds: ({ values, preset }) => [
      { color: 'red', blinkMs: beatMs(values.s2) },
      presetLed(preset),
      values.s1 === 127 ? { color: 'red' } : LED_OFF,
    ],
  };
}

export const wombtonemkii = makeWombtone({
  slug: 'wombtonemkii-editor',
  name: 'Wombtone MKII',
  storageKey: 'wombtonemkii',
  defaultChannel: 6,
  released: '2016-06',
  midiReference: 'docs/midi/wombtone-mkii.md',
  tagline: 'Analog phaser with 2, 4 or 6 stages: feed, mix, rate, depth and form, tap tempo and clock divisions.',
  theme: { body: '#431819', ink: '#f1e3d0', accent: '#d9b25c', knob: '#7a2426', knobIndicator: '#f1e3d0' },
  rateHint: 'Tap tempo and MIDI clock override it.',
});

export const billystringswombtone = makeWombtone({
  slug: 'billystringswombtone-editor',
  name: 'Billy Strings Wombtone',
  storageKey: 'billystringswombtone',
  defaultChannel: 2,
  released: '2024-08',
  midiReference: 'docs/midi/billy-strings-wombtone.md',
  tagline: 'The signature Wombtone: 2, 4 or 6 stages, feed, mix, rate, depth and form, tap tempo and clock divisions.',
  theme: { body: '#1e1e1e', ink: '#6fa8a4', accent: '#e08a8c', knob: '#3a3a3a', knobIndicator: '#5e9693' },
  rateHint: 'Tap tempo and MIDI clock override it. The SLOW dip on the pedal makes the range four times slower.',
});
