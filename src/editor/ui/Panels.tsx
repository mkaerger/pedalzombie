import { useState, type SubmitEvent, type ReactNode } from 'react';
import type { Section } from '../core/types';
import type { StoredPreset } from '../core/presets';
import { ControlView } from './ControlView';
import { useEditor, useEngineState, useMidiState } from './context';

export function Panel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      <h2 className="panel__title">{title}</h2>
      {children}
    </section>
  );
}

export function SectionPanel({ section }: { section: Section }) {
  return (
    <Panel title={section.title}>
      {section.blocks.map((b, i) => {
        switch (b.type) {
          case 'controls':
            return (
              <div key={i} className="block">
                {b.title && <h3 className="block__title">{b.title}</h3>}
                <div className="grid" style={{ ['--cols' as string]: b.columns ?? 3 }}>
                  {b.controls.map((id) => (
                    <ControlView key={id} id={id} />
                  ))}
                </div>
              </div>
            );
          case 'dips':
            return (
              <div key={i} className="dips">
                {b.banks.map((bank) => (
                  <div key={bank.title} className="dips__bank">
                    <h3 className="block__title">{bank.title}</h3>
                    {bank.controls.map((id) => (
                      <ControlView key={id} id={id} />
                    ))}
                  </div>
                ))}
              </div>
            );
          case 'select':
            return (
              <div key={i} className="block">
                <ControlView id={b.control} />
              </div>
            );
          case 'custom':
            return null;
        }
      })}
    </Panel>
  );
}

export function IdeasPanel() {
  const { engine, assets } = useEditor();
  const ideas = engine.pedal.ideas;
  if (!ideas?.length) return null;
  return (
    <Panel title="Quick settings">
      {ideas.map((group) => (
        <div key={group.title} className="block">
          <h3 className="block__title">{group.title}</h3>
          <div className="ideas">
            {group.items.map((item) => (
              <button key={item.label} type="button" className="idea" onClick={() => engine.setMany(item.values)}>
                {item.image && <img src={`${assets}/${item.image}`} alt="" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </Panel>
  );
}

export function ToolsPanel() {
  const { engine } = useEditor();
  const { tapBpm, values } = useEngineState();
  const { pedal } = engine;
  const bpmId = pedal.tap?.bpmControl;
  const [bpmInput, setBpmInput] = useState('');

  const submitBpm = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bpm = Number(bpmInput);
    if (bpm >= 20 && bpm <= 300) engine.setTempo(bpm);
    setBpmInput('');
  };

  return (
    <Panel title="Tools">
      <div className="block">
        <h3 className="block__title">Randomize</h3>
        <div className="button-row">
          {pedal.random.map((g) => (
            <button key={g.id} type="button" className="button" onClick={() => engine.randomize(g.id)}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="block">
        <h3 className="block__title">Reset</h3>
        <div className="button-row">
          <button type="button" className="button" onClick={() => engine.reset()}>
            Editor defaults
          </button>
          {pedal.commands?.map((c) => (
            <button
              key={c.id}
              type="button"
              className={c.confirm ? 'button button--danger' : 'button'}
              onClick={() => (!c.confirm || window.confirm(c.confirm)) && engine.command(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {pedal.tap && (
        <div className="block">
          <h3 className="block__title">Tempo</h3>
          <div className="button-row">
            <button type="button" className="button button--tap" onPointerDown={() => engine.tap()}>
              Tap
            </button>
            <span className="bpm" aria-live="polite">
              {(bpmId ? values[bpmId] : tapBpm) ?? '–'} <small>BPM</small>
            </span>
            {bpmId && (
              <form className="inline-form" onSubmit={submitBpm}>
                <input
                  type="number"
                  min={20}
                  max={300}
                  placeholder="BPM"
                  aria-label="Set tempo in BPM"
                  value={bpmInput}
                  onChange={(e) => setBpmInput(e.target.value)}
                />
                <button type="submit" className="button">
                  Set
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

export function PresetsPanel() {
  const { engine, presets, track } = useEditor();
  const { values } = useEngineState();
  const [list, setList] = useState<StoredPreset[]>(() => presets.list());
  const [name, setName] = useState('');
  const [slot, setSlot] = useState(3);
  const store = engine.pedal.presets.store;

  const save = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    presets.save(name, values);
    track('preset_save');
    setList(presets.list());
    setName('');
  };

  const remove = (p: StoredPreset) => {
    if (!window.confirm(`Delete preset "${p.name}"?`)) return;
    presets.remove(p.id);
    track('preset_delete');
    setList(presets.list());
  };

  return (
    <Panel title="Presets">
      <div className="block">
        <h3 className="block__title">In this browser</h3>
        <form className="inline-form" onSubmit={save}>
          <input
            type="text"
            maxLength={40}
            placeholder="Preset name"
            aria-label="Preset name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="button button--primary" disabled={!name.trim()}>
            Save
          </button>
        </form>
        {list.length === 0 ? (
          <p className="hint">No presets yet. They are stored in this browser only — clearing site data deletes them.</p>
        ) : (
          <ul className="preset-list">
            {list.map((p) => (
              <li key={p.id}>
                <button type="button" className="preset-list__load" onClick={() => engine.load(p.values)}>
                  {p.name}
                </button>
                <button type="button" className="icon-button" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="block">
        <h3 className="block__title">On the pedal</h3>
        <div className="inline-form">
          <label>
            <span>Slot</span>
            <input type="number" min={1} max={122} value={slot} onChange={(e) => setSlot(Number(e.target.value))} />
          </label>
          <button type="button" className="button" onClick={() => engine.recall(slot)}>
            Recall
          </button>
          {store && (
            <button
              type="button"
              className="button"
              disabled={slot < store.minSlot || slot > store.maxSlot}
              onClick={() => window.confirm(`Overwrite slot ${slot} on the pedal?`) && engine.store(slot)}
            >
              Store
            </button>
          )}
        </div>
        {!store && (
          <p className="hint">
            This pedal saves presets only while both footswitches are held: hold them and press <em>Recall</em> to save into the slot.
          </p>
        )}
      </div>
    </Panel>
  );
}

export function MidiMonitor() {
  const { log } = useMidiState();
  return (
    <details className="monitor">
      <summary>MIDI monitor</summary>
      {log.length === 0 ? (
        <p className="hint">Nothing sent yet.</p>
      ) : (
        <ol>
          {log.map((e) => (
            <li key={e.id}>
              <time>{new Date(e.at).toLocaleTimeString()}</time> {e.text}
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}
