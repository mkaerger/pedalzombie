import { PresetFileError } from '../editor/core/presets';
import { safeStorage } from '../editor/core/storage';
import type { KeyValueStorage } from '../editor/core/presets';
import { downloadJson, PRESET_FILE_MAX_BYTES, readText } from '../editor/ui/files';
import { addToBoard, BOARD_KEY, readBoard, removeFromBoard, writeBoard } from './store';

/**
 * Wires "My board" into a page. The page renders the markup, this only shows, orders and labels it:
 *
 *   [data-board-slot="<slug>"]    one per editor, hidden unless on the board; reordered to board order
 *   [data-board-toggle="<slug>"]  add/remove button, `aria-pressed` and label follow the board
 *                                 (with `data-board-icon`: the label goes to `aria-label` and `title`)
 *   [data-board-count]            "3 pedals"
 *   [data-board-channel="<storageKey>"] (with data-default-channel)   "ch 2": the editor's MIDI channel
 *   [data-board-midi] [data-board-midi-text]   the MIDI interface, when the site may use Web MIDI already
 *   [data-board-export] [data-board-import] [data-board-file] [data-board-status]   board file controls
 *   <html data-board="3">         set while the board has pedals, so CSS can swap the hero
 */
export const LABEL_ADD = 'Add to my board';
export const LABEL_ON = 'On my board ✓';

type Track = (name: string, params: Record<string, string | number>) => void;

/** Names of the MIDI outputs, or null when Web MIDI is unavailable or the site was not allowed to use it yet. */
export type MidiProbe = () => Promise<string[] | null>;

const MIDI_OUTPUT_KEY = 'pedalzombie:midi-output';

/** Looks only when the permission is already granted, so the home page never pops the MIDI dialog. */
export const probeWebMidi: MidiProbe = async () => {
  try {
    if (!navigator.requestMIDIAccess || !navigator.permissions) return null;
    const permission = await navigator.permissions.query({ name: 'midi' as PermissionName });
    if (permission.state !== 'granted') return null;
    const access = await navigator.requestMIDIAccess();
    return [...access.outputs.values()].map((o) => o.name ?? 'MIDI output');
  } catch {
    return null;
  }
};

/** The editor's MIDI channel as its MIDI bar would show it. */
export function channelOf(storage: KeyValueStorage, storageKey: string, fallback: string | undefined): number | null {
  const stored = Number.parseInt(storage.getItem(`${storageKey}_midichannel`) ?? '', 10);
  if (stored >= 1 && stored <= 16) return stored;
  const def = Number.parseInt(fallback ?? '', 10);
  return def >= 1 && def <= 16 ? def : null;
}

const trackToGtag: Track = (name, params) => {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
};

export function createBoardUi(root: Document, storage: KeyValueStorage = safeStorage(), track: Track = trackToGtag, probeMidi: MidiProbe = probeWebMidi) {
  const slots = [...root.querySelectorAll<HTMLElement>('[data-board-slot]')];
  const toggles = [...root.querySelectorAll<HTMLElement>('[data-board-toggle]')];
  const known = new Set([...slots.map((el) => el.dataset.boardSlot), ...toggles.map((el) => el.dataset.boardToggle)].filter((s): s is string => !!s));
  const status = root.querySelector<HTMLElement>('[data-board-status]');
  const fileInput = root.querySelector<HTMLInputElement>('[data-board-file]');

  let board = readBoard(storage, (slug) => known.has(slug));

  const render = () => {
    if (board.length > 0) root.documentElement.dataset.board = String(board.length);
    else delete root.documentElement.dataset.board;
    for (const slot of slots) slot.hidden = !board.includes(slot.dataset.boardSlot ?? '');
    for (const slug of board) {
      // appending moves the element: the board fills from the first slot on, in the order of adding
      for (const slot of slots) if (slot.dataset.boardSlot === slug) slot.parentElement?.append(slot);
    }
    for (const toggle of toggles) {
      const on = board.includes(toggle.dataset.boardToggle ?? '');
      const label = on ? LABEL_ON : LABEL_ADD;
      toggle.setAttribute('aria-pressed', String(on));
      if (toggle.dataset.boardIcon !== undefined) {
        toggle.setAttribute('aria-label', label);
        toggle.title = label;
      } else toggle.textContent = label;
    }
    for (const el of root.querySelectorAll<HTMLElement>('[data-board-count]')) {
      el.textContent = `${board.length} pedal${board.length === 1 ? '' : 's'}`;
    }
    for (const el of root.querySelectorAll<HTMLElement>('[data-board-channel]')) {
      const channel = channelOf(storage, el.dataset.boardChannel ?? '', el.dataset.defaultChannel);
      el.textContent = channel === null ? '' : `ch ${channel}`;
    }
  };

  /** "Volt 2 ready" or "no MIDI interface found", only on pages with the board and once the board has pedals. */
  const showMidi = async () => {
    const box = root.querySelector<HTMLElement>('[data-board-midi]');
    const text = root.querySelector<HTMLElement>('[data-board-midi-text]');
    if (!box || !text || board.length === 0) return;
    const outputs = await probeMidi();
    if (outputs === null) return;
    const remembered = storage.getItem(MIDI_OUTPUT_KEY);
    const name = outputs.find((o) => o === remembered) ?? outputs[0];
    box.classList.toggle('is-ready', !!name);
    text.textContent = name ? `${name} ready` : 'no MIDI interface found';
    box.hidden = false;
  };

  const say = (text: string, error = false) => {
    if (!status) return;
    status.textContent = text;
    status.setAttribute('role', error ? 'alert' : 'status');
  };

  const set = (next: string[]) => {
    board = next;
    writeBoard(storage, board);
    render();
  };

  const toggle = (slug: string) => {
    const on = board.includes(slug);
    set(on ? removeFromBoard(board, slug) : addToBoard(board, slug));
    track(on ? 'board_remove' : 'board_add', { pedal: slug, size: board.length });
  };

  const exportBoard = async () => {
    const { buildBoardFile, boardFilename } = await import('./file');
    const file = buildBoardFile(board, storage);
    downloadJson(boardFilename(file.exportedAt), file);
    track('board_export', { pedals: file.pedals.length, presets: file.pedals.reduce((n, p) => n + p.presets.length, 0) });
  };

  const importBoard = async (blob: File) => {
    if (blob.size > PRESET_FILE_MAX_BYTES) return say('This is not a pedalzombie board file.', true);
    try {
      const { importBoardFile, describeBoardImport } = await import('./file');
      const result = importBoardFile(await readText(blob), board, storage);
      set(result.board);
      say(describeBoardImport(result));
      track('board_import', { pedals: result.addedPedals.length, presets: result.presets.added.length });
    } catch (e) {
      say(e instanceof PresetFileError ? e.message : 'This file could not be read.', true);
    }
  };

  root.addEventListener('click', (e) => {
    const target = (e.target as Element | null)?.closest<HTMLElement>('[data-board-toggle], [data-board-export], [data-board-import]');
    if (!target) return;
    if (target.dataset.boardToggle !== undefined) toggle(target.dataset.boardToggle);
    else if (target.dataset.boardExport !== undefined) void exportBoard();
    else fileInput?.click();
  });
  fileInput?.addEventListener('change', () => {
    const blob = fileInput.files?.[0];
    fileInput.value = '';
    if (blob) void importBoard(blob);
  });
  // another tab changed the board
  root.defaultView?.addEventListener('storage', (e) => {
    if (e.key !== BOARD_KEY && e.key !== null) return;
    board = readBoard(storage, (slug) => known.has(slug));
    render();
  });

  render();
  const ready = showMidi();
  return { get board() { return board; }, toggle, render, ready };
}
