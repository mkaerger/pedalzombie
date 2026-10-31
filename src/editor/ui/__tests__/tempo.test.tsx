// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { cc, setup } from '../../core/__tests__/helpers';
import { PresetStore } from '../../core/presets';
import type { MidiConnection } from '../../core/midi';
import { EditorContext, type EditorServices } from '../context';
import { TempoBlock } from '../Panels';
import { bigtime } from '../../../pedals/bigtime';
import { moodmkii } from '../../../pedals/moodmkii';
import { MemoryStorage } from '../../core/__tests__/helpers';

afterEach(cleanup);

/** The tempo block only needs the engine; the other services are stubs. */
function mount(pedal: typeof moodmkii) {
  const { engine, sink, advance } = setup(pedal);
  const services: EditorServices = {
    engine,
    midi: {} as MidiConnection,
    presets: new PresetStore(pedal, new MemoryStorage()),
    assets: '',
    track: () => {},
  };
  render(
    <EditorContext.Provider value={services}>
      <TempoBlock />
    </EditorContext.Provider>,
  );
  return { engine, sink, advance, input: screen.getByRole('textbox', { name: 'Set tempo in BPM' }), set: screen.getByRole('button', { name: 'Set' }) };
}

describe('TempoBlock', () => {
  it('offers the BPM input on a pedal without a bpm control and sends the tempo as two taps', () => {
    const { sink, advance, input, set } = mount(moodmkii);
    expect(set).toHaveProperty('disabled', true); // empty
    fireEvent.change(input, { target: { value: '90' } });
    expect(set).toHaveProperty('disabled', false);
    fireEvent.submit(set.closest('form')!);
    expect(sink.take()).toEqual([cc(107, 127)]);
    advance(667);
    expect(sink.take()).toEqual([cc(107, 127)]);
    expect(screen.getByText('90')).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe(''); // cleared after a successful set
  });

  it('flags invalid input, keeps Set disabled and sends nothing', () => {
    const { sink, input, set } = mount(moodmkii);
    fireEvent.change(input, { target: { value: '500' } });
    expect(screen.getByRole('alert').textContent).toBe('Between 20 and 300 BPM');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(set).toHaveProperty('disabled', true);
    fireEvent.submit(set.closest('form')!);
    expect(sink.take()).toEqual([]);
    fireEvent.change(input, { target: { value: '12.5' } });
    expect(screen.getByRole('alert').textContent).toBe('Whole numbers only');
  });

  it('disables tap and the input while the pedal cannot take a tap (Big Time outside SHORT / LONG)', () => {
    const { engine, sink, input, set } = mount(bigtime);
    expect(screen.getByRole('button', { name: 'Tap' })).toHaveProperty('disabled', false);
    act(() => engine.set('b3', 3)); // LOOP
    sink.take();
    expect(screen.getByRole('button', { name: 'Tap' })).toHaveProperty('disabled', true);
    expect(input).toHaveProperty('disabled', true);
    expect(set).toHaveProperty('disabled', true);
    expect(screen.getByText(/Tap tempo works in SHORT and LONG mode/)).toBeTruthy();
  });
});
