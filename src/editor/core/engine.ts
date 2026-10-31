import { coerce, controlMap, defaults, messagesFor, randomValue, type Rng } from './controls';
import { TapTempo } from './tapTempo';
import type {
  Control,
  ControlValues,
  Footswitch,
  FootswitchAction,
  MidiMessage,
  PedalDefinition,
  PresetActivity,
} from './types';

/** Where MIDI goes. The channel is resolved by the implementation. */
export interface MidiSink {
  send(msg: MidiMessage): void;
}

export interface EngineState {
  values: ControlValues;
  held: ReadonlySet<string>;
  preset: PresetActivity;
  tapBpm?: number;
}

type Cancel = () => void;

export interface EngineOptions {
  now?: () => number;
  rng?: Rng;
  schedule?: (fn: () => void, ms: number) => Cancel;
  /** Press duration that counts as "hold". */
  holdMs?: number;
  /** Semantic user actions (randomize, preset_load, footswitch, …) for analytics. */
  onEvent?: (name: string, params?: Record<string, string | number>) => void;
}

const defaultSchedule = (fn: () => void, ms: number): Cancel => {
  const id = setTimeout(fn, ms);
  return () => clearTimeout(id);
};

/** Upper bound for onChange cascades — protects against rules that ping-pong. */
const MAX_CASCADE = 32;

export class EditorEngine {
  private state: EngineState;
  private readonly listeners = new Set<() => void>();
  private readonly controls: Map<string, Control>;
  private readonly tapTempo = new TapTempo();
  private readonly presses = new Map<string, { cancel: Cancel; holding: boolean }>();
  private cancelTempo: Cancel | undefined;

  private readonly now: () => number;
  private readonly rng: Rng;
  private readonly schedule: (fn: () => void, ms: number) => Cancel;
  private readonly holdMs: number;
  private readonly onEvent: NonNullable<EngineOptions['onEvent']>;

  constructor(
    readonly pedal: PedalDefinition,
    private readonly sink: MidiSink,
    options: EngineOptions = {},
  ) {
    this.controls = controlMap(pedal);
    this.now = options.now ?? Date.now;
    this.rng = options.rng ?? Math.random;
    this.schedule = options.schedule ?? defaultSchedule;
    this.holdMs = options.holdMs ?? 600;
    this.onEvent = options.onEvent ?? (() => {});
    this.state = { values: defaults(pedal), held: new Set(), preset: { kind: 'live' } };
  }

  // -- store ----------------------------------------------------------------

  getState = (): EngineState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private update(patch: Partial<EngineState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  control(id: string): Control | undefined {
    return this.controls.get(id);
  }

  // -- values ---------------------------------------------------------------

  /** User changed a single control. */
  set(id: string, value: number) {
    if (this.controls.has(id)) this.onEvent('control_edit', { control: id });
    this.apply({ [id]: value }, 'changed');
  }

  /** Set several controls at once, e.g. an "idea". */
  setMany(values: ControlValues) {
    this.onEvent('quick_setting');
    this.apply(values, 'all');
  }

  /** Apply defaults and send everything — "reset to default". */
  reset() {
    this.onEvent('editor_defaults');
    if (this.pedal.presets.liveBeforeLoad) this.goLive();
    this.apply(defaults(this.pedal), 'all');
  }

  /** Apply an app preset (already sanitized) and send everything. */
  load(values: ControlValues) {
    this.onEvent('preset_load');
    if (this.pedal.presets.liveBeforeLoad) this.goLive();
    this.apply(values, 'all');
  }

  randomize(groupId: string) {
    const group = this.pedal.random.find((g) => g.id === groupId);
    if (!group) return;
    this.onEvent('randomize', { group: groupId });
    const values: ControlValues = {};
    for (const id of group.controls) {
      const c = this.controls.get(id);
      if (c) values[id] = randomValue(c, this.rng);
    }
    this.apply(values, 'all');
  }

  /** Push the complete current state to the pedal, e.g. after connecting. */
  sendAll() {
    this.onEvent('sync_pedal');
    this.apply(this.state.values, 'all');
  }

  /**
   * The single path for value changes: coerce, run onChange rules, commit,
   * then send MIDI once per affected control (deduplicated per CC).
   */
  private apply(changes: Record<string, number>, mode: 'changed' | 'all') {
    const values = { ...this.state.values };
    const touched: string[] = [];
    const queue = Object.entries(changes);

    for (let i = 0; i < queue.length && i < Object.keys(changes).length + MAX_CASCADE; i++) {
      const [id, raw] = queue[i];
      const control = this.controls.get(id);
      if (!control) continue;
      if (control.sync === false && mode === 'all') continue; // transient state is never replayed
      const v = coerce(control, raw);
      if (v === undefined) continue;
      if (values[id] === v && mode === 'changed') continue;
      values[id] = v;
      if (!touched.includes(id)) touched.push(id);
      const followUps = this.pedal.onChange?.(id, v, values);
      if (followUps) queue.push(...Object.entries(followUps));
    }

    if (touched.length === 0) return;
    this.update({ values });
    this.sendValues(touched, values);
  }

  private sendValues(ids: string[], values: ControlValues) {
    const ccs = new Map<number, number>();
    for (const id of ids) {
      if (id === this.pedal.tap?.bpmControl) {
        this.sendTempo(values[id]);
        continue;
      }
      for (const msg of messagesFor(this.controls.get(id)!, values[id], values)) {
        if (msg.type === 'cc') {
          ccs.delete(msg.cc); // keep insertion order of the latest value
          ccs.set(msg.cc, msg.value);
        } else {
          this.sink.send(msg);
        }
      }
    }
    ccs.forEach((value, cc) => this.sink.send({ type: 'cc', cc, value }));
  }

  // -- tempo ----------------------------------------------------------------

  tap() {
    const tap = this.pedal.tap;
    if (!tap) return;
    this.onEvent('tap');
    this.sink.send({ type: 'cc', cc: tap.cc, value: tap.value });
    const bpm = this.tapTempo.tap(this.now());
    if (bpm === undefined) return;
    const patch: Partial<EngineState> = { tapBpm: bpm };
    if (tap.bpmControl) patch.values = { ...this.state.values, [tap.bpmControl]: bpm };
    this.update(patch);
  }

  /** Set the tempo from a number input; sent as two taps one beat apart. */
  setTempo(bpm: number) {
    const id = this.pedal.tap?.bpmControl;
    if (!id) return;
    this.onEvent('set_tempo');
    this.apply({ [id]: bpm }, 'all');
  }

  private sendTempo(bpm: number) {
    const tap = this.pedal.tap;
    if (!tap || bpm <= 0) return;
    this.cancelTempo?.();
    const msg: MidiMessage = { type: 'cc', cc: tap.cc, value: tap.value };
    this.sink.send(msg);
    this.cancelTempo = this.schedule(() => this.sink.send(msg), Math.round(60000 / bpm));
    this.update({ tapBpm: bpm });
  }

  // -- pedal presets (program change) ----------------------------------------

  private get hasToggle() {
    return this.pedal.presets.toggle !== false;
  }

  private goLive() {
    if (!this.hasToggle) return;
    this.sink.send({ type: 'pc', program: 0 });
    this.update({ preset: { kind: 'live' } });
  }

  /** The 3-way preset toggle: left = slot 2, middle = live, right = slot 1. */
  presetToggle(position: 'left' | 'middle' | 'right') {
    if (!this.hasToggle) return;
    this.onEvent('preset_toggle', { position });
    if (position === 'middle') return this.goLive();
    const slot = position === 'left' ? 2 : 1;
    this.sink.send({ type: 'pc', program: slot });
    this.update({ preset: { kind: 'toggle', slot } });
  }

  /** The slot the editor last recalled or stored; unknown after a preset toggle or at start. */
  get currentSlot(): number | undefined {
    const p = this.state.preset;
    return p.kind === 'recall' || p.kind === 'store' ? p.slot : undefined;
  }

  /** Slots the pedal recalls by program change. */
  get recallRange() {
    return this.pedal.presets.recall ?? { first: 1, last: 122, program: (slot: number) => slot, label: 'Slot' };
  }

  recall(slot: number) {
    if (!Number.isInteger(slot)) return;
    if (slot === 0 && this.hasToggle) {
      this.onEvent('pedal_recall', { slot });
      return this.goLive();
    }
    const range = this.recallRange;
    if (slot < range.first || slot > range.last) return;
    this.onEvent('pedal_recall', { slot });
    this.sink.send({ type: 'pc', program: range.program(slot) });
    const prev = this.state.preset;
    this.update({ preset: { kind: 'recall', slot, flip: prev.kind === 'recall' ? !prev.flip : false } });
  }

  /** Store the pedal's current state into a slot (only pedals with a save CC). */
  store(slot: number): boolean {
    const store = this.pedal.presets.store;
    if (!store || !Number.isInteger(slot) || slot < store.minSlot || slot > store.maxSlot) return false;
    this.onEvent('pedal_store', { slot });
    this.sink.send({ type: 'cc', cc: store.cc, value: slot });
    this.update({ preset: { kind: 'store', slot, at: this.now() } });
    return true;
  }

  command(id: string) {
    const cmd = this.pedal.commands?.find((c) => c.id === id);
    if (!cmd || (cmd.enabled && !cmd.enabled(this.state.values))) return;
    this.onEvent('command', { command: id });
    this.sink.send({ type: 'cc', cc: cmd.cc, value: cmd.value });
    if (cmd.then) this.update({ values: { ...this.state.values, ...cmd.then } });
  }

  // -- footswitches ---------------------------------------------------------

  private footswitch(id: string): Footswitch | undefined {
    return this.pedal.face.footswitches.find((f) => f.id === id);
  }

  pressStart(id: string) {
    const fs = this.footswitch(id);
    if (!fs || this.presses.has(id)) return;
    const press = { holding: false, cancel: () => {} };
    this.presses.set(id, press);
    if (!fs.hold) {
      // no hold action: react immediately (better tap timing)
      this.press(fs);
      return;
    }
    const hold = fs.hold;
    press.cancel = this.schedule(() => {
      const action = this.resolve(hold);
      if (action.type === 'momentary' && action.enabled && !action.enabled(this.state.values)) return;
      press.holding = true;
      this.onEvent('footswitch', { switch: id, action: 'hold' });
      this.run(action, 'down');
      this.update({ held: new Set(this.state.held).add(id) });
    }, this.holdMs);
  }

  /** The concrete action right now — `by` actions depend on the current values. */
  private resolve(action: FootswitchAction): FootswitchAction {
    return action.type === 'by' ? this.resolve(action.action(this.state.values)) : action;
  }

  /** Release; `cancelled` when the pointer left the switch (no click action then). */
  pressEnd(id: string, cancelled = false) {
    const fs = this.footswitch(id);
    const press = this.presses.get(id);
    if (!fs || !press) return;
    this.presses.delete(id);
    press.cancel();
    if (press.holding && fs.hold) {
      this.run(this.resolve(fs.hold), 'up');
      const held = new Set(this.state.held);
      held.delete(id);
      this.update({ held });
    } else if (fs.hold && !cancelled) {
      this.press(fs);
    }
  }

  private press(fs: Footswitch) {
    this.onEvent('footswitch', { switch: fs.id, action: 'press' });
    this.run(fs.press, 'down');
  }

  private run(action: FootswitchAction, phase: 'down' | 'up') {
    switch (action.type) {
      case 'by':
        this.run(this.resolve(action), phase);
        return;
      case 'toggle': {
        const c = this.controls.get(action.control);
        if (c?.kind !== 'switch' && c?.kind !== 'value') return;
        if (phase === 'up') return;
        const on = c.kind === 'switch' ? c.on : (c.max ?? 1);
        const off = c.kind === 'switch' ? c.off : (c.min ?? 0);
        this.apply({ [c.id]: this.state.values[c.id] === on ? off : on }, 'changed');
        return;
      }
      case 'momentary':
        this.sink.send({ type: 'cc', cc: action.cc, value: phase === 'down' ? action.on : action.off });
        return;
      case 'tap':
        if (phase === 'down') this.tap();
        return;
      case 'command':
        if (phase === 'down') this.command(action.id);
        return;
      case 'recall': {
        if (phase === 'up') return;
        const slot = action.slot(this.currentSlot);
        if (slot !== undefined) this.recall(slot);
        return;
      }
      case 'store-current':
        if (phase === 'down' && this.currentSlot !== undefined) this.store(this.currentSlot);
        return;
    }
  }

  dispose() {
    this.cancelTempo?.();
    this.presses.forEach((p) => p.cancel());
    this.presses.clear();
    this.listeners.clear();
  }
}
