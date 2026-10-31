import type {
  ArcadeControl,
  ArcadeOption,
  Control,
  ControlValues,
  Face,
  FaderControl,
  KnobControl,
  MidiMessage,
  Option,
  PedalDefinition,
  SelectControl,
  SwitchControl,
  ToggleControl,
  ValueControl,
  ValueRange,
} from './types';

// ---------------------------------------------------------------------------
// Builders — keep pedal definitions short and readable

type Rest<T> = Omit<T, 'kind' | 'id' | 'label' | 'cc' | 'default'>;

export const knob = (id: string, label: string, cc: number, def: number, rest: Rest<KnobControl> = {}): KnobControl =>
  ({ kind: 'knob', id, label, cc, default: def, ...rest });

export const fader = (id: string, label: string, cc: number, def: number, rest: Rest<FaderControl> = {}): FaderControl =>
  ({ kind: 'fader', id, label, cc, default: def, ...rest });

/**
 * Arcade button with one LED colour per state. Values count up from `first`:
 * 1 on CXM 1978 / Preamp MKII (the manuals document 1, 2, 3 only), 0 on Big Time.
 */
export const arcade = (
  id: string,
  label: string,
  cc: number,
  def: number,
  states: Omit<ArcadeOption, 'value'>[],
  { first = 1, ...rest }: Omit<Rest<ArcadeControl>, 'options'> & { first?: number } = {},
): ArcadeControl =>
  ({ kind: 'arcade', id, label, cc, default: def, options: states.map((s, i) => ({ ...s, value: first + i })), ...rest });

/** Lever switch with the Chase Bliss convention 1 = left, 2 = middle, 3 = right. */
export const toggle = (id: string, label: string, cc: number, def: number, labels: string[], rest: Omit<Rest<ToggleControl>, 'options'> = {}): ToggleControl =>
  ({ kind: 'toggle', id, label, cc, default: def, options: labels.map((l, i) => ({ value: i + 1, label: l })), ...rest });

export const dip = (id: string, label: string, cc: number, def = 0, rest: Partial<Rest<SwitchControl>> = {}): SwitchControl =>
  ({ kind: 'switch', id, label, cc, default: def, off: 0, on: 1, ...rest });

export const select = (id: string, label: string, cc: number, def: number, options: Option[], rest: Omit<Rest<SelectControl>, 'options'> = {}): SelectControl =>
  ({ kind: 'select', id, label, cc, default: def, ...rest, options });

export const value = (id: string, label: string, def: number, rest: Partial<Rest<ValueControl>> & { cc?: number } = {}): ValueControl =>
  ({ kind: 'value', id, label, default: def, ...rest });

/** Look up the range a value falls into. */
export const rangeOf = (ranges: ValueRange[], v: number) => ranges.find((r) => v >= r.from && v <= r.to);

// ---------------------------------------------------------------------------
// Value helpers

/** Controls that pick one of several options. */
export const hasOptions = (c: Control): c is ToggleControl | SelectControl | ArcadeControl =>
  c.kind === 'toggle' || c.kind === 'select' || c.kind === 'arcade';

export function bounds(c: Control): [number, number] {
  switch (c.kind) {
    case 'toggle':
    case 'select':
    case 'arcade': {
      const vs = c.options.map((o) => o.value);
      return [Math.min(...vs), Math.max(...vs)];
    }
    case 'switch':
      return [Math.min(c.off, c.on), Math.max(c.off, c.on)];
    default:
      return [c.min ?? 0, c.max ?? 127];
  }
}

/** Coerce anything (legacy presets store strings) into a valid value, or undefined. */
export function coerce(c: Control, raw: unknown): number | undefined {
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(n)) return undefined;
  if (hasOptions(c)) {
    return c.options.some((o) => o.value === n) ? n : undefined;
  }
  if (c.kind === 'switch') {
    // legacy presets store 0/1 for on/off, or a knob value where the pedal uses a threshold (GEN LOSS CC26)
    if (n === c.off || n === 0) return c.off;
    if (n === c.on || n === 1) return c.on;
    return n >= (c.on + c.off) / 2 ? c.on : c.off;
  }
  const [lo, hi] = bounds(c);
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

export function messagesFor(c: Control, v: number, values: ControlValues): MidiMessage[] {
  if (c.send) return c.send(v, values);
  if (c.cc === undefined) return [];
  return [{ type: 'cc', cc: c.cc, value: v }];
}

export function defaults(pedal: PedalDefinition): ControlValues {
  return Object.fromEntries(pedal.controls.map((c) => [c.id, c.default]));
}

export function controlMap(pedal: PedalDefinition): Map<string, Control> {
  return new Map(pedal.controls.map((c) => [c.id, c]));
}

export type Rng = () => number;

export function randomValue(c: Control, rng: Rng): number {
  if (hasOptions(c)) {
    return c.options[Math.floor(rng() * c.options.length)].value;
  }
  if (c.kind === 'switch') return rng() < 0.5 ? c.off : c.on;
  const [lo, hi] = bounds(c);
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/** Every control id placed on the pedal face, whatever its format. */
export function faceControlIds(face: Face): string[] {
  const toggles = face.footswitches.flatMap((f) => [f.press, f.hold].flatMap((a) => (a?.type === 'toggle' ? [a.control] : [])));
  if (face.format === 'classic') {
    return [...face.knobs.flat(), ...face.toggles, ...(face.centerToggle ? [face.centerToggle] : []), ...(face.buttons ?? []), ...toggles];
  }
  const alt = face.alt ? [...face.alt.faders, ...face.alt.buttons].filter((id): id is string => id !== null) : [];
  return [...face.faders, ...face.buttons, ...alt, ...toggles];
}
