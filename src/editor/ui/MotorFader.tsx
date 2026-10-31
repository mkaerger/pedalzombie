import { useDragValue } from './useDragValue';

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  defaultValue: number;
  detail?: string;
  readout?: string;
  onChange: (value: number) => void;
}

/** Vertical fader as on the Automatone face: drag the cap, scroll, or use the keyboard. Double-click resets. */
export function MotorFader({ label, value, min = 0, max = 127, defaultValue, detail, readout, onChange }: Props) {
  const { active, handlers } = useDragValue({
    value,
    min,
    max,
    defaultValue,
    onChange,
    // the cap travels the slot minus its own height, so a drag follows the pointer 1:1
    range: (el) => el.clientHeight - CAP_HEIGHT,
  });
  // 0–1, unitless so the CSS can multiply it with lengths and percentages
  const position = (value - min) / (max - min);

  return (
    <div className={`mfader${active ? ' is-active' : ''}`}>
      <div className="mfader__label">{label}</div>
      <div
        className="mfader__slot"
        role="slider"
        aria-orientation="vertical"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={readout ? `${value} (${readout})` : String(value)}
        style={{ ['--pos' as string]: String(position) }}
        {...handlers}
      >
        <span className="mfader__track" aria-hidden="true" />
        <span className="mfader__cap" aria-hidden="true">
          <span className="mfader__value">{value}</span>
        </span>
      </div>
      {detail && <div className="mfader__detail">{detail}</div>}
      {readout && <div className="mfader__readout">{readout}</div>}
    </div>
  );
}

/** Keep in sync with `.mfader__cap` height in editor.css. */
const CAP_HEIGHT = 34;
