import { describe, expect, it } from 'vitest';
import { MemoryStorage } from '../../editor/core/__tests__/helpers';
import { addToBoard, BOARD_KEY, readBoard, removeFromBoard, writeBoard } from '../store';

const known = new Set(['moodmkii-editor', 'genlossmkii-editor', 'preampmkii-editor']);
const isKnown = (s: string) => known.has(s);

describe('board store', () => {
  it('starts empty', () => {
    expect(readBoard(new MemoryStorage(), isKnown)).toEqual([]);
  });

  it('keeps the order of adding and survives a round trip', () => {
    const storage = new MemoryStorage();
    let board = addToBoard([], 'genlossmkii-editor');
    board = addToBoard(board, 'moodmkii-editor');
    writeBoard(storage, board);
    expect(storage.getItem(BOARD_KEY)).toBe('["genlossmkii-editor","moodmkii-editor"]');
    expect(readBoard(storage, isKnown)).toEqual(['genlossmkii-editor', 'moodmkii-editor']);
  });

  it('adds a pedal once and removes it without touching the others', () => {
    const board = ['moodmkii-editor', 'genlossmkii-editor'];
    expect(addToBoard(board, 'moodmkii-editor')).toBe(board);
    expect(removeFromBoard(board, 'moodmkii-editor')).toEqual(['genlossmkii-editor']);
    expect(removeFromBoard(board, 'preampmkii-editor')).toEqual(board);
  });

  it.each([
    ['not JSON', '{oops'],
    ['an object', '{"a":1}'],
    ['a string', '"moodmkii-editor"'],
  ])('reads an empty board from %s', (_, text) => {
    const storage = new MemoryStorage();
    storage.setItem(BOARD_KEY, text);
    expect(readBoard(storage, isKnown)).toEqual([]);
  });

  it('drops unknown slugs, non-strings and duplicates but keeps the rest in order', () => {
    const storage = new MemoryStorage();
    storage.setItem(BOARD_KEY, JSON.stringify(['retired-editor', 'moodmkii-editor', 7, null, 'moodmkii-editor', 'preampmkii-editor']));
    expect(readBoard(storage, isKnown)).toEqual(['moodmkii-editor', 'preampmkii-editor']);
  });
});
