import type { PointerEvent } from 'react';
import type { Footswitch as FootswitchDef } from '../core/types';
import { useEditor, useEngineState } from './context';

/** A footswitch: press / hold with pointer or keyboard, labels may follow the current values. */
export function Footswitch({ fs }: { fs: FootswitchDef }) {
  const { engine } = useEditor();
  const { held, values } = useEngineState();
  const isHeld = held.has(fs.id);
  const label = fs.labelFor?.(values) ?? fs.label;
  const holdLabel = fs.hold ? (fs.hold.labelFor?.(values) ?? fs.hold.label) : undefined;

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    engine.pressStart(fs.id);
  };

  return (
    <div className="footswitch">
      <button
        type="button"
        className={`footswitch__button${isHeld ? ' is-held' : ''}`}
        aria-label={holdLabel ? `${label} (hold: ${holdLabel})` : label}
        onPointerDown={down}
        onPointerUp={() => engine.pressEnd(fs.id)}
        onPointerCancel={() => engine.pressEnd(fs.id, true)}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            engine.pressStart(fs.id);
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') engine.pressEnd(fs.id);
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      <span className="footswitch__label">{isHeld && holdLabel ? holdLabel : label}</span>
      {holdLabel && <span className="footswitch__hint">hold: {holdLabel}</span>}
    </div>
  );
}
