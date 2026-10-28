import { useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from 'react';

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  defaultValue: number;
  detail?: string;
  readout?: string;
  size?: 'lg' | 'md';
  onChange: (value: number) => void;
}

const SWEEP = 270;
/** Pixels of vertical drag for the full range; hold Shift for fine control. */
const DRAG_RANGE = 200;

function arc(r: number, from: number, to: number) {
  const p = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${50 + r * Math.cos(rad)} ${50 + r * Math.sin(rad)}`;
  };
  const large = to - from > 180 ? 1 : 0;
  return `M ${p(from)} A ${r} ${r} 0 ${large} 1 ${p(to)}`;
}

/** Rotary knob: drag vertically, scroll, or use the keyboard. Double-click resets. */
export function Knob({ label, value, min = 0, max = 127, defaultValue, detail, readout, size = 'md', onChange }: Props) {
  const drag = useRef<{ y: number; start: number } | null>(null);
  const [active, setActive] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v)));
  const set = (v: number) => {
    const c = clamp(v);
    if (c !== value) onChange(c);
  };

  const start = -SWEEP / 2;
  const angle = start + ((value - min) / (max - min)) * SWEEP;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    drag.current = { y: e.clientY, start: value };
    setActive(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const scale = e.shiftKey ? 0.2 : 1;
    set(drag.current.start + ((drag.current.y - e.clientY) / DRAG_RANGE) * (max - min) * scale);
  };
  const onPointerUp = () => {
    drag.current = null;
    setActive(false);
  };
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (document.activeElement !== e.currentTarget) return; // don't hijack page scrolling
    e.preventDefault();
    set(value + (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 1 : 4));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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

  return (
    <div className={`knob knob--${size}${active ? ' is-active' : ''}`}>
      <div
        className="knob__dial"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={readout ? `${value} (${readout})` : String(value)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        onDoubleClick={() => set(defaultValue)}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path className="knob__track" d={arc(46, start, start + SWEEP)} />
          {angle > start && <path className="knob__fill" d={arc(46, start, angle)} />}
          <circle className="knob__cap" cx="50" cy="50" r="36" />
          <line className="knob__pointer" x1="50" y1="50" x2="50" y2="20" transform={`rotate(${angle} 50 50)`} />
        </svg>
        <span className="knob__value">{value}</span>
      </div>
      <div className="knob__label">{label}</div>
      {detail && <div className="knob__detail">{detail}</div>}
      {readout && <div className="knob__readout">{readout}</div>}
    </div>
  );
}
