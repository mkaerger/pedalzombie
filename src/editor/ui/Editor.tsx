import { useEffect, useMemo, useSyncExternalStore, type CSSProperties } from 'react';
import { createTracker, watchMidi } from '../core/analytics';
import { EditorEngine } from '../core/engine';
import { createWebMidiBackend, MidiConnection } from '../core/midi';
import { PresetStore, type KeyValueStorage } from '../core/presets';
import { pedalBySlug } from '../../pedals';
import { EditorContext, type EditorServices } from './context';
import { MidiBar } from './MidiBar';
import { PedalFace } from './PedalFace';
import { IdeasPanel, MidiMonitor, PresetsPanel, SectionPanel, ToolsPanel } from './Panels';
import './editor.css';

/** localStorage can throw (private mode, blocked site data) — degrade to memory. */
function safeStorage(): KeyValueStorage {
  const memory = new Map<string, string>();
  return {
    getItem(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memory.get(key) ?? null;
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        memory.set(key, value);
      }
    },
  };
}

function useServices(slug: string): EditorServices {
  return useMemo(() => {
    const pedal = pedalBySlug(slug);
    if (!pedal) throw new Error(`Unknown pedal: ${slug}`);
    const storage = safeStorage();
    const midi = new MidiConnection(createWebMidiBackend(), storage, `${pedal.storageKey}_midichannel`, pedal.defaultChannel);
    const track = createTracker(pedal.storageKey);
    return {
      midi,
      engine: new EditorEngine(pedal, midi, { onEvent: track }),
      presets: new PresetStore(pedal, storage),
      assets: `/pedals/${pedal.storageKey}`,
      track,
    };
  }, [slug]);
}

export default function Editor({ slug }: { slug: string }) {
  const services = useServices(slug);
  const { engine, midi, track } = services;
  const { values } = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);

  useEffect(() => () => engine.dispose(), [engine]);
  useEffect(() => watchMidi(midi, track), [midi, track]);

  const theme = { ...engine.pedal.theme, ...engine.pedal.themeFor?.(values) };
  const style = {
    '--pedal-body': theme.body,
    '--pedal-ink': theme.ink,
    '--pedal-accent': theme.accent,
    '--pedal-knob': theme.knob,
    '--pedal-indicator': theme.knobIndicator,
  } as CSSProperties;

  return (
    <EditorContext.Provider value={services}>
      <div className="editor" style={style}>
        <MidiBar />
        <div className="editor__layout">
          <div className="editor__face">
            <PedalFace />
            <MidiMonitor />
          </div>
          <div className="editor__panels">
            {engine.pedal.sections.map((s) => (
              <SectionPanel key={s.id} section={s} />
            ))}
            <IdeasPanel />
            <PresetsPanel />
            <ToolsPanel />
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
}
