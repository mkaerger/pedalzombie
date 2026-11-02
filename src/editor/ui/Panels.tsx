import { useId, useRef, useState, type ChangeEvent, type SubmitEvent, type ReactNode } from 'react';
import { BPM_MAX, BPM_MIN, parseBpm } from '../core/engine';
import type { PedalDefinition, Section } from '../core/types';
import { describeImport, PresetFileError, type StoredPreset } from '../core/presets';
import { ControlView } from './ControlView';
import { useEditor, useEngineState, useMidiState } from './context';
import { downloadJson, PRESET_FILE_MAX_BYTES, presetFilename, readText } from './files';
import { usePanelCollapsed } from './usePanelCollapsed';

/** A panel folds away by its title; what is folded is remembered per pedal, so the page can shrink to what you use. */
export function Panel({ id, title, children, className = '' }: { id: string; title: string; children: ReactNode; className?: string }) {
  const { engine } = useEditor();
  const [collapsed, toggle] = usePanelCollapsed(engine.pedal.storageKey, id);
  const bodyId = useId();
  return (
    <section className={`panel ${className}${collapsed ? ' is-collapsed' : ''}`}>
      <h2 className="panel__title">
        <button type="button" className="panel__toggle" aria-expanded={!collapsed} aria-controls={bodyId} onClick={toggle}>
          {title}
        </button>
      </h2>
      <div id={bodyId} className="panel__body" hidden={collapsed}>
        {children}
      </div>
    </section>
  );
}

export function SectionPanel({ section }: { section: Section }) {
  return (
    <Panel id={section.id} title={section.title}>
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
          case 'commands':
            return (
              <div key={i} className="block">
                {b.title && <h3 className="block__title">{b.title}</h3>}
                <CommandButtons ids={b.commands} />
              </div>
            );
          case 'custom':
            return null;
        }
      })}
    </Panel>
  );
}

/** Buttons for one-shot commands; those with `confirm` ask first, those with `enabled` grey out. */
function CommandButtons({ ids }: { ids: string[] }) {
  const { engine } = useEditor();
  const { values } = useEngineState();
  const commands = (engine.pedal.commands ?? []).filter((c) => ids.includes(c.id));
  return (
    <div className="button-row">
      {commands.map((c) => (
        <button
          key={c.id}
          type="button"
          className={c.confirm ? 'button button--danger' : 'button'}
          disabled={c.enabled ? !c.enabled(values) : false}
          title={c.hint}
          onClick={() => (!c.confirm || window.confirm(c.confirm)) && engine.command(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

/** Commands not already placed in a section's `commands` block. */
function unplacedCommands(pedal: PedalDefinition) {
  const placed = new Set(pedal.sections.flatMap((s) => s.blocks).flatMap((b) => (b.type === 'commands' ? b.commands : [])));
  return (pedal.commands ?? []).filter((c) => !placed.has(c.id)).map((c) => c.id);
}

export function IdeasPanel() {
  const { engine, assets } = useEditor();
  const ideas = engine.pedal.ideas;
  if (!ideas?.length) return null;
  return (
    <Panel id="ideas" title="Quick settings">
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

/** Tap button, current BPM and a validated BPM input — for every pedal with tap tempo. */
export function TempoBlock() {
  const { engine } = useEditor();
  const { tapBpm, values } = useEngineState();
  const { tap } = engine.pedal;
  const [input, setInput] = useState('');
  const errorId = useId();
  if (!tap) return null;

  const enabled = engine.tapEnabled;
  const parsed = parseBpm(input);
  const error = 'error' in parsed && input.trim() !== '' ? parsed.error : undefined;
  const current = tap.bpmControl ? values[tap.bpmControl] : tapBpm;

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ('bpm' in parsed && engine.setTempo(parsed.bpm)) setInput('');
  };

  return (
    <div className="block">
      <h3 className="block__title">Tempo</h3>
      <div className="button-row">
        <button type="button" className="button button--tap" disabled={!enabled} onPointerDown={() => enabled && engine.tap()}>
          Tap
        </button>
        <span className="bpm" aria-live="polite">
          {current ?? '–'} <small>BPM</small>
        </span>
        <form className="inline-form" onSubmit={submit} noValidate>
          <input
            type="text"
            inputMode="numeric"
            className="bpm-input"
            placeholder="BPM"
            aria-label="Set tempo in BPM"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            disabled={!enabled}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="button" disabled={!enabled || 'error' in parsed}>
            Set
          </button>
        </form>
      </div>
      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
      {!enabled && tap.disabledHint && <p className="hint">{tap.disabledHint}</p>}
      {enabled && !error && <p className="hint">Typed tempos are sent as two taps, {BPM_MIN}–{BPM_MAX} BPM.</p>}
    </div>
  );
}

export function ToolsPanel() {
  const { engine } = useEditor();
  const { pedal } = engine;

  return (
    <Panel id="tools" title="Tools">
      <div className="block">
        <h3 className="block__title">Randomize</h3>
        <div className="button-row">
          {pedal.random.map((g) => (
            <button key={g.id} type="button" className="button" onClick={() => engine.randomize(g.id)}>
              {g.label}
            </button>
          ))}
        </div>
        <LockSummary />
      </div>

      <div className="block">
        <h3 className="block__title">Reset</h3>
        <div className="button-row">
          <button type="button" className="button" onClick={() => engine.reset()}>
            Editor defaults
          </button>
          <CommandButtons ids={unplacedCommands(pedal)} />
        </div>
      </div>

      <TempoBlock />
    </Panel>
  );
}

/** Which controls Randomize leaves alone, and how to change that. */
export function LockSummary() {
  const { engine } = useEditor();
  const { locked } = useEngineState();
  const names = [...locked].map((id) => engine.control(id)?.label ?? id);
  return (
    <p className="hint">
      {names.length > 0 ? (
        <>
          Kept as they are: {names.join(', ')}.{' '}
          <button type="button" className="link-button" onClick={() => engine.unlockAll()}>
            Unlock all
          </button>
          {' · '}
        </>
      ) : null}
      Click the lock on a control to keep it when randomizing.
    </p>
  );
}

/** What the last export or import did, shown under the preset list until the next action. */
type Notice = { kind: 'ok' | 'error'; text: string };

export function PresetsPanel() {
  const { engine, presets, track } = useEditor();
  const { values } = useEngineState();
  const [list, setList] = useState<StoredPreset[]>(() => presets.list());
  const [name, setName] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const recall = engine.recallRange;
  const [slot, setSlot] = useState(Math.min(3, recall.last));
  const store = engine.pedal.presets.store;
  const { storageKey } = engine.pedal;

  const save = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    presets.save(name, values);
    track('preset_save');
    setList(presets.list());
    setName('');
    setNotice(null);
  };

  const remove = (p: StoredPreset) => {
    if (!window.confirm(`Delete preset "${p.name}"?`)) return;
    presets.remove(p.id);
    track('preset_delete');
    setList(presets.list());
    setNotice(null);
  };

  /** One preset, or all of them, as a file on the visitor's computer. */
  const exportFile = (p?: StoredPreset) => {
    const file = presets.export(p && [p.id]);
    downloadJson(presetFilename(storageKey, file.exportedAt, p?.name), file);
    track('preset_export', { presets: file.presets.length });
    setNotice({ kind: 'ok', text: p ? `Saved "${p.name}" as a file.` : `Saved ${list.length === 1 ? '1 preset' : `${list.length} presets`} as a file.` });
  };

  const importFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = ''; // the same file can be chosen again
    if (!file) return;
    try {
      if (file.size > PRESET_FILE_MAX_BYTES) throw new PresetFileError('This is not a pedalzombie preset file.');
      const result = presets.import(await readText(file));
      track('preset_import', { presets: result.added.length });
      setList(presets.list());
      setNotice({ kind: 'ok', text: describeImport(result) });
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof PresetFileError ? err.message : 'The file could not be read.' });
    }
  };

  return (
    <Panel id="presets" title="Presets">
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
                <button type="button" className="icon-button icon-button--quiet" aria-label={`Export ${p.name}`} title="Save as file" onClick={() => exportFile(p)}>
                  <DownloadIcon />
                </button>
                <button type="button" className="icon-button" aria-label={`Delete ${p.name}`} title="Delete" onClick={() => remove(p)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="button-row preset-files">
          {list.length > 0 && (
            <button type="button" className="button" onClick={() => exportFile()}>
              Export all
            </button>
          )}
          <button type="button" className="button" onClick={() => fileInput.current?.click()}>
            Import…
          </button>
          <input ref={fileInput} type="file" accept=".json,application/json" hidden aria-label="Preset file" onChange={importFile} />
        </div>
        {notice ? (
          <p className={notice.kind === 'error' ? 'field-error' : 'hint'} role={notice.kind === 'error' ? 'alert' : 'status'}>
            {notice.text}
          </p>
        ) : (
          <p className="hint">
            Export writes a file you can keep as a backup or pass on; Import adds the presets of such a file and never
            replaces the ones you have.
          </p>
        )}
      </div>

      <div className="block">
        <h3 className="block__title">On the pedal</h3>
        <div className="inline-form">
          <label>
            <span>{recall.label ?? 'Slot'}</span>
            <input type="number" min={recall.first} max={recall.last} value={slot} onChange={(e) => setSlot(Number(e.target.value))} />
          </label>
          {recall.format && <span className="hint">{recall.format(slot)}</span>}
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
            {engine.pedal.presets.manualStoreHint ??
              'This pedal saves presets only while both footswitches are held: hold them and press Recall to save into the slot.'}
          </p>
        )}
      </div>
    </Panel>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.5v8M4.8 7.5 8 10.7l3.2-3.2M3 13.5h10" />
    </svg>
  );
}

/** One formatter for the monitor: toLocaleTimeString builds a new one per call, 30× per render. */
const TIME = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

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
              <time>{TIME.format(e.at)}</time> {e.text}
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}
