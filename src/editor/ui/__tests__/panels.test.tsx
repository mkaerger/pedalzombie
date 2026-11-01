// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorage, setup } from '../../core/__tests__/helpers';
import { PresetStore } from '../../core/presets';
import type { MidiConnection } from '../../core/midi';
import { EditorContext, type EditorServices } from '../context';
import { Panel } from '../Panels';
import { moodmkii } from '../../../pedals/moodmkii';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

function mount() {
  const { engine } = setup(moodmkii);
  const services: EditorServices = {
    engine,
    midi: {} as MidiConnection,
    presets: new PresetStore(moodmkii, new MemoryStorage()),
    assets: '',
    track: () => {},
  };
  return render(
    <EditorContext.Provider value={services}>
      <Panel id="dips" title="Dip switches">
        <p>content</p>
      </Panel>
    </EditorContext.Provider>,
  );
}

describe('Panel', () => {
  it('folds away by its title and remembers that per pedal', () => {
    const view = mount();
    const title = screen.getByRole('button', { name: 'Dip switches' });
    expect(title.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('content').closest('[hidden]')).toBeNull();
    fireEvent.click(title);
    expect(title.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('content').closest('[hidden]')).not.toBeNull();
    expect(JSON.parse(window.localStorage.getItem('moodmkii_panels')!)).toEqual(['dips']);
    view.unmount();
    mount();
    expect(screen.getByRole('button', { name: 'Dip switches' }).getAttribute('aria-expanded')).toBe('false');
  });
});
