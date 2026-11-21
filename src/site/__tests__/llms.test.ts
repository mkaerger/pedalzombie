import { describe, expect, it } from 'vitest';
import { automatonePedals, classicPedals, pedals } from '../../pedals';
import { buildLlmsTxt } from '../llms';

const txt = buildLlmsTxt({ origin: 'https://pedalzombie.com/', classic: classicPedals, automatone: automatonePedals });

describe('llms.txt', () => {
  it('starts with the title and a blockquote summary', () => {
    expect(txt.startsWith('# pedalzombie\n\n> ')).toBe(true);
  });

  it('lists every editor once with its absolute URL and tagline', () => {
    for (const pedal of pedals) {
      const link = `](https://pedalzombie.com/${pedal.slug}/): ${pedal.tagline}`;
      expect(txt.split(link)).toHaveLength(2);
    }
    expect(txt).toContain(`covers ${pedals.length} pedals`);
  });

  it('keeps the Automatone pedals in their own section', () => {
    const automatone = txt.indexOf('## Editors (Automatone');
    for (const pedal of automatonePedals) expect(txt.indexOf(`/${pedal.slug}/`)).toBeGreaterThan(automatone);
    for (const pedal of classicPedals) expect(txt.indexOf(`/${pedal.slug}/`)).toBeLessThan(automatone);
  });

  it('links the pages a reader needs first and never doubles slashes', () => {
    for (const path of ['/setup/', '/guide/', '/about/', '/privacy/']) expect(txt).toContain(`https://pedalzombie.com${path}`);
    expect(txt).not.toContain('.com//');
  });
});
