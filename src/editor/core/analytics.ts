import type { MidiConnection } from './midi';

export type EventParams = Record<string, string | number>;
export type Tracker = (name: string, params?: EventParams) => void;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Actions that happen many times per session are reported once per page (and per
 * parameter set), so a session shows *what* was used, not how often.
 */
const ONCE_PER_PAGE = new Set(['control_edit', 'footswitch', 'tap']);

/** Sends to Google Analytics when it was loaded, i.e. only after the visitor accepted. */
function sendToGtag(name: string, params: EventParams) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', name, params);
}

/** Event tracker for one editor page; every event carries the pedal. */
export function createTracker(pedal: string, send: (name: string, params: EventParams) => void = sendToGtag): Tracker {
  const seen = new Set<string>();
  return (name, params = {}) => {
    if (ONCE_PER_PAGE.has(name)) {
      const key = name + JSON.stringify(params);
      if (seen.has(key)) return;
      seen.add(key);
    }
    send(name, { pedal, ...params });
  };
}

/** Reports connection outcome, chosen interface and channel changes. Returns the unsubscribe function. */
export function watchMidi(midi: MidiConnection, track: Tracker): () => void {
  let prev = midi.getState();
  return midi.subscribe(() => {
    const s = midi.getState();
    if (s.status !== prev.status && (s.status === 'ready' || s.status === 'denied' || s.status === 'unsupported')) {
      track('midi_connect', { outcome: s.status });
    }
    if (s.outputId !== prev.outputId && s.outputId !== null) {
      track('midi_output', { output: s.outputs.find((o) => o.id === s.outputId)?.name ?? 'unknown' });
    }
    if (s.channel !== prev.channel) track('midi_channel', { channel: s.channel });
    prev = s;
  });
}
