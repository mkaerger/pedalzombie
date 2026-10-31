import { useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from 'react';

interface Options {
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
  /** Pixels of vertical drag for the full range; a function measures the element. Hold Shift for fine control. */
  range?: number | ((el: HTMLElement) => number);
}

/**
 * Shared interaction of knobs and faders: drag vertically (up = more), scroll
 * while focused, arrow / page / home / end keys, double-click resets.
 */
export function useDragValue({ value, min, max, defaultValue, onChange, range = 200 }: Options) {
  const drag = useRef<{ y: number; start: number; range: number } | null>(null);
  const [active, setActive] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v)));
  const set = (v: number) => {
    const c = clamp(v);
    if (c !== value) onChange(c);
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    drag.current = { y: e.clientY, start: value, range: typeof range === 'number' ? range : range(e.currentTarget) };
    setActive(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const scale = e.shiftKey ? 0.2 : 1;
    set(drag.current.start + ((drag.current.y - e.clientY) / drag.current.range) * (max - min) * scale);
  };
  const onPointerUp = () => {
    drag.current = null;
    setActive(false);
  };
  const onWheel = (e: WheelEvent<HTMLElement>) => {
    if (document.activeElement !== e.currentTarget) return; // don't hijack page scrolling
    e.preventDefault();
    set(value + (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 1 : 4));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 10 : 1;
    const next: Record<string, number> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + 16,
      PageDown: value - 16,
      Home: min,
      End: max,
    };
    if (e.key in next) {
      e.preventDefault();
      set(next[e.key]);
    }
  };

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onWheel,
    onKeyDown,
    onDoubleClick: () => set(defaultValue),
  };
  return { active, handlers };
}
