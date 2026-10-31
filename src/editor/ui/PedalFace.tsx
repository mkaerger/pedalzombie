import { AutomatoneFace } from './AutomatoneFace';
import { ClassicFace } from './ClassicFace';
import { useEditor } from './context';

/** The pedal enclosure, rendered by the component for its format. */
export function PedalFace() {
  const { face } = useEditor().engine.pedal;
  return face.format === 'automatone' ? <AutomatoneFace face={face} /> : <ClassicFace face={face} />;
}
