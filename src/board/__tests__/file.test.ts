import { describe, expect, it } from 'vitest';
import { MemoryStorage } from '../../editor/core/__tests__/helpers';
import { PresetFileError, PresetStore } from '../../editor/core/presets';
import { defaults } from '../../editor/core/controls';
import { genlossmkii } from '../../pedals/genlossmkii';
import { moodmkii } from '../../pedals/moodmkii';
import { BOARD_FILE_FORMAT, BOARD_FILE_VERSION, boardFilename, buildBoardFile, describeBoardImport, importBoardFile, parseBoardFile } from '../file';

const now = () => 1_700_000_000_000;

function seeded() {
  const storage = new MemoryStorage();
  const mood = new PresetStore(moodmkii, storage, now);
  mood.save('Shimmer', { ...defaults(moodmkii), k1: 20 });
  mood.save('Dark', { ...defaults(moodmkii), k1: 100 });
  return { storage, mood };
}

describe('board files', () => {
  it('exports the board in order with the presets of each pedal', () => {
    const { storage } = seeded();
    const file = buildBoardFile(['generationloss-editor', 'moodmkii-editor', 'retired-editor'], storage, now);
    expect(file.format).toBe(BOARD_FILE_FORMAT);
    expect(file.version).toBe(BOARD_FILE_VERSION);
    expect(file.exportedAt).toBe('2023-11-14T22:13:20.000Z');
    expect(file.pedals.map((p) => [p.slug, p.name, p.presets.length])).toEqual([
      ['generationloss-editor', genlossmkii.name, 0],
      ['moodmkii-editor', moodmkii.name, 2],
    ]);
    expect(file.pedals[1].presets.map((p) => p.name)).toEqual(['Shimmer', 'Dark']);
    expect(boardFilename(file.exportedAt)).toBe('pedalzombie-board-2023-11-14.json');
  });

  it('rebuilds board and presets on another browser', () => {
    const { storage } = seeded();
    const text = JSON.stringify(buildBoardFile(['generationloss-editor', 'moodmkii-editor'], storage, now));

    const fresh = new MemoryStorage();
    const result = importBoardFile(text, [], fresh, now);
    expect(result.board).toEqual(['generationloss-editor', 'moodmkii-editor']);
    expect(result.addedPedals).toEqual([genlossmkii.name, moodmkii.name]);
    expect(result.presets.added.map((p) => p.name)).toEqual(['Shimmer', 'Dark']);
    expect(new PresetStore(moodmkii, fresh).list().map((p) => [p.name, p.values.k1])).toEqual([
      ['Shimmer', 20],
      ['Dark', 100],
    ]);
    expect(describeBoardImport(result)).toBe('2 pedals added to your board, 2 presets added.');
  });

  it('appends to an existing board and never replaces presets', () => {
    const { storage } = seeded();
    const text = JSON.stringify(buildBoardFile(['moodmkii-editor', 'generationloss-editor'], storage, now));
    const other = new MemoryStorage();
    new PresetStore(moodmkii, other, now).save('Dark', { ...defaults(moodmkii), k1: 5 });

    const result = importBoardFile(text, ['preampmkii-editor', 'moodmkii-editor'], other, now);
    expect(result.board).toEqual(['preampmkii-editor', 'moodmkii-editor', 'generationloss-editor']);
    expect(result.addedPedals).toEqual([genlossmkii.name]);
    expect(result.presets.added.map((p) => p.name)).toEqual(['Shimmer', 'Dark (2)']);
    expect(result.presets.renamed).toEqual([{ from: 'Dark', to: 'Dark (2)' }]);
    expect(new PresetStore(moodmkii, other).list().find((p) => p.name === 'Dark')?.values.k1).toBe(5);
    expect(describeBoardImport(result)).toBe('1 pedal added to your board, 2 presets added, 1 preset renamed.');
  });

  it('reports nothing new when the board is already here', () => {
    const { storage } = seeded();
    const text = JSON.stringify(buildBoardFile(['moodmkii-editor'], storage, now));
    const result = importBoardFile(text, ['moodmkii-editor'], storage, now);
    expect(result.addedPedals).toEqual([]);
    expect(result.presets.added).toEqual([]);
    expect(result.presets.skipped).toEqual(['Shimmer', 'Dark']);
    expect(describeBoardImport(result)).toBe('2 presets already here.');
    expect(describeBoardImport({ board: [], addedPedals: [], presets: { added: [], skipped: [], renamed: [] }, unknown: [] })).toBe(
      'Nothing new: this board is already here.',
    );
  });

  it('skips pedals this site has no editor for and names them', () => {
    const text = JSON.stringify({
      format: BOARD_FILE_FORMAT,
      version: 1,
      exportedAt: '',
      pedals: [
        { slug: 'future-editor', name: 'Future Pedal', presets: [] },
        { slug: 'moodmkii-editor', name: 'MOOD MKII', presets: [] },
        { slug: 'moodmkii-editor', name: 'MOOD MKII', presets: [] },
      ],
    });
    const parsed = parseBoardFile(text);
    expect(parsed.pedals.map((p) => p.pedal.slug)).toEqual(['moodmkii-editor']);
    expect(parsed.unknown).toEqual(['Future Pedal']);
    const result = importBoardFile(text, [], new MemoryStorage(), now);
    expect(result.board).toEqual(['moodmkii-editor']);
    expect(describeBoardImport(result)).toBe('1 pedal added to your board, no editor for Future Pedal.');
  });

  it.each([
    ['not JSON', 'nope', 'This is not a pedalzombie board file.'],
    ['a preset file', JSON.stringify({ format: 'pedalzombie-presets', version: 1 }), 'This is not a pedalzombie board file.'],
    ['no version', JSON.stringify({ format: BOARD_FILE_FORMAT, pedals: [] }), 'This board file is damaged (no version).'],
    ['a newer version', JSON.stringify({ format: BOARD_FILE_FORMAT, version: 2, pedals: [{ slug: 'x' }] }), 'This file was made with a newer pedalzombie. Reload the page and try again.'],
    ['no pedals', JSON.stringify({ format: BOARD_FILE_FORMAT, version: 1, pedals: [] }), 'This board file contains no pedals.'],
    ['a damaged pedal', JSON.stringify({ format: BOARD_FILE_FORMAT, version: 1, pedals: [{ name: 'x' }] }), 'Pedal 1 in this file is damaged.'],
    [
      'a damaged preset',
      JSON.stringify({ format: BOARD_FILE_FORMAT, version: 1, pedals: [{ slug: 'moodmkii-editor', presets: [{ name: '' }] }] }),
      'Preset 1 in this file is damaged.',
    ],
  ])('rejects %s', (_, text, message) => {
    expect(() => parseBoardFile(text)).toThrow(PresetFileError);
    expect(() => parseBoardFile(text)).toThrow(message);
  });
});
