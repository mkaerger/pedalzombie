/**
 * /llms.txt — a plain Markdown summary of the site for language models
 * (https://llmstxt.org): what pedalzombie is, what it needs, and one line per
 * editor. Built from the pedal definitions so new pedals appear by themselves.
 */
import type { PedalDefinition } from '../editor/core/types';

export interface LlmsSite {
  origin: string;
  classic: PedalDefinition[];
  automatone: PedalDefinition[];
}

const line = (origin: string, pedal: PedalDefinition): string =>
  `- [${pedal.manufacturer} ${pedal.name}](${origin}/${pedal.slug}/): ${pedal.tagline}`;

export function buildLlmsTxt({ origin, classic, automatone }: LlmsSite): string {
  const base = origin.replace(/\/$/, '');
  const count = classic.length + automatone.length;
  return [
    '# pedalzombie',
    '',
    '> Free Web MIDI editors for Chase Bliss guitar pedals that run in the browser. Every knob, toggle, dip switch,',
    '> footswitch function and hidden option of a pedal is drawn on screen and sent to the pedal as MIDI. No install,',
    '> no account; presets stay in the browser. Independent fan project by Marco from Munich, not affiliated with',
    '> Chase Bliss. Open source (MIT).',
    '',
    `pedalzombie covers ${count} pedals. It works in Chrome, Edge and Opera (the browsers with Web MIDI). You need a`,
    'MIDI interface and, for the classic pedals, a Chase Bliss MIDI box or a comparable TRS adapter; the Automatone',
    'pedals take a 5-pin MIDI cable directly. Features: randomize sounds, save presets in the browser, export and',
    'import preset files, store presets on the pedal, tap tempo, and "My board": the pedals a visitor owns, kept in',
    'the browser and exportable as one file.',
    '',
    '## Start here',
    '',
    `- [Setup](${base}/setup/): what you need and how to connect a pedal`,
    `- [Guide](${base}/guide/): how the editors work, presets, randomize, My board`,
    `- [About](${base}/about/): who makes pedalzombie and why`,
    `- [Source code](https://github.com/mkaerger/pedalzombie): GitHub repository, MIT license, MIDI reference tables in docs/midi`,
    '',
    '## Editors (classic pedals)',
    '',
    ...classic.map((p) => line(base, p)),
    '',
    '## Editors (Automatone series: motorized faders, 5-pin MIDI)',
    '',
    ...automatone.map((p) => line(base, p)),
    '',
    '## Optional',
    '',
    `- [Privacy](${base}/privacy/)`,
    `- [Legal notice](${base}/legal/)`,
    '',
  ].join('\n');
}
