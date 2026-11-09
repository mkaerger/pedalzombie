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
 * Moves and the release are followed on the window, keyed by pointer id,
 * instead of trusting pointer capture: iOS Safari does not reliably deliver
 * captured pointer events for touches. A non-passive touchmove listener keeps
 * the page from scrolling where `touch-action: none` is not honoured.
 *
 * The wheel is deliberately not tied to focus: a focused control keeps its
 * focus while the page scrolls underneath the pointer and would otherwise
 * swallow the wheel and change its value "on hover".
 */
export function useDragValue({ value, min, max, defaultValue, onChange, range = 200 }: Options) {
  const drag = useRef<{ id: number; y: number; start: number; range: number } | null>(null);
  /** Clicked and the pointer has stayed on the control since: the wheel adjusts the value. */
  const armed = useRef(false);
  const [active, setActive] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v)));
  const set = (v: number) => {
    const c = clamp(v);
    if (c !== value) onChange(c);
  };
  const latest = useRef({ value, set });
  latest.current = { value, set };
  /** Ends the running drag and removes its window listeners. */
  const finish = useRef(() => {});

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button > 0) return; // secondary buttons; touch and pen report 0 or -1
    finish.current();
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId); // keeps hover styling and the cursor while dragging where supported
    } catch {
      // not available (old browsers, test DOM): the window listeners below do the work
    }
    el.focus({ preventScroll: true });
    armed.current = true;
    const d = { id: e.pointerId, y: e.clientY, start: value, range: typeof range === 'number' ? range : range(el) };
    drag.current = d;
    setActive(true);

    const move = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== d.id) return;
      const scale = ev.shiftKey ? 0.2 : 1;
      latest.current.set(d.start + ((d.y - ev.clientY) / d.range) * (max - min) * scale);
    };
    const up = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId === d.id) finish.current();
    };
    finish.current = () => {
      finish.current = () => {};
      drag.current = null;
      setActive(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };
  const onPointerLeave = () => {
    if (!drag.current) armed.current = false;
  };
  useEffect(() => () => finish.current(), []);

  // React registers wheel and touch listeners as passive, so preventDefault() would be ignored there.
  const element = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = element.current;
    if (!el) return;
    const onWheel = (e: globalThis.WheelEvent) => {
      if (!armed.current) return; // don't hijack page scrolling
      e.preventDefault();
      latest.current.set(latest.current.value + (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 1 : 4));
    };
    const onTouchMove = (e: globalThis.TouchEvent) => {
      if (drag.current) e.preventDefault(); // the finger adjusts the value, the page must not scroll
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
    };
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
    onPointerLeave,
    onKeyDown,
    onDoubleClick: () => set(defaultValue),
  };
  return { active, handlers };
}
