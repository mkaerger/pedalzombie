# Spectre

Default channel **3**. Source: Spectre_MIDI-Manual_Pedal_Chase-Bliss (2016) and Spectre_Manual_Pedal_Chase-Bliss (2017).
Save: only PC while holding TAP + BYPASS (no save CC). 122 slots, PC 0 = Live, PC 1 = right toggle slot, PC 2 = left slot,
empty slot = nothing recalled. Channel change: hold both footswitches at power-up, the first *Program Change* sets the channel.

Old single-page manual format (like Warped Vinyl MKII): only the knobs, note divisions, tap, expression, bypass and clock
ignore have CCs. **The three toggles, the preset toggle and all sixteen dip switches have no MIDI control.**

## Knobs (0–127, value 0 = fully counter-clockwise, 127 = fully clockwise)
| CC | Control | Notes |
|---|---|---|
| 14 | MIX (RAMP) | wet/dry mix of the flange; the same physical knob becomes the ramp-time knob when a left-bank parameter dip is on |
| 15 | ZERO | manual delay time; the "zero point" sits between 1 and 3 o'clock |
| 16 | REGEN | regeneration, clockwise up to self-oscillation |
| 17 | RATE | LFO rate, overridden by tap tempo |
| 18 | WIDTH | sweep width |
| 19 | SHIFT | centre point / skew of the modulation wave, symmetric at noon |
| 20 | RAMP | ramp speed (listed as its own parameter although the panel has no separate RAMP knob; how CC14 and CC20 interact is not explained — UNVERIFIED) |

## Note divisions and clock
| CC | Function | Values |
|---|---|---|
| 21 | MIDI NOTE DIVISIONS | value 0 = whole note · 1 = half note · 2 = quarter-note triplet · 3 = quarter note · 4 = eighth note · 5 = sixteenth note |
| 51 | MIDI CLOCK IGNORE | value 0 = ignore MIDI clock, value 127 = listen (default: listen) |

MIDI clock: 24 PPQN per quarter note; one period of the LFO corresponds to the selected note. On the pedal the tap-division
toggle picks the note: first bank 1 = whole, 2 = half, 4 = quarter; second bank (Tap Division dip in "3") 3 = quarter-note
triplet, 6 = eighth, 8 = sixteenth.

## Footswitches
| CC | Function | Values |
|---|---|---|
| 93 | TAP SWITCH | any value simulates a tap; two taps set the tempo |
| 102 | BYPASS SWITCH | value 127 = engage, value 0 = bypass; 127 while already engaged resets any running ramp |

Holding TAP for 1 second while ramping resets the ramp (no CC documented for the hold). No second-footswitch hold CC, no
alt menu, no factory-reset or MIDI-reset CC, no CC111.

## Expression
| CC | Function | Values |
|---|---|---|
| 100 | EXPRESSION | value 0 = heel (expression pedal "off"), 127 = toe; the left-bank dips choose which parameter(s) it drives |

## Reference only — no MIDI control
| CC | Toggle | Left | Middle | Right |
|---|---|---|---|---|
| none | 1/2/4 (3/6/8) tap division | one | two | four (three / six / eight with the Tap Division dip in "3") |
| none | left wave shape (first half of the wave) | sine | triangle | square |
| none | right wave shape (second half of the wave) | square | triangle | sine |
| none | preset toggle (lower) | left slot (PC 2) | live (PC 0) | right slot (PC 1) |

| CC | Left bank dip (ramping / expression, on = up) | CC | Right bank dip |
|---|---|---|---|
| none | ZERO | none | ZERO rise / fall |
| none | REGEN | none | REGEN rise / fall |
| none | RATE | none | RATE rise / fall |
| none | WIDTH | none | WIDTH rise / fall |
| none | SHIFT | none | SHIFT rise / fall |
| none | BOUNCE | none | (Tap) CONTROL: R = ramp, P = parameter (RPM) |
| none | POLARITY (towards the knobs = negative flanging, default; other side = positive) | none | (Tap) DIVISION: 3 = 3/6/8, 1 = 1/2/4 |
| none | MOTOBYP (momentary bypass) | none | SWEEP: T = knob → max, B = knob → min |

Dip positions are stored in presets and recalled with PC, so a slot can carry a different polarity or ramp setup.
