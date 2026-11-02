/** Browser side of preset files: hand a JSON document to the visitor, read one they chose. */

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "MOOD MKII" → "mood-mkii"; never empty. */
export const fileSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'preset';

/** `pedalzombie-moodmkii-presets-2026-11-02.json`, or `pedalzombie-moodmkii-shimmer.json` for one preset. */
export function presetFilename(storageKey: string, exportedAt: string, presetName?: string) {
  const part = presetName ? fileSlug(presetName) : `presets-${exportedAt.slice(0, 10)}`;
  return `pedalzombie-${storageKey}-${part}.json`;
}

/** Preset files are a few KB; anything bigger is not one. */
export const PRESET_FILE_MAX_BYTES = 2_000_000;

export function readText(file: Blob): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsText(file);
  });
}
