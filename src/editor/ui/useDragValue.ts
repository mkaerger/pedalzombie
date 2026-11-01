import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

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
 * after clicking (until the pointer leaves), arrow / page / home / end keys,
 * double-click resets.
 *
 * The wheel is deliberately not tied to focus: a focused control keeps its
 * focus while the page scrolls underneath the pointer and would otherwise
 * swallow the wheel and change its value "on hover".
 */
export function useDragValue({ value, min, max, defaultValue, onChange, range = 200 }: Options) {
  const drag = useRef<{ y: number; start: number; range: number } | null>(null);
  /** Clicked and the pointer has stayed on the control since: the wheel adjusts the value. */
  const armed = useRef(false);
  const [active, setActive] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v)));
  const set = (v: number) => {
    const c = clamp(v);
    if (c !== value) onChange(c);
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return; // primary button or touch only
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    armed.current = true;
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
  const onPointerLeave = () => {
    if (!drag.current) armed.current = false;
  };
  // React registers wheel listeners as passive, so preventDefault() would be ignored there;
  // the page must not scroll while the wheel adjusts the value.
  const element = useRef<HTMLDivElement | null>(null);
  const latest = useRef({ value, set });
  latest.current = { value, set };
  useEffect(() => {
    const el = element.current;
    if (!el) return;
    const onWheel = (e: globalThis.WheelEvent) => {
      if (!armed.current) return; // don't hijack page scrolling
      e.preventDefault();
      latest.current.set(latest.current.value + (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 1 : 4));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
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
    ref: element,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onLostPointerCapture: onPointerUp,
    onPointerLeave,
    onKeyDown,
    onDoubleClick: () => set(defaultValue),
  };
  return { active, handlers };
}
