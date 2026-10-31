import type { PedalDefinition } from '../editor/core/types';
import { badmood } from './badmood';
import { bigtime } from './bigtime';
import { blissfactory } from './blissfactory';
import { blooper } from './blooper';
import { brothersam } from './brothersam';
import { clean } from './clean';
import { condor, condorhifi } from './condor';
import { cxm } from './cxm';
import { darkworld } from './darkworld';
import { genlossmkii } from './genlossmkii';
import { gravitas } from './gravitas';
import { habit } from './habit';
import { lossy } from './lossy';
import { lostfound } from './lostfound';
import { mood } from './mood';
import { moodmkii } from './moodmkii';
import { onward } from './onward';
import { preampmkii } from './preampmkii';
import { reversemodec } from './reversemodec';
import { spectre } from './spectre';
import { thermae } from './thermae';
import { tonalrecall } from './tonalrecall';
import { warpedvinylhifi } from './warpedvinylhifi';
import { warpedvinylmkii } from './warpedvinylmkii';
import { billystringswombtone, wombtonemkii } from './wombtone';

/** Pedals whose MIDI map reaches the dip switches: the newer generation, listed first. */
export const hasDipSwitches = (pedal: PedalDefinition): boolean =>
  pedal.sections.some((section) => section.blocks.some((block) => block.type === 'dips'));

const newestFirst = (a: PedalDefinition, b: PedalDefinition) => b.released.localeCompare(a.released);

/** Dip-switch pedals before the older ones (and reissues of them), newest first within each group. */
const homeOrder = (a: PedalDefinition, b: PedalDefinition) =>
  Number(hasDipSwitches(b)) - Number(hasDipSwitches(a)) || newestFirst(a, b);

/** All editors in home page order. */
export const pedals: PedalDefinition[] = [
  badmood,
  bigtime,
  blissfactory,
  blooper,
  brothersam,
  clean,
  condor,
  condorhifi,
  cxm,
  darkworld,
  genlossmkii,
  gravitas,
  habit,
  lossy,
  lostfound,
  mood,
  moodmkii,
  onward,
  preampmkii,
  reversemodec,
  spectre,
  thermae,
  tonalrecall,
  warpedvinylhifi,
  warpedvinylmkii,
  wombtonemkii,
  billystringswombtone,
].sort(homeOrder);

/** The compact pedals and the Automatone series, each in home page order. */
export const classicPedals = pedals.filter((p) => p.face.format === 'classic');
export const automatonePedals = pedals.filter((p) => p.face.format === 'automatone');

export function pedalBySlug(slug: string): PedalDefinition | undefined {
  return pedals.find((p) => p.slug === slug);
}
