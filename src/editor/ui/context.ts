import { createContext, useContext, useSyncExternalStore } from 'react';
import type { Tracker } from '../core/analytics';
import type { EditorEngine } from '../core/engine';
import type { MidiConnection } from '../core/midi';
import type { PresetStore } from '../core/presets';

export interface EditorServices {
  engine: EditorEngine;
  midi: MidiConnection;
  presets: PresetStore;
  /** Base URL of the pedal's assets. */
  assets: string;
  /** Analytics event for this editor (no-op until the visitor accepted). */
  track: Tracker;
}

export const EditorContext = createContext<EditorServices | null>(null);

export function useEditor(): EditorServices {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor outside <Editor>');
  return ctx;
}

export function useEngineState() {
  const { engine } = useEditor();
  return useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
}

export function useMidiState() {
  const { midi } = useEditor();
  return useSyncExternalStore(midi.subscribe, midi.getState, midi.getState);
}
