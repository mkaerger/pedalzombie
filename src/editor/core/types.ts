/**
 * The contract every pedal definition fulfils. A pedal is pure data plus a few
 * optional hooks — the editor engine and UI know nothing about specific pedals.
 *
 * Control ids (k1, t1, d9, …) are part of the persisted preset format of the
 * 2023 editors and must stay stable, otherwise saved app presets stop loading.
 */

export type MidiMessage =
  | { type: 'cc'; cc: number; value: number }
  | { type: 'pc'; program: number };

export type ControlValues = Record<string, number>;

/** A value range with a human readable meaning, e.g. "0–4 → 4x Reverse". */
export interface ValueRange {
  from: number;
  to: number;
  label: string;
  /** Optional image (path relative to the pedal's asset folder). */
  image?: string;
}

export interface Option {
  value: number;
  label: string;
  hint?: string;
}

interface ControlBase {
  id: string;
  label: string;
  /** CC number this control sends on. Omit when `send` derives the messages. */
  cc?: number;
  default: number;
  hint?: string;
  /**
   * Overrides the default "send value on `cc`" behaviour, e.g. MOOD's CC103
   * which encodes two footswitches in one value.
   */
  send?: (value: number, values: ControlValues) => MidiMessage[];
  /**
   * `false` for transient state the editor must not replay (sync, reset, presets):
   * e.g. a button whose CC *toggles* the pedal, or the looper transport.
   */
  sync?: false;
}

export interface KnobControl extends ControlBase {
  kind: 'knob';
  /** Label depending on other controls, e.g. GEN LOSS classic mode. */
  labelFor?: (values: ControlValues) => string | undefined;
  min?: number;
  max?: number;
  /** Secondary label depending on other controls, e.g. "(DELAY TIME)". */
  detail?: (values: ControlValues) => string | undefined;
  /** Readout of the current value, e.g. tape model or speed. */
  readout?: (value: number, values: ControlValues) => ValueRange | undefined;
}

export interface FaderControl extends ControlBase {
  kind: 'fader';
  min?: number;
  max?: number;
}

/** 2- or 3-position lever switch. */
export interface ToggleControl extends ControlBase {
  kind: 'toggle';
  options: Option[];
}

/** On/off switch: dip switches, latching footswitch states, settings. */
export interface SwitchControl extends ControlBase {
  kind: 'switch';
  off: number;
  on: number;
  offLabel?: string;
  onLabel?: string;
}

/** One-of-many choice, e.g. clock divisions. */
export interface SelectControl extends ControlBase {
  kind: 'select';
  options: Option[];
}

/** Value that is stored in presets but has no widget of its own (footswitch states, tempo). */
export interface ValueControl extends ControlBase {
  kind: 'value';
  min?: number;
  max?: number;
}

export type Control =
  | ValueControl
  | KnobControl
  | FaderControl
  | ToggleControl
  | SwitchControl
  | SelectControl;

export type ControlKind = Control['kind'];

// ---------------------------------------------------------------------------
// Footswitches and LEDs

export type LedColor = 'off' | 'red' | 'green' | 'amber' | 'blue';

export interface LedState {
  color: LedColor;
  /** Blink period in ms, e.g. derived from a tempo. */
  blinkMs?: number;
  /** Dimmed, e.g. "preset was modified". */
  dim?: boolean;
  /** Flash briefly whenever this key changes (e.g. the timestamp of a store). */
  flash?: number;
}

/** Transient UI state the LED function may use besides the control values. */
export interface LedContext {
  values: ControlValues;
  /** Footswitch ids currently held down (hold action active). */
  held: ReadonlySet<string>;
  /** Last preset activity on the pedal. */
  preset: PresetActivity;
  /** Current tempo from tap tempo, if any. */
  tapBpm?: number;
}

export type PresetActivity =
  | { kind: 'live' }
  | { kind: 'toggle'; slot: 1 | 2 }
  | { kind: 'recall'; slot: number; flip: boolean }
  | { kind: 'store'; slot: number; at: number };

export type FootswitchAction =
  /** Flip a switch control (sends its on/off value). */
  | { type: 'toggle'; control: string }
  /** Send `on` while held, `off` on release. */
  | { type: 'momentary'; cc: number; on: number; off: number; enabled?: (values: ControlValues) => boolean }
  /** Register a tap (see `PedalDefinition.tap`). */
  | { type: 'tap' }
  /** Run one of `PedalDefinition.commands` (one-shot CC), e.g. a looper's STOP. */
  | { type: 'command'; id: string };

export interface Footswitch {
  id: string;
  label: string;
  /** Short press. */
  press: FootswitchAction;
  /** Long press (≥ 600 ms). */
  hold?: FootswitchAction & { label: string };
}

// ---------------------------------------------------------------------------
// Layout

export type LayoutBlock =
  | { type: 'controls'; title?: string; controls: string[]; columns?: number }
  | { type: 'dips'; title?: string; banks: { title: string; controls: string[] }[] }
  | { type: 'select'; title?: string; control: string }
  /** Buttons for some of `PedalDefinition.commands`, e.g. a looper transport. */
  | { type: 'commands'; title?: string; commands: string[] }
  | { type: 'custom'; title?: string; component: string };

export interface Section {
  id: string;
  title: string;
  blocks: LayoutBlock[];
}

export interface RandomGroup {
  id: string;
  label: string;
  controls: string[];
}

export interface Theme {
  /** Pedal enclosure colour. */
  body: string;
  /** Text / print on the enclosure. */
  ink: string;
  /** Accent for active elements. */
  accent: string;
  knob: string;
  knobIndicator: string;
}

export interface PedalDefinition {
  /** URL slug, also the page path (kept from the 2023 site). */
  slug: string;
  name: string;
  manufacturer: string;
  tagline: string;
  /** localStorage namespace of the 2023 editor — never change. */
  storageKey: string;
  defaultChannel: number;
  /** Link to the MIDI reference in docs/midi. */
  midiReference: string;
  /** Release of the pedal as `YYYY-MM`; the home page lists the newest first. */
  released: string;
  theme: Theme;

  controls: Control[];

  /** The pedal face: main knobs (rows), toggles, footswitches. */
  face: {
    knobs: string[][];
    toggles: string[];
    /** Footswitches left → right; the preset toggle sits between them. */
    footswitches: [Footswitch, Footswitch];
    /** A toggle control rendered between the footswitches instead of the preset toggle. */
    centerToggle?: string;
    /** Switch controls rendered as push buttons on the pedal's edge (Blooper's modifier buttons). */
    buttons?: string[];
  };
  /** Further panels below the pedal face (alt controls, dips, …). */
  sections: Section[];

  presets: {
    /** How "store on pedal" works. Omit if the pedal cannot save via MIDI alone. */
    store?: { cc: number; minSlot: number; maxSlot: number };
    /** Send PC 0 (live) before applying an app preset. */
    liveBeforeLoad?: boolean;
    /** `false` when the pedal has no preset toggle / live state (PC 0 is a slot then). */
    toggle?: boolean;
    /** Slots recalled by program change; default 1–122 with PC = slot. */
    recall?: { first: number; last: number; program: (slot: number) => number; label?: string };
    /** How to save on the pedal when there is no save CC. */
    manualStoreHint?: string;
  };

  /** Tap tempo. */
  tap?: {
    cc: number;
    value: number;
    /**
     * `value` control holding the tempo in BPM. When set, the tempo is part of
     * presets and is sent to the pedal as two taps one beat apart.
     */
    bpmControl?: string;
  };

  /** Named value sets ("ideas") applied with one click, e.g. HABIT modifiers. */
  ideas?: { title: string; items: { label: string; image?: string; values: ControlValues }[] }[];

  /** Theme override depending on values, e.g. classic mode. */
  themeFor?: (values: ControlValues) => Partial<Theme> | undefined;

  /** Randomize buttons. */
  random: RandomGroup[];

  /** One-shot commands. With `confirm` the UI asks first (factory reset); without it fires immediately (retrigger). */
  commands?: {
    id: string;
    label: string;
    cc: number;
    value: number;
    confirm?: string;
    /** Editor state after the command (no MIDI sent), e.g. "stopped" for the LEDs. */
    then?: ControlValues;
  }[];

  /** Derived LED colours [left, middle, right]. */
  leds: (ctx: LedContext) => [LedState, LedState, LedState];
  /** LEDs of `face.buttons`, in the same order. */
  buttonLeds?: (ctx: LedContext) => LedState[];

  /**
   * Called after a control changed (by the user, a preset or randomize).
   * Returns follow-up value changes, e.g. HABIT/MOOD rules between controls.
   */
  onChange?: (id: string, value: number, values: ControlValues) => ControlValues | undefined;
}
