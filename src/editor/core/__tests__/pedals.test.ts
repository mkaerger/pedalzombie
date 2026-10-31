import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { bounds, defaults, faceControlIds, hasOptions, messagesFor } from '../controls';
import { pedals } from '../../../pedals';
import type { FootswitchAction, PedalDefinition } from '../types';

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const HEX = /^#[0-9a-f]{6}$/i;

/**
 * CCs that the manual documents but the editor deliberately does not send.
 * 100 = expression over MIDI (depends on the physical dip switches), 104 = ALT/hidden menu
 * (the editor exposes the alt parameters directly), 93/103 = alternate tap CC, 105–107 on
 * Gen Loss = external aux switch, 102 on MOOD = "last saved bypass state" (CC103 is explicit).
 */
const NOT_SENT: Record<string, number[]> = {
  'moodmkii-editor': [93, 100, 104],
  'reversemodec-editor': [100, 103, 104],
  'generationloss-editor': [100, 104, 105, 106, 107],
  'warpedvinyl-editor': [100],
  'habit-editor': [100],
  'mood-editor': [100, 102],
  'brothersam-editor': [100],
  'clean-editor': [100, 104, 105],
  'onward-editor': [100, 104, 107],
  'lossy-editor': [100, 104],
  'lostfound-editor': [100, 104],
  'blooper-editor': [11, 100], // 11 = multi-control; the editor uses the individual transport CCs
  'badmood-editor': [100, 104],
};

/**
 * Every concrete footswitch action, incl. each branch a `by` action can take:
 * probed with the defaults and with every option of every option control set in turn.
 */
function footswitchActions(pedal: PedalDefinition): FootswitchAction[] {
  const base = defaults(pedal);
  const probes = [base, ...pedal.controls.flatMap((c) => (hasOptions(c) ? c.options.map((o) => ({ ...base, [c.id]: o.value })) : []))];
  const out: FootswitchAction[] = [];
  const visit = (a: FootswitchAction | undefined) => {
    if (!a) return;
    if (a.type === 'by') for (const p of probes) visit(a.action(p));
    else out.push(a);
  };
  for (const f of pedal.face.footswitches) for (const a of [f.press, f.hold]) visit(a);
  return out;
}

/** Every CC the editor can send for a pedal. */
function editorCcs(pedal: PedalDefinition) {
  const ccs = new Set<number>();
  const values = defaults(pedal);
  for (const c of pedal.controls) {
    if (c.cc !== undefined) ccs.add(c.cc);
    for (const m of messagesFor(c, values[c.id], values)) if (m.type === 'cc') ccs.add(m.cc);
  }
  for (const a of footswitchActions(pedal)) if (a.type === 'momentary') ccs.add(a.cc);
  if (pedal.tap) ccs.add(pedal.tap.cc);
  if (pedal.presets.store) ccs.add(pedal.presets.store.cc);
  for (const c of pedal.commands ?? []) ccs.add(c.cc);
  return ccs;
}

/** CC numbers from the tables in docs/midi: every cell that holds only numbers ("53 / 54", "107 (or 93)"). */
function documentedCcs(pedal: PedalDefinition) {
  const ccs = new Set<number>();
  const text = readFileSync(ROOT + pedal.midiReference, 'utf8');
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells[0] === 'CC' || cells[0].startsWith('-')) continue;
    for (const cell of cells) {
      if (!/^[\d\s/()or]+$/.test(cell)) continue;
      for (const n of cell.match(/\d+/g) ?? []) ccs.add(Number(n));
    }
  }
  return ccs;
}

/** Consistency checks that run for every pedal definition automatically. */
describe.each(pedals.map((p) => [p.name, p] as const))('%s definition', (_, pedal) => {
  const ids = new Set(pedal.controls.map((c) => c.id));
  const controlRefs = pedal.sections.flatMap((s) =>
    s.blocks.flatMap((b) =>
      b.type === 'controls' ? b.controls : b.type === 'dips' ? b.banks.flatMap((x) => x.controls) : b.type === 'select' ? [b.control] : [],
    ),
  );
  const faceRefs = faceControlIds(pedal.face);
  const commandStateRefs = (pedal.commands ?? []).flatMap((c) => Object.keys(c.then ?? {}));

  it('has unique control ids', () => {
    expect(ids.size).toBe(pedal.controls.length);
  });

  it('uses valid MIDI numbers and defaults within range', () => {
    for (const c of pedal.controls) {
      if (c.cc !== undefined) expect(c.cc, c.id).toBeGreaterThanOrEqual(0);
      if (c.cc !== undefined) expect(c.cc, c.id).toBeLessThanOrEqual(127);
      const [lo, hi] = bounds(c);
      expect(c.default, c.id).toBeGreaterThanOrEqual(lo);
      expect(c.default, c.id).toBeLessThanOrEqual(hi);
      expect(hi, c.id).toBeLessThanOrEqual(c.kind === 'value' ? 300 : 127);
    }
    expect(pedal.defaultChannel).toBeGreaterThanOrEqual(1);
    expect(pedal.defaultChannel).toBeLessThanOrEqual(16);
    if (pedal.presets.store) {
      // classic pedals: CC111 = 1–122; Automatones: CC27 = 0-based slot
      expect(pedal.presets.store.minSlot).toBeGreaterThanOrEqual(pedal.face.format === 'classic' ? 1 : 0);
      expect(pedal.presets.store.maxSlot).toBeLessThanOrEqual(pedal.face.format === 'classic' ? 122 : 127);
    }
  });

  it('does not map two widgets to the same CC', () => {
    const byCc = new Map<number, string>();
    for (const c of pedal.controls) {
      if (c.cc === undefined) continue;
      expect(byCc.get(c.cc), `CC ${c.cc}: ${c.id}`).toBeUndefined();
      byCc.set(c.cc, c.id);
    }
  });

  it('toggle, select and arcade options are distinct and in range', () => {
    for (const c of pedal.controls) {
      if (!hasOptions(c)) continue;
      const values = c.options.map((o) => o.value);
      expect(values.length, c.id).toBeGreaterThanOrEqual(2);
      expect(new Set(values).size, c.id).toBe(values.length);
      for (const v of values) expect(v, c.id).toBeGreaterThanOrEqual(0);
      for (const v of values) expect(v, c.id).toBeLessThanOrEqual(127);
    }
  });

  it('only references existing controls', () => {
    const refs = [
      ...faceRefs,
      ...pedal.random.flatMap((g) => g.controls),
      ...controlRefs,
      ...commandStateRefs,
      ...(pedal.tap?.bpmControl ? [pedal.tap.bpmControl] : []),
      ...(pedal.ideas ?? []).flatMap((g) => g.items.flatMap((i) => Object.keys(i.values))),
    ];
    for (const r of refs) expect(ids.has(r), r).toBe(true);
    const commandIds = new Set((pedal.commands ?? []).map((c) => c.id));
    const commandRefs = [
      ...footswitchActions(pedal).flatMap((a) => (a.type === 'command' ? [a.id] : [])),
      ...pedal.sections.flatMap((s) => s.blocks).flatMap((b) => (b.type === 'commands' ? b.commands : [])),
    ];
    for (const r of commandRefs) expect(commandIds.has(r), `command ${r}`).toBe(true);
  });

  it('shows every control somewhere in the UI', () => {
    const placed = new Set([
      ...faceRefs,
      ...controlRefs,
      ...commandStateRefs,
      ...(pedal.tap?.bpmControl ? [pedal.tap.bpmControl] : []),
    ]);
    for (const id of ids) expect(placed.has(id), `${id} is not reachable in the UI`).toBe(true);
  });

  it('has two footswitches and unique ids for sections, groups and commands', () => {
    expect(pedal.face.footswitches).toHaveLength(2);
    const unique = (xs: string[]) => expect(new Set(xs).size, xs.join()).toBe(xs.length);
    unique(pedal.face.footswitches.map((f) => f.id));
    unique(pedal.sections.map((s) => s.id));
    unique(pedal.random.map((g) => g.id));
    unique((pedal.commands ?? []).map((c) => c.id));
  });

  it('never randomizes the tempo', () => {
    const bpm = pedal.tap?.bpmControl;
    if (bpm) for (const g of pedal.random) expect(g.controls, g.id).not.toContain(bpm);
  });

  it('has a complete theme and one LED state per LED on the face', () => {
    for (const colour of Object.values(pedal.theme)) expect(colour).toMatch(HEX);
    const leds = pedal.leds({ values: defaults(pedal), held: new Set(), preset: { kind: 'live' } });
    expect(leds).toHaveLength(pedal.face.format === 'classic' ? 3 : 2);
  });

  it('places six faders and five arcade buttons on an Automatone face', () => {
    const face = pedal.face;
    if (face.format !== 'automatone') return;
    expect(face.faders).toHaveLength(6);
    expect(face.buttons).toHaveLength(5);
    for (const id of face.faders) expect(pedal.controls.find((c) => c.id === id)?.kind, id).toBe('fader');
    for (const id of face.buttons) expect(pedal.controls.find((c) => c.id === id)?.kind, id).toBe('arcade');
    if (face.alt) {
      expect(face.alt.faders).toHaveLength(6);
      expect(face.alt.buttons).toHaveLength(5);
    }
    expect(pedal.presets.toggle).toBe(false);
  });

  it('keeps the legacy storage key and editor URL', () => {
    expect(pedal.storageKey).toMatch(/^[a-z]+$/);
    expect(pedal.slug).toMatch(/-editor$/);
    expect(pedal.released).toMatch(/^20\d\d-(0[1-9]|1[0-2])$/);
  });

  it('sends only CCs that the manual documents, and all of them', () => {
    const sent = editorCcs(pedal);
    const documented = documentedCcs(pedal);
    expect(documented.size).toBeGreaterThan(5);
    for (const cc of sent) expect(documented.has(cc), `CC ${cc} is sent but not in ${pedal.midiReference}`).toBe(true);
    const skipped = new Set(NOT_SENT[pedal.slug]);
    for (const cc of documented) {
      expect(sent.has(cc) || skipped.has(cc), `CC ${cc} is documented in ${pedal.midiReference} but never sent`).toBe(true);
    }
  });
});
