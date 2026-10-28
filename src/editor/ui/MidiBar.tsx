import { useEditor, useMidiState } from './context';

const CHANNELS = Array.from({ length: 16 }, (_, i) => i + 1);

export function MidiBar() {
  const { midi, engine } = useEditor();
  const { status, outputs, outputId, channel } = useMidiState();

  let message: string;
  switch (status) {
    case 'idle':
      message = 'Connect to your MIDI interface to control the pedal.';
      break;
    case 'connecting':
      message = 'Waiting for MIDI permission…';
      break;
    case 'unsupported':
      message = 'This browser does not support Web MIDI. Please use Chrome, Edge or Opera.';
      break;
    case 'denied':
      message = 'MIDI access was blocked. Allow MIDI for this site in the browser settings and reload.';
      break;
    case 'ready':
      message = outputs.length === 0 ? 'No MIDI output found — plug in your interface.' : outputId ? 'Connected.' : 'Select your MIDI output.';
  }
  const connected = status === 'ready' && outputId !== null;

  return (
    <div className={`midibar${connected ? ' is-connected' : ''}`}>
      <span className="midibar__status" role="status">
        <span className="midibar__dot" aria-hidden="true" />
        {message}
      </span>

      {status !== 'ready' ? (
        <button type="button" className="button button--primary" onClick={() => midi.connect()} disabled={status === 'connecting' || status === 'unsupported'}>
          Connect MIDI
        </button>
      ) : (
        <div className="midibar__controls">
          <label>
            <span>Output</span>
            <select value={outputId ?? ''} onChange={(e) => midi.selectOutput(e.target.value || null)}>
              <option value="">Select…</option>
              {outputs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Channel</span>
            <select value={channel} onChange={(e) => midi.setChannel(Number(e.target.value))}>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="button"
            disabled={!connected}
            title="Send every control of the editor to the pedal"
            onClick={() => engine.sendAll()}
          >
            Sync pedal
          </button>
        </div>
      )}
    </div>
  );
}
