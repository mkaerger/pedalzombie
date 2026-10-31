import { useState } from 'react';
import type { AutomatoneFace as AutomatoneFaceDef, PresetActivity } from '../core/types';
import { ControlView } from './ControlView';
import { useEditor, useEngineState } from './context';
import { Footswitch } from './Footswitch';
import { Led } from './widgets';

/** What the 7-segment display shows: the preset slot, "A" in the alt layer, "–" before any recall. */
export function displayText(preset: PresetActivity, shift: boolean, format: (slot: number) => string): string {
  if (shift) return 'A';
  if (preset.kind === 'recall' || preset.kind === 'store') return format(preset.slot);
  return '–';
}

function Display({ text, label }: { text: string; label: string }) {
  return (
    <output className="display" aria-label={label}>
      {text}
    </output>
  );
}

/**
 * The Automatone enclosure: six motorized faders, five arcade buttons, the
 * display between the LEDs, two footswitches. With an alt layer, SHIFT swaps
 * the faders and buttons for their alt controls like holding SHIFT on the pedal.
 */
export function AutomatoneFace({ face }: { face: AutomatoneFaceDef }) {
  const { engine } = useEditor();
  const state = useEngineState();
  const { name } = engine.pedal;
  const [shift, setShift] = useState(false);
  const leds = engine.pedal.leds(state);
  const label = (id: string | null | undefined) => (id ? engine.control(id)?.label : undefined);

  // in the alt layer a position without alt function keeps its primary control
  const layer = (primary: string[], alt?: (string | null)[]) =>
    primary.map((id, i) => {
      const altId = alt?.[i] ?? null;
      return shift && altId ? { id: altId, sub: label(id) } : { id, sub: label(altId) };
    });
  const faders = layer(face.faders, face.alt?.faders);
  const buttons = layer(face.buttons, face.alt?.buttons);
  const slotText = face.display ?? String;

  return (
    <section className="pedal pedal--automatone" aria-label={`${name} controls`}>
      <div className="automatone__head">
        <span className="automatone__name">{name}</span>
        {face.alt && (
          <button
            type="button"
            className={`automatone__shift${shift ? ' is-on' : ''}`}
            aria-pressed={shift}
            title="Show the alt functions of the faders and buttons"
            onClick={() => setShift((s) => !s)}
          >
            SHIFT
          </button>
        )}
      </div>

      <div className="automatone__faders">
        {faders.map(({ id, sub }) => (
          <div className="automatone__col" key={id}>
            <ControlView id={id} size="lg" />
            {sub && <span className="automatone__sub">{sub}</span>}
          </div>
        ))}
      </div>

      <div className="automatone__buttons">
        {buttons.map(({ id, sub }) => (
          <div className="automatone__col" key={id}>
            <ControlView id={id} size="lg" />
            {sub && <span className="automatone__sub">{sub}</span>}
          </div>
        ))}
      </div>

      <div className="automatone__bottom">
        <Footswitch fs={face.footswitches[0]} />
        <div className="automatone__status">
          <span className="automatone__led">
            <Led state={leds[0]} label={face.ledLabels[0]} />
            <small>{face.ledLabels[0]}</small>
          </span>
          <Display text={displayText(state.preset, shift, slotText)} label="Preset display" />
          <span className="automatone__led">
            <Led state={leds[1]} label={face.ledLabels[1]} />
            <small>{face.ledLabels[1]}</small>
          </span>
        </div>
        <Footswitch fs={face.footswitches[1]} />
      </div>
    </section>
  );
}
