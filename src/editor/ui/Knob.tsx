import { useDragValue } from './useDragValue';

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
  const { active, handlers } = useDragValue({ value, min, max, defaultValue, onChange });
  const start = -SWEEP / 2;
  const angle = start + ((value - min) / (max - min)) * SWEEP;

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
        {...handlers}
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
