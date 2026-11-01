import { useEditor, useEngineState } from './context';

/** Padlock on a control: locked controls keep their value when randomizing. */
export function Lock({ id, label }: { id: string; label: string }) {
  const { engine } = useEditor();
  const { locked } = useEngineState();
  const on = locked.has(id);
  return (
    <button
      type="button"
      className={`lock${on ? ' is-locked' : ''}`}
      aria-pressed={on}
      aria-label={`Keep ${label} when randomizing`}
      title={on ? 'Kept when randomizing — click to unlock' : 'Keep when randomizing'}
      onClick={() => engine.toggleLock(id)}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="3" y="7" width="10" height="7.5" rx="1.5" />
        <path className="lock__shackle" d="M5 7V5a3 3 0 0 1 6 0v2" />
      </svg>
    </button>
  );
}

/** Wraps a widget with its lock when some Randomize button touches the control. */
export function Lockable({ id, label, kind, children }: { id: string; label: string; kind: string; children: React.ReactNode }) {
  const { engine } = useEditor();
  if (!engine.lockable.has(id)) return <>{children}</>;
  return (
    <div className={`lockable lockable--${kind}`}>
      {children}
      <Lock id={id} label={label} />
    </div>
  );
}
