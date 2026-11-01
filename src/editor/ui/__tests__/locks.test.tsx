// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryStorage, setup } from '../../core/__tests__/helpers';
import { PresetStore } from '../../core/presets';
import type { MidiConnection } from '../../core/midi';
import { EditorContext, type EditorServices } from '../context';
import { ControlView } from '../ControlView';
import { LockSummary } from '../Panels';
import { moodmkii } from '../../../pedals/moodmkii';

afterEach(cleanup);

function mount(ids: string[]) {
  const { engine } = setup(moodmkii, () => 0.9999);
  const services: EditorServices = {
    engine,
    midi: {} as MidiConnection,
    presets: new PresetStore(moodmkii, new MemoryStorage()),
    assets: '',
    track: () => {},
  };
  render(
    <EditorContext.Provider value={services}>
      {ids.map((id) => (
        <ControlView key={id} id={id} />
      ))}
      <LockSummary />
    </EditorContext.Provider>,
  );
  return engine;
}

describe('Lock', () => {
  it('shows MISO locked by default and keeps it when randomizing', () => {
    const engine = mount(['d10', 'd9']);
    const miso = screen.getByRole('button', { name: 'Keep MISO when randomizing' });
    expect(miso.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Keep CLASSIC when randomizing' }).getAttribute('aria-pressed')).toBe('false');
    act(() => engine.randomize('all'));
    expect(engine.getState().values.d10).toBe(0);
    expect(engine.getState().values.d9).toBe(1);
  });

  it('unlocks on click and lists locked controls in the summary', () => {
    const engine = mount(['d10', 'k1']);
    expect(screen.getByText(/Kept as they are: MISO\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Keep TIME when randomizing' }));
    expect(screen.getByText(/Kept as they are: MISO, TIME\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Unlock all' }));
    expect(engine.getState().locked.size).toBe(0);
    expect(screen.queryByText(/Kept as they are/)).toBeNull();
  });

  it('offers no lock on controls that Randomize never touches', () => {
    mount(['d19']); // TRUE BYPASS, a global setting
    expect(screen.queryByRole('button', { name: /when randomizing/ })).toBeNull();
  });
});
