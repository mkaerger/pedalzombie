import { describe, expect, it } from 'vitest';
import { MidiConnection, type MidiBackend } from '../midi';
import type { MidiMessage } from '../types';
import { MemoryStorage } from './helpers';

function fakeBackend(ports = [{ id: 'a', name: 'IAC' }, { id: 'b', name: 'Volt 2' }]) {
  const sent: [string, number, MidiMessage][] = [];
  let changed = () => {};
  const backend: MidiBackend = {
    enable: async () => {},
    outputs: () => ports,
    send: (id, ch, msg) => sent.push([id, ch, msg]),
    onPortsChanged: (l) => (changed = l),
  };
  return { backend, sent, setPorts: (p: typeof ports) => ((ports = p), changed()) };
}

describe('MidiConnection', () => {
  it('uses the legacy channel key and channels 1–16', () => {
    const storage = new MemoryStorage();
    storage.setItem('moodmkii_midichannel', '5');
    const conn = new MidiConnection(fakeBackend().backend, storage, 'moodmkii_midichannel', 2);
    expect(conn.getState().channel).toBe(5);
    conn.setChannel(16);
    expect(storage.getItem('moodmkii_midichannel')).toBe('16');
    conn.setChannel(0);
    expect(conn.getState().channel).toBe(16);
  });

  it('ignores the invalid legacy channel 0', () => {
    const storage = new MemoryStorage();
    storage.setItem('habit_midichannel', '0');
    expect(new MidiConnection(fakeBackend().backend, storage, 'habit_midichannel', 2).getState().channel).toBe(2);
  });

  it('sends to the selected output and remembers it by name', async () => {
    const storage = new MemoryStorage();
    const { backend, sent, setPorts } = fakeBackend();
    const conn = new MidiConnection(backend, storage, 'x', 2);
    await conn.connect();
    conn.send({ type: 'cc', cc: 14, value: 1 });
    expect(sent).toEqual([]);
    conn.selectOutput('b');
    conn.send({ type: 'cc', cc: 14, value: 1 });
    expect(sent).toEqual([['b', 2, { type: 'cc', cc: 14, value: 1 }]]);

    // device order changes → still the same device
    setPorts([{ id: 'c', name: 'Volt 2' }]);
    expect(conn.getState().outputId).toBe('c');

    const again = new MidiConnection(backend, storage, 'x', 2);
    await again.connect();
    expect(again.getState().outputId).toBe('c');
  });
});
