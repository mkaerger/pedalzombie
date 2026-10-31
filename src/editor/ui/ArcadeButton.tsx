import type { ArcadeOption } from '../core/types';

interface Props {
  label: string;
  value: number;
  options: ArcadeOption[];
  hint?: string;
  onChange: (value: number) => void;
}

/**
 * Arcade button with a coloured LED: a click on the button cycles through the
 * states like on the pedal, a click on a state name jumps there directly.
 */
export function ArcadeButton({ label, value, options, hint, onChange }: Props) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const current = options[index];
  const next = options[(index + 1) % options.length];

  return (
    <div className="arcade" title={hint}>
      <div className="arcade__states" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === current.value}
            className={`arcade__state arcade__state--${o.led}`}
            title={o.hint}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="arcade__button"
        aria-label={`${label}: ${current.label}. Press for ${next.label}`}
        onClick={() => onChange(next.value)}
      >
        <span className={`arcade__led led led--${current.led}`} aria-hidden="true" />
      </button>
      <span className="arcade__label">{label}</span>
    </div>
  );
}
