import { dip, select, value } from '../editor/core/controls';
import type { Control, LedState, Option, PedalDefinition, PresetActivity, Section, SwitchControl, ValueRange } from '../editor/core/types';

export const LED_OFF: LedState = { color: 'off' };

/** Red while on; a different colour while the footswitch is held (hold function active). */
export const switchLed = (on: boolean, held: boolean, heldColor: LedState['color'] = 'green'): LedState =>
  held ? { color: heldColor } : on ? { color: 'red' } : LED_OFF;

export const RAMPING_IDS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'];
export const CUSTOMIZE_IDS = ['d9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16'];

/**
 * Left dip bank (CC61–68) of the newer pedals: six ramping targets in pedal order,
 * then SWEEP (B/T) and POLARITY (F/R). Ids d1–d8.
 */
export const rampingDips = (targets: [string, string, string, string, string, string]): SwitchControl[] => [
  ...targets.map((label, i) => dip(`d${i + 1}`, label, 61 + i)),
  dip('d7', 'SWEEP', 67, 0, { offLabel: 'B', onLabel: 'T' }),
  dip('d8', 'POLARITY', 68, 0, { offLabel: 'F', onLabel: 'R' }),
];

/** Right dip bank (CC71–78) in pedal order, ids d9–d16. Hints are keyed by label. */
export const customizeDips = (labels: string[], hints: Record<string, string> = {}): SwitchControl[] =>
  labels.map((label, i) => dip(`d${i + 9}`, label, 71 + i, 0, hints[label] ? { hint: hints[label] } : {}));

export const dipsSection = (customize = CUSTOMIZE_IDS): Section => ({
  id: 'dips',
  title: 'Dip switches',
  blocks: [{ type: 'dips', banks: [{ title: 'Ramping', controls: RAMPING_IDS }, { title: 'Customize', controls: customize }] }],
});

/** Middle LED: preset activity, the same on all Chase Bliss pedals covered here. */
export function presetLed(preset: PresetActivity): LedState {
  switch (preset.kind) {
    case 'live':
      return LED_OFF;
    case 'toggle':
      return { color: preset.slot === 2 ? 'green' : 'red' };
    case 'recall':
      return { color: preset.flip ? 'green' : 'red' };
    case 'store':
      return { color: 'amber', flash: preset.at };
  }
}

/** Blink period for an LED that pulses on every beat. */
export const beatMs = (bpm: number) => (bpm > 0 ? Math.round(60000 / bpm) : undefined);

/**
 * LED blink period that follows a time knob. Empirical formula from the 2023
 * editors ("found out by ear"): ~23.8 ms per knob step. Visual only.
 */
export const knobBlinkMs = (v: number) => Math.max(80, Math.round((476.66 * v) / 20));

/** Stepped CLOCK knob (CC18) of MOOD MKII and BAD MOOD: sample rate in kHz. */
export const STEPPED_CLOCK: ValueRange[] = [
  { from: 0, to: 4, label: '2k' },
  { from: 5, to: 16, label: '3k' },
  { from: 17, to: 28, label: '4k' },
  { from: 29, to: 40, label: '6k' },
  { from: 41, to: 53, label: '8k' },
  { from: 54, to: 69, label: '12k' },
  { from: 70, to: 83, label: '16k' },
  { from: 84, to: 95, label: '24k' },
  { from: 96, to: 109, label: '32k' },
  { from: 110, to: 121, label: '48k' },
  { from: 122, to: 127, label: '64k' },
];

/** Ramping waveform knob (CC25) on the newer pedals; images live in each pedal's asset folder. */
export const RAMP_WAVEFORMS: ValueRange[] = [
  { from: 0, to: 14, label: 'Triangle', image: 'waveform-0-14.png' },
  { from: 15, to: 54, label: 'Square', image: 'waveform-15-54.png' },
  { from: 55, to: 80, label: 'Sine', image: 'waveform-55-80.png' },
  { from: 81, to: 126, label: 'Random', image: 'waveform-81-126.png' },
  { from: 127, to: 127, label: 'Smooth random', image: 'waveform-127.png' },
];

// ---------------------------------------------------------------------------
// Tap tempo + MIDI clock of the older analog pedals (Warped Vinyl MKII / HiFi, Gravitas):
// CC21 note divisions 0–5, CC51 clock ignore (0 ignore, 127 listen), CC93 tap, no toggle CCs.

export const NOTE_DIVISIONS_SIX: Option[] = [
  { value: 0, label: 'Whole' },
  { value: 1, label: 'Half' },
  { value: 2, label: '1/4 triplet' },
  { value: 3, label: 'Quarter' },
  { value: 4, label: 'Eighth' },
  { value: 5, label: 'Sixteenth' },
];

/** Tempo value (s2), note division (s3) and clock listen (s4). `period` names what one division spans. */
export const clockControls = (tempo: number, period: string): Control[] => [
  value('s2', 'Tempo', tempo, { min: 20, max: 300 }),
  select('s3', 'MIDI clock division', 21, 3, NOTE_DIVISIONS_SIX, { hint: `Notes per ${period} when following MIDI clock.` }),
  dip('s4', 'MIDI CLOCK', 51, 127, { on: 127, offLabel: 'Ignore', onLabel: 'Listen' }),
];

export const clockSection = (): Section => ({
  id: 'clock',
  title: 'Ramp & clock',
  blocks: [
    { type: 'controls', controls: ['f1', 's4'], columns: 2 },
    { type: 'select', control: 's3' },
  ],
});

export const CLOCK_TAP = { cc: 93, value: 127, bpmControl: 's2' } as const;

/** A clock division only has an effect while the pedal listens to MIDI clock. */
export const clockOnChange: PedalDefinition['onChange'] = (id, _value, v) => (id === 's3' && v.s4 !== 127 ? { s4: 127 } : undefined);
