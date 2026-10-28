import { useEditor, useEngineState } from './context';
import { Knob } from './Knob';
import { Fader, Segmented, Switch, Toggle } from './widgets';

/** Renders any control by id with the widget matching its kind. */
export function ControlView({ id, size }: { id: string; size?: 'lg' | 'md' }) {
  const { engine, assets } = useEditor();
  const { values } = useEngineState();
  const c = engine.control(id);
  if (!c) return null;
  const value = values[id];
  const set = (v: number) => engine.set(id, v);

  switch (c.kind) {
    case 'knob': {
      const readout = c.readout?.(value, values);
      return (
        <div className="control" title={c.hint}>
          <Knob
            label={c.labelFor?.(values) ?? c.label}
            value={value}
            min={c.min}
            max={c.max}
            defaultValue={c.default}
            detail={c.detail?.(values)}
            readout={readout?.label}
            size={size}
            onChange={set}
          />
          {readout?.image && <img className="control__image" src={`${assets}/${readout.image}`} alt="" width={29} height={29} />}
        </div>
      );
    }
    case 'fader':
      return <Fader label={c.label} value={value} min={c.min} max={c.max} onChange={set} />;
    case 'toggle':
      return <Toggle label={c.label} value={value} options={c.options} hint={c.hint} onChange={set} />;
    case 'switch':
      return (
        <Switch
          label={c.label}
          checked={value === c.on}
          offLabel={c.offLabel}
          onLabel={c.onLabel}
          hint={c.hint}
          onChange={(on) => set(on ? c.on : c.off)}
        />
      );
    case 'select':
      return <Segmented label={c.label} value={value} options={c.options} hint={c.hint} onChange={set} />;
    case 'value':
      return null;
  }
}
