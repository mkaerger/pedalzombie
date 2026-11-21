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
 *   [data-board-export] [data-board-import] [data-board-file] [data-board-status]   board file controls
 *   <html data-board="3">         set while the board has pedals, so CSS can swap the hero
 */
export const LABEL_ADD = 'Add to my board';
export const LABEL_ON = 'On my board ✓';

type Track = (name: string, params: Record<string, string | number>) => void;

const trackToGtag: Track = (name, params) => {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
};

export function createBoardUi(root: Document, storage: KeyValueStorage = safeStorage(), track: Track = trackToGtag) {
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
  return { get board() { return board; }, toggle, render };
}
