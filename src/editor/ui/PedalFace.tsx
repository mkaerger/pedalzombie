import type { PointerEvent } from 'react';
import type { Footswitch as FootswitchDef } from '../core/types';
import { ControlView } from './ControlView';
import { useEditor, useEngineState } from './context';
import { Led } from './widgets';

function Footswitch({ fs }: { fs: FootswitchDef }) {
  const { engine } = useEditor();
  const { held } = useEngineState();
  const isHeld = held.has(fs.id);

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
        aria-label={fs.hold ? `${fs.label} (hold: ${fs.hold.label})` : fs.label}
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
      <span className="footswitch__label">{isHeld && fs.hold ? fs.hold.label : fs.label}</span>
      {fs.hold && <span className="footswitch__hint">hold: {fs.hold.label}</span>}
    </div>
  );
}

function PresetToggle() {
  const { engine } = useEditor();
  const { preset } = useEngineState();
  const position = preset.kind === 'toggle' ? (preset.slot === 2 ? 'left' : 'right') : 'middle';
  const options = [
    { pos: 'left', label: 'Preset 2', title: 'Left preset (PC 2)' },
    { pos: 'middle', label: 'Live', title: 'Live (PC 0)' },
    { pos: 'right', label: 'Preset 1', title: 'Right preset (PC 1)' },
  ] as const;
  return (
    <div className="preset-toggle" role="radiogroup" aria-label="Preset toggle">
      {options.map((o) => (
        <button
          key={o.pos}
          type="button"
          role="radio"
          aria-checked={position === o.pos}
          title={o.title}
          className={position === o.pos ? 'is-selected' : undefined}
          onClick={() => engine.presetToggle(o.pos)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** The pedal enclosure: main knobs, toggles, LEDs, footswitches. */
export function PedalFace() {
  const { engine } = useEditor();
  const state = useEngineState();
  const { face, name } = engine.pedal;
  const leds = engine.pedal.leds(state);

  return (
    <section className="pedal" aria-label={`${name} controls`}>
      <div className="pedal__knobs">
        {face.knobs.map((row, i) => (
          <div className="pedal__row" key={i}>
            {row.map((id) => (
              <ControlView key={id} id={id} size="lg" />
            ))}
          </div>
        ))}
      </div>

      <div className="pedal__toggles">
        {face.toggles.map((id) => (
          <ControlView key={id} id={id} />
        ))}
      </div>

      <div className="pedal__name">{name}</div>

      <div className="pedal__leds">
        <Led state={leds[0]} label="Left" />
        <Led state={leds[1]} label="Preset" />
        <Led state={leds[2]} label="Right" />
      </div>

      <div className="pedal__switches">
        <Footswitch fs={face.footswitches[0]} />
        <PresetToggle />
        <Footswitch fs={face.footswitches[1]} />
      </div>
    </section>
  );
}
