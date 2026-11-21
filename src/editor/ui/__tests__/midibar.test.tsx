// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryStorage, setup } from '../../core/__tests__/helpers';
import { MidiConnection, type MidiBackend } from '../../core/midi';
import { PresetStore } from '../../core/presets';
import { EditorContext, type EditorServices } from '../context';
import { MidiBar } from '../MidiBar';
import { moodmkii } from '../../../pedals/moodmkii';

afterEach(cleanup);

function mount(ports = [{ id: 'b', name: 'Volt 2' }]) {
  const backend: MidiBackend = { enable: async () => {}, outputs: () => ports, send: () => {}, onPortsChanged: () => {} };
  const midi = new MidiConnection(backend, new MemoryStorage(), 'moodmkii_midichannel', 2);
  const services: EditorServices = { engine: setup(moodmkii).engine, midi, presets: new PresetStore(moodmkii, new MemoryStorage()), assets: '', track: () => {} };
  render(
    <EditorContext.Provider value={services}>
      <MidiBar />
    </EditorContext.Provider>,
  );
  return midi;
}

describe('MidiBar', () => {
  it('tells people how to check the pedal once an output is chosen, since the pedal cannot answer', async () => {
    const midi = mount();
    expect(screen.getByRole('status').textContent).toBe('Connect to your MIDI interface to control the pedal.');
    expect(screen.queryByText(/Move a knob/)).toBeNull();

    await act(() => midi.connect());
    expect(screen.getByRole('status').textContent).toBe('Select your MIDI output.');

    fireEvent.change(screen.getByLabelText('Output'), { target: { value: 'b' } });
    const status = screen.getByRole('status').textContent ?? '';
    expect(status.startsWith('Connected. Move a knob, the pedal should follow.')).toBe(true);
    expect(status).toContain('Check the channel and the cable');
    expect(screen.getByRole('link', { name: 'setup guide' }).getAttribute('href')).toBe('/setup/');
  });

  it('shows no hint while no output is plugged in', async () => {
    const midi = mount([]);
    await act(() => midi.connect());
    expect(screen.getByRole('status').textContent).toBe('No MIDI output found — plug in your interface.');
  });
});
