import type { MidiSink } from './engine';
import type { KeyValueStorage } from './presets';
import type { MidiMessage } from './types';

/**
 * Thin, testable layer over Web MIDI (via the `webmidi` library, loaded lazily
 * so pages without an editor never pay for it).
 *
 * Fixes from the 2023 editors: lists *outputs* (not inputs), MIDI channels are
 * 1–16, the chosen device is remembered by name, the stored channel is applied
 * immediately.
 */

export type MidiStatus = 'idle' | 'connecting' | 'unsupported' | 'denied' | 'ready';

export interface MidiPort {
  id: string;
  name: string;
}

export interface LogEntry {
  id: number;
  at: number;
  text: string;
}

export interface MidiConnectionState {
  status: MidiStatus;
  outputs: MidiPort[];
  outputId: string | null;
  channel: number;
  log: LogEntry[];
}

/** What the connection needs from a MIDI backend (WebMidi in the browser, a fake in tests). */
export interface MidiBackend {
  enable(): Promise<void>;
  outputs(): MidiPort[];
  send(outputId: string, channel: number, msg: MidiMessage): void;
  onPortsChanged(listener: () => void): void;
}

const DEVICE_KEY = 'pedalzombie:midi-output';
const LOG_SIZE = 30;

export function describe(msg: MidiMessage): string {
  return msg.type === 'cc' ? `CC ${msg.cc} = ${msg.value}` : `PC ${msg.program}`;
}

export class MidiConnection implements MidiSink {
  private state: MidiConnectionState;
  private readonly listeners = new Set<() => void>();
  private logId = 0;

  constructor(
    private readonly backend: MidiBackend,
    private readonly storage: KeyValueStorage,
    /** Legacy key `<namespace>_midichannel`, shared with the 2023 editors. */
    private readonly channelKey: string,
    defaultChannel: number,
  ) {
    const stored = Number.parseInt(storage.getItem(channelKey) ?? '', 10);
    const channel = stored >= 1 && stored <= 16 ? stored : defaultChannel;
    this.state = { status: 'idle', outputs: [], outputId: null, channel, log: [] };
  }

  getState = (): MidiConnectionState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private update(patch: Partial<MidiConnectionState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  async connect() {
    if (this.state.status === 'connecting' || this.state.status === 'ready') return;
    this.update({ status: 'connecting' });
    try {
      await this.backend.enable();
    } catch (err) {
      this.update({ status: err instanceof Error && err.name === 'NotSupportedError' ? 'unsupported' : 'denied' });
      return;
    }
    this.backend.onPortsChanged(() => this.refreshPorts());
    this.update({ status: 'ready' });
    this.refreshPorts();
  }

  private refreshPorts() {
    const outputs = this.backend.outputs();
    let outputId = this.state.outputId;
    if (!outputs.some((o) => o.id === outputId)) {
      const remembered = this.storage.getItem(DEVICE_KEY);
      outputId = outputs.find((o) => o.name === remembered)?.id ?? null;
    }
    this.update({ outputs, outputId });
  }

  selectOutput(id: string | null) {
    const port = this.state.outputs.find((o) => o.id === id);
    if (port) this.storage.setItem(DEVICE_KEY, port.name);
    this.update({ outputId: port ? port.id : null });
  }

  setChannel(channel: number) {
    if (!Number.isInteger(channel) || channel < 1 || channel > 16) return;
    this.storage.setItem(this.channelKey, String(channel));
    this.update({ channel });
  }

  get connected() {
    return this.state.status === 'ready' && this.state.outputId !== null;
  }

  send(msg: MidiMessage) {
    const { outputId, channel } = this.state;
    if (!this.connected || outputId === null) {
      this.log(`${describe(msg)} (not sent — no MIDI output)`);
      return;
    }
    try {
      this.backend.send(outputId, channel, msg);
      this.log(`ch ${channel} · ${describe(msg)}`);
    } catch (err) {
      this.log(`${describe(msg)} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private log(text: string) {
    this.update({ log: [{ id: ++this.logId, at: Date.now(), text }, ...this.state.log].slice(0, LOG_SIZE) });
  }
}

/** Browser backend based on the `webmidi` library (v3). */
export function createWebMidiBackend(): MidiBackend {
  let lib: typeof import('webmidi') | undefined;
  const webMidi = () => {
    if (!lib) throw new Error('Web MIDI not enabled');
    return lib.WebMidi;
  };

  return {
    async enable() {
      if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
        const err = new Error('Web MIDI is not supported by this browser');
        err.name = 'NotSupportedError';
        throw err;
      }
      lib = await import('webmidi');
      await lib.WebMidi.enable();
    },
    outputs: () => webMidi().outputs.map((o) => ({ id: o.id, name: o.name })),
    send(outputId, channel, msg) {
      const output = webMidi().getOutputById(outputId);
      if (!output) throw new Error('MIDI output disconnected');
      const ch = output.channels[channel];
      if (msg.type === 'cc') ch.sendControlChange(msg.cc, msg.value);
      else ch.sendProgramChange(msg.program);
    },
    onPortsChanged(listener) {
      webMidi().addListener('connected', listener);
      webMidi().addListener('disconnected', listener);
    },
  };
}
