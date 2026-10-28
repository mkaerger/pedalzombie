/**
 * Tap tempo: averages the intervals of the most recent taps. A pause longer
 * than `resetAfterMs` starts a new measurement, so old taps never skew the
 * result (the 2023 editors averaged over stale taps and divided by a fixed 5).
 */
export class TapTempo {
  private taps: number[] = [];

  constructor(
    private readonly maxIntervals = 4,
    private readonly resetAfterMs = 2000,
  ) {}

  /** Register a tap; returns the BPM once two taps exist. */
  tap(now: number): number | undefined {
    const last = this.taps.at(-1);
    if (last !== undefined && now - last > this.resetAfterMs) this.taps = [];
    this.taps.push(now);
    if (this.taps.length > this.maxIntervals + 1) this.taps.shift();
    return this.bpm();
  }

  bpm(): number | undefined {
    if (this.taps.length < 2) return undefined;
    const span = this.taps.at(-1)! - this.taps[0];
    const avgMs = span / (this.taps.length - 1);
    return avgMs > 0 ? Math.round(60000 / avgMs) : undefined;
  }

  reset() {
    this.taps = [];
  }
}
