import { describe, expect, it } from 'vitest';
import { createTracker, watchMidi, type EventParams } from '../analytics';
import { MidiConnection, type MidiBackend } from '../midi';
import { MemoryStorage } from './helpers';

function recorder() {
  const events: [string, EventParams][] = [];
  return { events, send: (name: string, params: EventParams) => events.push([name, params]) };
}

describe('createTracker', () => {
  it('tags every event with the pedal', () => {
    const { events, send } = recorder();
    const track = createTracker('habit', send);
    track('randomize', { group: 'knobs' });
    expect(events).toEqual([['randomize', { pedal: 'habit', group: 'knobs' }]]);
  });

  it('reports frequent actions once per page and parameter set', () => {
    const { events, send } = recorder();
    const track = createTracker('habit', send);
    track('control_edit', { control: 'k1' });
    track('control_edit', { control: 'k1' });
    track('control_edit', { control: 'k2' });
    track('footswitch', { switch: 'tap', action: 'press' });
    track('footswitch', { switch: 'tap', action: 'press' });
    track('tap');
    track('tap');
    expect(events.map(([n, p]) => `${n}:${p.control ?? p.switch ?? ''}`)).toEqual(['control_edit:k1', 'control_edit:k2', 'footswitch:tap', 'tap:']);
  });

  it('is a no-op without Google Analytics (no consent)', () => {
    expect(() => createTracker('habit')('randomize')).not.toThrow();
  });
});

describe('watchMidi', () => {
  it('reports connection outcome, interface and channel once each', async () => {
    const backend: MidiBackend = {
      enable: async () => {},
      outputs: () => [{ id: 'a', name: 'Volt 2' }],
      send: () => {},
      onPortsChanged: () => {},
    };
    const midi = new MidiConnection(backend, new MemoryStorage(), 'x', 2);
    const { events, send } = recorder();
    const stop = watchMidi(midi, createTracker('mood', send));
    await midi.connect();
    midi.selectOutput('a');
    midi.setChannel(5);
    midi.setChannel(5);
    stop();
    midi.setChannel(6);
    expect(events).toEqual([
      ['midi_connect', { pedal: 'mood', outcome: 'ready' }],
      ['midi_output', { pedal: 'mood', output: 'Volt 2' }],
      ['midi_channel', { pedal: 'mood', channel: 5 }],
    ]);
  });
});
