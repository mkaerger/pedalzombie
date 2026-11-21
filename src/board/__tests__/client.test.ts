// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from '../../editor/core/__tests__/helpers';
import { createBoardUi, LABEL_ADD, LABEL_ON } from '../client';
import { BOARD_KEY } from '../store';

const SLUGS = ['moodmkii-editor', 'genlossmkii-editor', 'preampmkii-editor'];

function page() {
  document.documentElement.removeAttribute('data-board');
  document.body.innerHTML = `
    <ul id="board">${SLUGS.map((s) => `<li data-board-slot="${s}" hidden>${s}</li>`).join('')}</ul>
    <span data-board-count></span>
    ${SLUGS.map((s) => `<button data-board-toggle="${s}" aria-pressed="false">${LABEL_ADD}</button>`).join('')}
    <button id="icon" data-board-toggle="moodmkii-editor" data-board-icon aria-pressed="false" aria-label="${LABEL_ADD}"><svg></svg></button>
    <p data-board-status></p>
    <span data-board-channel="moodmkii" data-default-channel="2"></span>
    <span data-board-channel="preampmkii" data-default-channel="1"></span>
    <span data-board-midi hidden><i class="dot"></i><span data-board-midi-text></span></span>`;
  const slot = (s: string) => document.querySelector<HTMLElement>(`[data-board-slot="${s}"]`)!;
  const toggle = (s: string) => document.querySelector<HTMLButtonElement>(`[data-board-toggle="${s}"]`)!;
  const shown = () => [...document.querySelectorAll<HTMLElement>('#board [data-board-slot]')].filter((el) => !el.hidden).map((el) => el.dataset.boardSlot);
  const midi = () => document.querySelector<HTMLElement>('[data-board-midi]')!;
  return { slot, toggle, shown, count: () => document.querySelector('[data-board-count]')!.textContent, midi };
}

describe('board page controller', () => {
  beforeEach(() => void (document.body.innerHTML = ''));

  it('shows an empty board as the plain page', () => {
    const p = page();
    createBoardUi(document, new MemoryStorage());
    expect(document.documentElement.dataset.board).toBeUndefined();
    expect(p.shown()).toEqual([]);
    expect(p.toggle('moodmkii-editor').getAttribute('aria-pressed')).toBe('false');
  });

  it('adds and removes pedals by click, in the order of adding', () => {
    const p = page();
    const storage = new MemoryStorage();
    const track = vi.fn();
    createBoardUi(document, storage, track);

    p.toggle('genlossmkii-editor').click();
    p.toggle('moodmkii-editor').click();
    expect(p.shown()).toEqual(['genlossmkii-editor', 'moodmkii-editor']);
    expect(document.documentElement.dataset.board).toBe('2');
    expect(p.count()).toBe('2 pedals');
    expect(p.toggle('moodmkii-editor')).toMatchObject({ textContent: LABEL_ON });
    expect(p.toggle('moodmkii-editor').getAttribute('aria-pressed')).toBe('true');
    const icon = document.getElementById('icon')!;
    expect(icon.getAttribute('aria-pressed')).toBe('true');
    expect(icon.getAttribute('aria-label')).toBe(LABEL_ON);
    expect(icon.title).toBe(LABEL_ON);
    expect(icon.querySelector('svg')).not.toBeNull();
    expect(storage.getItem(BOARD_KEY)).toBe('["genlossmkii-editor","moodmkii-editor"]');
    expect(track).toHaveBeenLastCalledWith('board_add', { pedal: 'moodmkii-editor', size: 2 });

    p.toggle('genlossmkii-editor').click();
    expect(p.shown()).toEqual(['moodmkii-editor']);
    expect(p.count()).toBe('1 pedal');
    expect(p.toggle('genlossmkii-editor')).toMatchObject({ textContent: LABEL_ADD });
    expect(track).toHaveBeenLastCalledWith('board_remove', { pedal: 'genlossmkii-editor', size: 1 });

    p.toggle('moodmkii-editor').click();
    expect(document.documentElement.dataset.board).toBeUndefined();
  });

  it('renders a stored board on load, in board order, ignoring retired editors', () => {
    const p = page();
    const storage = new MemoryStorage();
    storage.setItem(BOARD_KEY, JSON.stringify(['preampmkii-editor', 'retired-editor', 'moodmkii-editor']));
    const ui = createBoardUi(document, storage);
    expect(ui.board).toEqual(['preampmkii-editor', 'moodmkii-editor']);
    expect(p.shown()).toEqual(['preampmkii-editor', 'moodmkii-editor']);
    expect(p.toggle('preampmkii-editor').getAttribute('aria-pressed')).toBe('true');
    expect(p.toggle('genlossmkii-editor').getAttribute('aria-pressed')).toBe('false');
  });

  it('follows a change made in another tab', () => {
    const p = page();
    const storage = new MemoryStorage();
    createBoardUi(document, storage);
    storage.setItem(BOARD_KEY, JSON.stringify(['moodmkii-editor']));
    window.dispatchEvent(new StorageEvent('storage', { key: BOARD_KEY }));
    expect(p.shown()).toEqual(['moodmkii-editor']);
    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }));
    expect(p.shown()).toEqual(['moodmkii-editor']);
  });

  it('shows each pedal\'s MIDI channel: the stored one, else the editor default', () => {
    page();
    const storage = new MemoryStorage();
    storage.setItem('moodmkii_midichannel', '7');
    storage.setItem('preampmkii_midichannel', 'junk');
    createBoardUi(document, storage);
    expect(document.querySelector('[data-board-channel="moodmkii"]')!.textContent).toBe('ch 7');
    expect(document.querySelector('[data-board-channel="preampmkii"]')!.textContent).toBe('ch 1');
  });

  it('names the remembered MIDI interface when the site may already use Web MIDI', async () => {
    const p = page();
    const storage = new MemoryStorage();
    storage.setItem(BOARD_KEY, JSON.stringify(['moodmkii-editor']));
    storage.setItem('pedalzombie:midi-output', 'Volt 2');
    await createBoardUi(document, storage, () => {}, async () => ['IAC Driver Bus 1', 'Volt 2']).ready;
    expect(p.midi().hidden).toBe(false);
    expect(p.midi().classList.contains('is-ready')).toBe(true);
    expect(p.midi().textContent).toBe('Volt 2 ready');
  });

  it('says so when no interface is plugged in, and stays quiet without permission or without a board', async () => {
    const p = page();
    const storage = new MemoryStorage();
    storage.setItem(BOARD_KEY, JSON.stringify(['moodmkii-editor']));
    await createBoardUi(document, storage, () => {}, async () => []).ready;
    expect(p.midi().hidden).toBe(false);
    expect(p.midi().classList.contains('is-ready')).toBe(false);
    expect(p.midi().textContent).toBe('no MIDI interface found');

    const quiet = page();
    await createBoardUi(document, storage, () => {}, async () => null).ready;
    expect(quiet.midi().hidden).toBe(true);

    const empty = page();
    await createBoardUi(document, new MemoryStorage(), () => {}, async () => ['Volt 2']).ready;
    expect(empty.midi().hidden).toBe(true);
  });
});
