import { EditorEngine, type EngineOptions, type MidiSink } from '../engine';
import type { MidiMessage, PedalDefinition } from '../types';

export class RecordingSink implements MidiSink {
  messages: MidiMessage[] = [];
  send(msg: MidiMessage) {
    this.messages.push(msg);
  }
  take() {
    const m = this.messages;
    this.messages = [];
    return m;
  }
}

/** Engine with a fake clock and a manual scheduler. */
export function setup(pedal: PedalDefinition, rng = () => 0.5, onEvent?: EngineOptions['onEvent']) {
  const sink = new RecordingSink();
  let time = 1_000_000;
  const timers: { at: number; fn: () => void; cancelled: boolean }[] = [];
  const engine = new EditorEngine(pedal, sink, {
    now: () => time,
    rng,
    holdMs: 600,
    onEvent,
    schedule: (fn, ms) => {
      const t = { at: time + ms, fn, cancelled: false };
      timers.push(t);
      return () => (t.cancelled = true);
    },
  });
  const advance = (ms: number) => {
    time += ms;
    for (const t of timers) if (!t.cancelled && t.at <= time) (t.cancelled = true), t.fn();
  };
  return { engine, sink, advance };
}

export const cc = (cc: number, value: number): MidiMessage => ({ type: 'cc', cc, value });
export const pc = (program: number): MidiMessage => ({ type: 'pc', program });

export class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}
