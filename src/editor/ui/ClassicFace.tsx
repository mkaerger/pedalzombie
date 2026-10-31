import type { ClassicFace as ClassicFaceDef, LedState } from '../core/types';
import { ControlView } from './ControlView';
import { useEditor, useEngineState } from './context';
import { Footswitch } from './Footswitch';
import { Led } from './widgets';

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

/** Push button on the pedal's edge (Blooper's modifier buttons): a latching switch with its own LED. */
function PushButton({ id, led }: { id: string; led: LedState }) {
  const { engine } = useEditor();
  const { values } = useEngineState();
  const control = engine.control(id);
  if (control?.kind !== 'switch') return null;
  const on = values[id] === control.on;
  return (
    <div className="push-button">
      <Led state={led} label={control.label} />
      <button
        type="button"
        className="push-button__button"
        aria-pressed={on}
        title={control.hint}
        onClick={() => engine.set(id, on ? control.off : control.on)}
      />
      <span className="push-button__label">{control.label}</span>
    </div>
  );
}

/** The compact enclosure: main knobs, toggles, three LEDs, footswitches with the preset toggle between them. */
export function ClassicFace({ face }: { face: ClassicFaceDef }) {
  const { engine } = useEditor();
  const state = useEngineState();
  const { name, presets } = engine.pedal;
  const leds = engine.pedal.leds(state);
  const buttonLeds = engine.pedal.buttonLeds?.(state) ?? [];

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
        {face.centerToggle ? <ControlView id={face.centerToggle} /> : presets.toggle !== false ? <PresetToggle /> : <span />}
        <Footswitch fs={face.footswitches[1]} />
      </div>

      {face.buttons && (
        <div className="pedal__buttons">
          {face.buttons.map((id, i) => (
            <PushButton key={id} id={id} led={buttonLeds[i] ?? { color: 'off' }} />
          ))}
        </div>
      )}
    </section>
  );
}
