# Wombtone MKII

Default channel **6**. Source: Wombtone_MKII_MIDI-Manual_Pedal_Chase-Bliss (2018) and Wombtone_MKII_Manual_Pedal_Chase-Bliss (2018).
Save: only PC while holding TAP + BYPASS (no save CC). 122 slots, PC 0 = Live, PC 1 = right toggle slot, PC 2 = left slot,
empty slot = nothing recalled. Channel change: hold both footswitches at power-up, the first *Program Change* sets the channel.

Old single-page manual format, identical to Spectre except for the knob names: only the knobs, note divisions, tap,
expression, bypass and clock ignore have CCs. **The three toggles, the preset toggle and all sixteen dip switches have no
MIDI control** — the number of phase stages (2 / 4 / 6) cannot be set over MIDI.

## Knobs (0–127, value 0 = fully counter-clockwise, 127 = fully clockwise)
| CC | Control | Notes |
|---|---|---|
| 14 | FEED (RAMP) | feedback / resonance; the same physical knob becomes the ramp-time knob when a left-bank parameter dip is on |
| 15 | VOLUME | output level, internal voltage doubler gives a large boost; sluggish under expression |
| 16 | MIX | fully dry to 100 % wet phase vibrato, classic phasing in the middle |
| 17 | RATE | LFO rate, very slow rates possible, overridden by tap tempo |
| 18 | DEPTH | sweep range |
| 19 | FORM | centre point / skew of the modulation wave, symmetric at noon |
| 20 | RAMP | ramp speed (listed as its own parameter although the panel has no separate RAMP knob; how CC14 and CC20 interact is not explained — UNVERIFIED) |

## Note divisions and clock
| CC | Function | Values |
|---|---|---|
| 21 | MIDI NOTE DIVISIONS | value 0 = whole note · 1 = half note · 2 = quarter-note triplet · 3 = quarter note · 4 = eighth note · 5 = sixteenth note |
| 51 | MIDI CLOCK IGNORE | value 0 = ignore MIDI clock, value 127 = listen (default: listen) |

MIDI clock: 24 PPQN per quarter note; one period of the phaser LFO corresponds to the selected note. On the pedal the
tap-division toggle picks the note (only while the Stages dip is off): first bank 1 = whole, 2 = half, 4 = quarter; second
bank (Tap Division dip in "3") 3 = quarter-note triplet, 6 = eighth, 8 = sixteenth.

## Footswitches
| CC | Function | Values |
|---|---|---|
| 93 | TAP SWITCH | any value simulates a tap; two taps set the tempo |
| 102 | BYPASS SWITCH | value 127 = engage, value 0 = bypass; 127 while already engaged resets any running ramp |

No hold function is documented for either footswitch (the Spectre's "hold TAP 1 s = reset ramp" is absent from this
manual). No alt menu, no factory-reset or MIDI-reset CC, no CC111.

## Expression
| CC | Function | Values |
|---|---|---|
| 100 | EXPRESSION | value 0 = heel (expression pedal "off"), 127 = toe; the left-bank dips choose which parameter(s) it drives |

## Reference only — no MIDI control
| CC | Toggle | Left | Middle | Right |
|---|---|---|---|---|
| none | 1/2/4 (3/6/8) tap division, or STG: 2/4/6 with the Stages dip on | one (three) / two stages | two (six) / four stages | four (eight) / six stages |
| none | left wave shape (first half of the wave) | sine | triangle | square |
| none | right wave shape (second half of the wave) | square | triangle | sine |
| none | preset toggle (lower) | left slot (PC 2) | live (PC 0) | right slot (PC 1) |

| CC | Left bank dip (ramping / expression, on = up) | CC | Right bank dip |
|---|---|---|---|
| none | VOLUME | none | VOLUME rise / fall |
| none | MIX | none | MIX rise / fall |
| none | RATE | none | RATE rise / fall |
| none | DEPTH | none | DEPTH rise / fall |
| none | FORM | none | FORM rise / fall |
| none | BOUNCE | none | (Tap) CONTROL: R = ramp, P = parameter (RPM) |
| none | STAGES (on = top toggle selects 2 / 4 / 6 stages) | none | (Tap) DIVISION: 3 = 3/6/8, 1 = 1/2/4 |
| none | MOTOBYP (momentary bypass) | none | SWEEP: T = knob → max, B = knob → min |

Dip positions are stored in presets and recalled with PC, so a slot can carry a different stage count or ramp setup.
