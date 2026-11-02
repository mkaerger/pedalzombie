// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage, setup } from '../../core/__tests__/helpers';
import { PresetStore, sanitize } from '../../core/presets';
import type { MidiConnection } from '../../core/midi';
import { EditorContext, type EditorServices } from '../context';
import { PresetsPanel } from '../Panels';
import { fileSlug, presetFilename } from '../files';
import { moodmkii } from '../../../pedals/moodmkii';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

const T0 = 1700000000000;

function mount(seed: (store: PresetStore) => void = () => {}) {
  const { engine } = setup(moodmkii);
  const storage = new MemoryStorage();
  const presets = new PresetStore(moodmkii, storage, () => T0);
  seed(presets);
  const events: string[] = [];
  const services: EditorServices = { engine, midi: {} as MidiConnection, presets, assets: '', track: (name) => events.push(name) };
  render(
    <EditorContext.Provider value={services}>
      <PresetsPanel />
    </EditorContext.Provider>,
  );
  return { engine, presets, storage, events };
}

/** What `downloadJson` handed to the browser: the download name and the parsed file. */
function captureDownload() {
  const downloads: { name: string; file: unknown }[] = [];
  const blobs = new Map<string, Blob>();
  let n = 0;
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: (blob: Blob) => {
      const url = `blob:test/${n++}`;
      blobs.set(url, blob);
      return url;
    },
    revokeObjectURL: () => {},
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push({ name: this.download, file: blobs.get(this.href) });
  });
  return {
    downloads,
    async last() {
      const d = downloads.at(-1)!;
      return { name: d.name, file: JSON.parse(await (d.file as Blob).text()) };
    },
  };
}

const chooseFile = async (text: string, name = 'presets.json') => {
  const input = screen.getByLabelText('Preset file') as HTMLInputElement;
  const file = new File([text], name, { type: 'application/json' });
  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } });
    await Promise.resolve();
  });
};

describe('PresetsPanel export', () => {
  afterEach(() => vi.restoreAllMocks());

  it('saves one preset or all of them as a JSON file', async () => {
    const dl = captureDownload();
    const { events } = mount((store) => {
      store.save('Shimmer', { ...sanitize(moodmkii), k1: 99 });
      store.save('Dry Room', { ...sanitize(moodmkii), k1: 0 });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Export Dry Room' }));
    let { name, file } = await dl.last();
    expect(name).toBe('pedalzombie-moodmkii-dry-room.json');
    expect(file).toMatchObject({ format: 'pedalzombie-presets', version: 1, pedal: 'moodmkii', presets: [{ name: 'Dry Room', values: { k1: 0 } }] });
    expect(screen.getByRole('status').textContent).toBe('Saved "Dry Room" as a file.');

    fireEvent.click(screen.getByRole('button', { name: 'Export all' }));
    ({ name, file } = await dl.last());
    expect(name).toBe('pedalzombie-moodmkii-presets-2023-11-14.json');
    expect((file as { presets: unknown[] }).presets).toHaveLength(2);
    expect(screen.getByRole('status').textContent).toBe('Saved 2 presets as a file.');
    expect(events).toEqual(['preset_export', 'preset_export']);
  });

  it('offers no "Export all" without presets, but still Import', () => {
    mount();
    expect(screen.queryByRole('button', { name: 'Export all' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Import…' })).toBeTruthy();
  });
});

describe('PresetsPanel import', () => {
  it('adds the presets of a file to the list and reports what happened', async () => {
    const { presets, events } = mount((store) => store.save('Shimmer', { ...sanitize(moodmkii), k1: 99 }));
    const other = new PresetStore(moodmkii, new MemoryStorage(), () => T0 - 1000);
    other.save('Shimmer', { ...sanitize(moodmkii), k1: 99 });
    other.save('Dry', { ...sanitize(moodmkii), k1: 0 });
    await chooseFile(JSON.stringify(other.export()));
    expect(screen.getByRole('status').textContent).toBe('Imported 1 preset. 1 was already here.');
    expect(screen.getAllByRole('button', { name: /^Export (?!all)/ }).map((b) => b.getAttribute('aria-label'))).toEqual(['Export Dry', 'Export Shimmer']);
    expect(presets.list().map((p) => p.name)).toEqual(['Dry', 'Shimmer']);
    expect(events).toEqual(['preset_import']);
  });

  it('shows why a file was refused and changes nothing', async () => {
    const { presets, events } = mount((store) => store.save('Shimmer', sanitize(moodmkii)));
    await chooseFile('{"format":"pedalzombie-presets","version":1,"pedal":"mood","pedalName":"MOOD","presets":[]}');
    expect(screen.getByRole('alert').textContent).toBe('This file holds presets for MOOD, not for MOOD MKII.');
    await chooseFile('garbage', 'notes.txt');
    expect(screen.getByRole('alert').textContent).toBe('This is not a pedalzombie preset file.');
    expect(presets.list().map((p) => p.name)).toEqual(['Shimmer']);
    expect(events).toEqual([]);
    // the input is cleared so the same file can be chosen again after fixing it
    expect((screen.getByLabelText('Preset file') as HTMLInputElement).value).toBe('');
  });
});

describe('preset file names', () => {
  it('are safe for any file system', () => {
    expect(fileSlug('MOOD MKII')).toBe('mood-mkii');
    expect(fileSlug('  Über/Böse: Fuzz!  ')).toBe('ber-b-se-fuzz');
    expect(fileSlug('???')).toBe('preset');
    expect(presetFilename('moodmkii', '2026-11-02T10:00:00.000Z')).toBe('pedalzombie-moodmkii-presets-2026-11-02.json');
    expect(presetFilename('moodmkii', '2026-11-02T10:00:00.000Z', 'Dry Room')).toBe('pedalzombie-moodmkii-dry-room.json');
  });
});
