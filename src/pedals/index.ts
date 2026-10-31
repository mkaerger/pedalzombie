import type { PedalDefinition } from '../editor/core/types';
import { badmood } from './badmood';
import { bigtime } from './bigtime';
import { blooper } from './blooper';
import { brothersam } from './brothersam';
import { clean } from './clean';
import { cxm } from './cxm';
import { genlossmkii } from './genlossmkii';
import { habit } from './habit';
import { lossy } from './lossy';
import { lostfound } from './lostfound';
import { mood } from './mood';
import { moodmkii } from './moodmkii';
import { onward } from './onward';
import { preampmkii } from './preampmkii';
import { reversemodec } from './reversemodec';
import { warpedvinylmkii } from './warpedvinylmkii';

const newestFirst = (a: PedalDefinition, b: PedalDefinition) => b.released.localeCompare(a.released);

/** All editors, newest pedal first (home page order). */
export const pedals: PedalDefinition[] = [
  badmood,
  bigtime,
  blooper,
  brothersam,
  clean,
  cxm,
  genlossmkii,
  habit,
  lossy,
  lostfound,
  mood,
  moodmkii,
  onward,
  preampmkii,
  reversemodec,
  warpedvinylmkii,
].sort(newestFirst);

/** The compact pedals and the Automatone series, each newest first. */
export const classicPedals = pedals.filter((p) => p.face.format === 'classic');
export const automatonePedals = pedals.filter((p) => p.face.format === 'automatone');

export function pedalBySlug(slug: string): PedalDefinition | undefined {
  return pedals.find((p) => p.slug === slug);
}
