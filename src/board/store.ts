import type { KeyValueStorage } from '../editor/core/presets';

/**
 * "My board": the editors a visitor marked as their own pedals, in the order they were added.
 *
 *   localStorage["pedalzombie:board"] = ["moodmkii-editor", "genlossmkii-editor"]
 *
 * Slugs (the editor URLs) identify the pedals. The list is per browser, like the presets.
 */
export const BOARD_KEY = 'pedalzombie:board';

/** The stored board, without duplicates and without slugs that are not an editor (anymore). */
export function readBoard(storage: KeyValueStorage, isKnown: (slug: string) => boolean): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(storage.getItem(BOARD_KEY) ?? '[]');
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const slugs = parsed.filter((s): s is string => typeof s === 'string' && isKnown(s));
  return [...new Set(slugs)];
}

export function writeBoard(storage: KeyValueStorage, board: string[]) {
  storage.setItem(BOARD_KEY, JSON.stringify(board));
}

/** The board with `slug` at the end; unchanged if it is already on it. */
export function addToBoard(board: string[], slug: string): string[] {
  return board.includes(slug) ? board : [...board, slug];
}

/** The board without `slug`; the others move up, like pedals on a real board. */
export function removeFromBoard(board: string[], slug: string): string[] {
  return board.filter((s) => s !== slug);
}
