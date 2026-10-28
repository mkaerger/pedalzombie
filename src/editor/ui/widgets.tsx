import { useId } from 'react';
import type { LedState, Option } from '../core/types';

/** 2- or 3-position lever switch, rendered as a radio group. */
export function Toggle({
  label,
  value,
  options,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  options: Option[];
  hint?: string;
  onChange: (value: number) => void;
}) {
  const name = useId();
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <fieldset className="toggle" title={hint}>
      <legend className="toggle__label">{label}</legend>
      <div className="toggle__track" style={{ ['--pos' as string]: index, ['--count' as string]: options.length }}>
        <span className="toggle__lever" aria-hidden="true" />
        {options.map((o) => (
          <label key={o.value} className={`toggle__option${o.value === value ? ' is-selected' : ''}`}>
            <input type="radio" name={name} checked={o.value === value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** On/off switch (dip switches and settings). */
export function Switch({
  label,
  checked,
  offLabel,
  onLabel,
  hint,
  onChange,
}: {
  label: string;
  checked: boolean;
  offLabel?: string;
  onLabel?: string;
  hint?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`switch${checked ? ' is-on' : ''}`} title={hint}>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch__body" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
      <span className="switch__text">
        <span className="switch__label">{label}</span>
        {(offLabel || onLabel) && <span className="switch__state">{checked ? onLabel : offLabel}</span>}
      </span>
    </label>
  );
}

export function Fader({
  label,
  value,
  min = 0,
  max = 127,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="fader">
      <label htmlFor={id} className="fader__label">
        {label} <output>{value}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        style={{ ['--fill' as string]: `${((value - min) / (max - min)) * 100}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** One-of-many as a button grid (clock divisions). */
export function Segmented({
  label,
  value,
  options,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  options: Option[];
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend>{label}</legend>
      {hint && <p className="hint">{hint}</p>}
      <div className="segmented__grid">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={o.value === value ? 'is-selected' : undefined}
            aria-pressed={o.value === value}
            title={o.hint}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Led({ state, label }: { state: LedState; label: string }) {
  return (
    <span
      // re-mount on flash key change to restart the CSS animation
      key={state.flash}
      role="img"
      aria-label={`${label} LED: ${state.color}`}
      className={`led led--${state.color}${state.blinkMs ? ' is-blinking' : ''}${state.flash ? ' is-flashing' : ''}${state.dim ? ' is-dim' : ''}`}
      style={state.blinkMs ? { ['--blink' as string]: `${state.blinkMs}ms` } : undefined}
    />
  );
}
