import { arcade, dip } from '../editor/core/controls';
import type { Footswitch, LedState, PedalDefinition, PresetActivity } from '../editor/core/types';
import { LED_OFF } from './shared';

/**
 * Shared pieces of the Automatone pedals (Preamp MKII, CXM 1978, Big Time):
 * motorized faders on CC14–19, arcade buttons on CC22–26, bypass on CC102,
 * presets saved with CC27 = slot and recalled with PC = slot, no live state.
 */

/** Bypass on CC102: 0 = bypassed, 1 (or more) = engaged. Engaged by default. */
export const bypass = () => dip('s1', 'BYPASS', 102, 1);

/** The JUMP button of CXM 1978 and Preamp MKII: the PRESET switch jumps to preset 0 or 5 of the bank. */
export const jumpButton = () =>
  arcade(
    'b1',
    'JUMP',
    22,
    1,
    [
      { label: 'Off', led: 'off' },
      { label: '0', led: 'blue' },
      { label: '5', led: 'red' },
    ],
    { hint: 'When on, the PRESET footswitch jumps to preset 0 or 5 of the current bank. Saved per preset.' },
  );

// ---------------------------------------------------------------------------
// 30 presets in 3 banks × 10 (CXM 1978, Preamp MKII)

export const BANKS = 3;
export const BANK_SIZE = 10;

export const bankOf = (slot: number) => Math.floor(slot / BANK_SIZE);

export const describeSlot = (slot: number) => `Bank ${bankOf(slot) + 1} · preset ${slot % BANK_SIZE}`;

/** Next preset within the current bank, wrapping at 9 → 0. Before any recall: preset 0. */
export const nextPreset = (current: number | undefined) =>
  current === undefined ? 0 : bankOf(current) * BANK_SIZE + ((current + 1) % BANK_SIZE);

/** Same preset number in the next bank, wrapping at bank 3 → 1. */
export const nextBank = (current: number | undefined) => (current === undefined ? 0 : (current + BANK_SIZE) % (BANKS * BANK_SIZE));

export const bankPresets = (): PedalDefinition['presets'] => ({
  toggle: false,
  store: { cc: 27, minSlot: 0, maxSlot: BANKS * BANK_SIZE - 1 },
  recall: { first: 0, last: BANKS * BANK_SIZE - 1, program: (slot) => slot, label: 'Preset', format: describeSlot },
});

/** PRESET (hold: next bank) and BYPASS (hold: save to the current preset) footswitches. */
export const bankFootswitches = (): [Footswitch, Footswitch] => [
  {
    id: 'preset',
    label: 'Preset',
    press: { type: 'recall', slot: nextPreset },
    hold: { type: 'recall', slot: nextBank, label: 'Bank' },
  },
  {
    id: 'bypass',
    label: 'Bypass',
    press: { type: 'toggle', control: 's1' },
    hold: { type: 'store-current', label: 'Save' },
  },
];

/** BANK LED: off = bank 1, red = bank 2, green = bank 3; unknown until a preset was recalled. */
export function bankLed(preset: PresetActivity): LedState {
  if (preset.kind !== 'recall' && preset.kind !== 'store') return LED_OFF;
  const colour = (['off', 'red', 'green'] as const)[bankOf(preset.slot)] ?? 'off';
  return preset.kind === 'store' ? { color: colour, flash: preset.at } : { color: colour };
}

/** ACTIVE LED: lit while the pedal is engaged. Red in unbalanced mode, green in balanced mode. */
export const activeLed = (engaged: boolean, balanced = false): LedState => (engaged ? { color: balanced ? 'green' : 'red' } : LED_OFF);
