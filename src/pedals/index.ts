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

const newestFirst = (a: PedalDefinition, b: PedalDefinition) => b.released.localeCompare(a.released);

/** All editors, newest pedal first (home page order). */
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
].sort(newestFirst);

/** The compact pedals and the Automatone series, each newest first. */
export const classicPedals = pedals.filter((p) => p.face.format === 'classic');
export const automatonePedals = pedals.filter((p) => p.face.format === 'automatone');

export function pedalBySlug(slug: string): PedalDefinition | undefined {
  return pedals.find((p) => p.slug === slug);
}
