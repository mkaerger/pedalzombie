import { parsePresetList, PresetFileError, PresetStore, type FilePreset, type ImportResult, type KeyValueStorage } from '../editor/core/presets';
import type { PedalDefinition } from '../editor/core/types';
import { pedalBySlug } from '../pedals';

/**
 * A board file carries the whole board in one JSON document: which pedals are on it, in order,
 * and the presets of each. Importing it on another browser rebuilds the board and adds the presets
 * under the same rules as a preset file (nothing existing is replaced).
 *
 *   {"format": "pedalzombie-board", "version": 1, "exportedAt": "…",
 *    "pedals": [{"slug": "moodmkii-editor", "name": "MOOD MKII", "presets": [{"name": "…", "values": {…}}]}]}
 */
export const BOARD_FILE_FORMAT = 'pedalzombie-board';
export const BOARD_FILE_VERSION = 1;

export interface BoardFile {
  format: typeof BOARD_FILE_FORMAT;
  version: number;
  exportedAt: string;
  pedals: { slug: string; name: string; presets: FilePreset[] }[];
}

export interface BoardImportResult {
  /** The board after the import. */
  board: string[];
  /** Pedals the file put on the board. */
  addedPedals: string[];
  /** Preset merge over all pedals of the file. */
  presets: ImportResult;
  /** Pedals in the file this site has no editor for. */
  unknown: string[];
}

export function buildBoardFile(board: string[], storage: KeyValueStorage, now: () => number = Date.now): BoardFile {
  const pedals = board.map(pedalBySlug).filter((p): p is PedalDefinition => !!p);
  return {
    format: BOARD_FILE_FORMAT,
    version: BOARD_FILE_VERSION,
    exportedAt: new Date(now()).toISOString(),
    pedals: pedals.map((pedal) => ({ slug: pedal.slug, name: pedal.name, presets: new PresetStore(pedal, storage, now).export().presets })),
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Check a file's text; returns the known pedals with sanitized presets and the names of unknown ones. */
export function parseBoardFile(text: string): { pedals: { pedal: PedalDefinition; presets: FilePreset[] }[]; unknown: string[] } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new PresetFileError('This is not a pedalzombie board file.');
  }
  if (!isRecord(data) || data.format !== BOARD_FILE_FORMAT) {
    throw new PresetFileError('This is not a pedalzombie board file.');
  }
  if (typeof data.version !== 'number' || !Number.isInteger(data.version) || data.version < 1) {
    throw new PresetFileError('This board file is damaged (no version).');
  }
  if (data.version > BOARD_FILE_VERSION) {
    throw new PresetFileError('This file was made with a newer pedalzombie. Reload the page and try again.');
  }
  if (!Array.isArray(data.pedals) || data.pedals.length === 0) {
    throw new PresetFileError('This board file contains no pedals.');
  }
  const pedals: { pedal: PedalDefinition; presets: FilePreset[] }[] = [];
  const unknown: string[] = [];
  data.pedals.forEach((entry: unknown, i: number) => {
    if (!isRecord(entry) || typeof entry.slug !== 'string') throw new PresetFileError(`Pedal ${i + 1} in this file is damaged.`);
    const pedal = pedalBySlug(entry.slug);
    if (!pedal) {
      unknown.push(typeof entry.name === 'string' && entry.name.trim() ? entry.name : entry.slug);
      return;
    }
    if (pedals.some((p) => p.pedal === pedal)) return;
    pedals.push({ pedal, presets: parsePresetList(pedal, entry.presets ?? []) });
  });
  return { pedals, unknown };
}

/** Put the file's pedals on the board (after the ones already there) and merge their presets. */
export function importBoardFile(text: string, board: string[], storage: KeyValueStorage, now: () => number = Date.now): BoardImportResult {
  const file = parseBoardFile(text);
  const result: BoardImportResult = { board: [...board], addedPedals: [], presets: { added: [], skipped: [], renamed: [] }, unknown: file.unknown };
  for (const { pedal, presets } of file.pedals) {
    if (!result.board.includes(pedal.slug)) {
      result.board.push(pedal.slug);
      result.addedPedals.push(pedal.name);
    }
    if (presets.length === 0) continue;
    const merged = new PresetStore(pedal, storage, now).importPresets(presets);
    result.presets.added.push(...merged.added);
    result.presets.skipped.push(...merged.skipped);
    result.presets.renamed.push(...merged.renamed);
  }
  return result;
}

const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;

/** One line for the status text after an import. */
export function describeBoardImport({ addedPedals, presets, unknown }: BoardImportResult): string {
  const parts: string[] = [];
  if (addedPedals.length > 0) parts.push(`${count(addedPedals.length, 'pedal')} added to your board`);
  if (presets.added.length > 0) parts.push(`${count(presets.added.length, 'preset')} added`);
  if (presets.skipped.length > 0) parts.push(`${count(presets.skipped.length, 'preset')} already here`);
  if (presets.renamed.length > 0) parts.push(`${count(presets.renamed.length, 'preset')} renamed`);
  if (unknown.length > 0) parts.push(`no editor for ${unknown.join(', ')}`);
  return parts.length > 0 ? `${parts.join(', ')}.` : 'Nothing new: this board is already here.';
}

/** `pedalzombie-board-2026-11-21.json` */
export const boardFilename = (exportedAt: string) => `pedalzombie-board-${exportedAt.slice(0, 10)}.json`;
