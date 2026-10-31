// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ArcadeOption } from '../../core/types';
import { ArcadeButton } from '../ArcadeButton';
import { Knob } from '../Knob';
import { MotorFader } from '../MotorFader';
import { displayText } from '../AutomatoneFace';

afterEach(cleanup);

const STATES: ArcadeOption[] = [
  { value: 1, label: 'Room', led: 'off' },
  { value: 2, label: 'Plate', led: 'blue' },
  { value: 3, label: 'Hall', led: 'red' },
];

describe('ArcadeButton', () => {
  it('cycles through the states on the button and wraps around', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ArcadeButton label="TYPE" value={1} options={STATES} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /TYPE: Room/ }));
    expect(onChange).toHaveBeenLastCalledWith(2);
    rerender(<ArcadeButton label="TYPE" value={3} options={STATES} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /TYPE: Hall/ }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('jumps straight to a state by its name and shows its LED colour', () => {
    const onChange = vi.fn();
    render(<ArcadeButton label="TYPE" value={2} options={STATES} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Hall' }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole('radio', { name: 'Plate' })).toHaveProperty('ariaChecked', 'true');
    expect(document.querySelector('.arcade__led')?.className).toContain('led--blue');
  });

  it('falls back to the first state for an unknown value', () => {
    render(<ArcadeButton label="TYPE" value={99} options={STATES} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /TYPE: Room/ })).toBeTruthy();
  });
});

describe('MotorFader', () => {
  const setup = (value = 64) => {
    const onChange = vi.fn();
    render(<MotorFader label="BASS" value={value} defaultValue={50} onChange={onChange} />);
    return { onChange, slider: screen.getByRole('slider', { name: 'BASS' }) };
  };

  it('is a vertical slider that follows the keyboard', () => {
    const { onChange, slider } = setup();
    expect(slider.getAttribute('aria-orientation')).toBe('vertical');
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    fireEvent.keyDown(slider, { key: 'ArrowDown', shiftKey: true });
    fireEvent.keyDown(slider, { key: 'PageUp' });
    fireEvent.keyDown(slider, { key: 'End' });
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([65, 54, 80, 127, 0]);
  });

  it('clamps at the ends and resets to the default on double-click', () => {
    const { onChange, slider } = setup(127);
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.doubleClick(slider);
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it('follows a drag 1:1 along the slot', () => {
    const { onChange, slider } = setup(0);
    Object.defineProperty(slider, 'clientHeight', { value: 134 }); // slot 134 px, cap 34 px → 100 px of travel
    slider.setPointerCapture = () => {};
    fireEvent.pointerDown(slider, { clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(slider, { clientY: 250 }); // 50 px up = half the range
    expect(onChange).toHaveBeenLastCalledWith(64);
    fireEvent.pointerUp(slider);
    fireEvent.pointerMove(slider, { clientY: 100 }); // released: no more changes
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('Knob (shared drag behaviour)', () => {
  it('scrolls only while focused and ignores wheel events otherwise', () => {
    const onChange = vi.fn();
    render(<Knob label="MIX" value={10} defaultValue={0} onChange={onChange} />);
    const dial = screen.getByRole('slider', { name: 'MIX' });
    fireEvent.wheel(dial, { deltaY: -1 });
    expect(onChange).not.toHaveBeenCalled();
    dial.focus();
    fireEvent.wheel(dial, { deltaY: -1 });
    expect(onChange).toHaveBeenLastCalledWith(14);
  });
});

describe('displayText', () => {
  it('shows the slot, "A" in the alt layer and a dash before any recall', () => {
    const bank = (slot: number) => String(slot % 10);
    expect(displayText({ kind: 'live' }, false, bank)).toBe('–');
    expect(displayText({ kind: 'recall', slot: 17, flip: false }, false, bank)).toBe('7');
    expect(displayText({ kind: 'store', slot: 3, at: 1 }, false, String)).toBe('3');
    expect(displayText({ kind: 'recall', slot: 17, flip: false }, true, bank)).toBe('A');
  });
});
