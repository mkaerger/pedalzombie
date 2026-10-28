import type { PedalDefinition } from '../editor/core/types';
import { brothersam } from './brothersam';
import { clean } from './clean';
import { genlossmkii } from './genlossmkii';
import { habit } from './habit';
import { lossy } from './lossy';
import { lostfound } from './lostfound';
import { mood } from './mood';
import { moodmkii } from './moodmkii';
import { onward } from './onward';
import { reversemodec } from './reversemodec';
import { warpedvinylmkii } from './warpedvinylmkii';

/** All editors, newest pedal first (home page order). */
export const pedals: PedalDefinition[] = [
  brothersam,
  clean,
  genlossmkii,
  habit,
  lossy,
  lostfound,
  mood,
  moodmkii,
  onward,
  reversemodec,
  warpedvinylmkii,
].sort((a, b) => b.released.localeCompare(a.released));

export function pedalBySlug(slug: string): PedalDefinition | undefined {
  return pedals.find((p) => p.slug === slug);
}
