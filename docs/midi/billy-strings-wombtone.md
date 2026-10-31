# Billy Strings Wombtone

Default channel **2**. Source: Billy_Strings_Wombtone_Midi_Manual_Pedal_Chase_Bliss (CBA + BS ref 2024 – WT03), with the
Billy Strings Wombtone manual ("A field guide to Wombtone", 2024) and Quick Start Guide.
Save: only PC while holding both footswitches (no save CC). 122 slots, PC 0 = Live ("matching the pedal's current
settings"), PC 1 = right toggle slot, PC 2 = left slot, empty slot = nothing recalled. Channel change: hold both
footswitches at power-up, the first *Program Change* sets the channel.

The CC map is the Wombtone MKII map in the new four-page layout: knobs, note divisions, bypass, tap, EOM and clock
ignore. **No CC is documented for the stage/tap toggle, the two wave-shape toggles, the three envelope toggles (ENV /
REL / SENS) or the sixteen dip switches**, although the user manual claims MIDI can "control all of the knobs and
toggles on the pedal" — UNVERIFIED whether CC21–23 move the toggles (CC21 is note divisions in this manual).

## Knobs (0–127)
| CC | Control | Notes |
|---|---|---|
| 14 | FEED (RAMP) | feedback / resonance; becomes the ramp-speed knob as soon as a left-bank parameter dip is on (hold the left footswitch to adjust FEED while ramping) |
| 15 | VOLUME | output level, internal voltage doubler, substantial boost |
| 16 | MIX | dry ↔ phase-shifted balance; classic phasing around noon, phase vibrato at 100 % |
| 17 | RATE | modulation speed; SLOW dip makes the range 4x slower; overridden by tap tempo |
| 18 | DEPTH | range of the sweep |
| 19 | FORM | centre point of the waveform (skew) |
| 20 | RAMP | ramp speed (its own CC although the panel has no separate RAMP knob; relation to CC14 is not explained — UNVERIFIED) |

## Note divisions and clock
| CC | Function | Values |
|---|---|---|
| 21 | MIDI NOTE DIVISIONS | value 0 = whole note · 1 = half note · 2 = quarter triplet · 3 = quarter note · 4 = eighth note · 5 = sixteenth note |
| 51 | MIDI CLOCK IGNORE | value 0 = off (ignore clock), value 127 = listening |

The MIDI manual does not state the PPQN or how the pedal-side tap division (TOGGLE dip: match / 2x / 4x) combines with
CC21; the quarter-triplet entry is carried over from the MKII manual although this pedal has no 3/6/8 bank — UNVERIFIED.

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS | value 0–63 = pedal off, 64–127 = pedal on |
| 93 | TAP | value 0–127 (the manual gives no value meaning; the editor sends 127 per tap) |

Hold functions on the pedal (no CCs): hold right 3 s then add left 3 s = save to the right slot, hold left first for the
left slot (middle LED blinks); hold left while turning FEED = adjust FEED during ramping; hold both at power-up = MIDI
channel learn. MOTOBYP dip makes BYPASS momentary. No alt menu, factory reset, MIDI reset or CC111 documented.

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EOM (expression over MIDI) | value 0–127, heel to toe; the left-bank dips choose the target knob(s) and the right-bank dips the polarity and sweep |

## Reference only — no MIDI control
| CC | Toggle | Left | Middle | Right |
|---|---|---|---|---|
| none | STG: 2 4 6 (default) / TAP: 1 2 4 (TOGGLE dip on) | two stages / tapped speed | four stages / 2x faster | six stages / 4x faster |
| none | front half of the wave (under DEPTH) | sine | triangle | square |
| none | back half of the wave (under FORM) | square | triangle | sine |
| none | PRESETS toggle (lower) | left slot (PC 2) | live (PC 0) | right slot (PC 1) |
| none | ◄ENV (right side) | envelope on | — | envelope off (saved with presets) |
| none | REL (left side, printed S L M) | short | medium (trimpot-adjustable) | long (global, not saved) |
| none | SENS (left side, printed L H M) | low | medium (trimpot-adjustable) | high (global, not saved) |

The printed order of the REL/SENS labels is S L M and L H M; which physical direction is "S"/"L" on a side-mounted
toggle is not drawn in the manual — UNVERIFIED (see the notes file). Envelope control replaces the LFO unless a
knob dip is on, in which case the envelope drives that knob instead; it cannot be combined with ramping or with a
plug in EXP/CV.

| CC | Left bank dip (expression / ramp, on = up) | CC | Right bank dip |
|---|---|---|---|
| none | VOLUME | none | VOLUME rise / fall |
| none | MIX | none | MIX rise / fall |
| none | RATE | none | RATE rise / fall |
| none | DEPTH | none | DEPTH rise / fall |
| none | FORM | none | FORM rise / fall |
| none | BOUNCE | none | TAP: R = TAP LED shows ramp speed (green), T = tap tempo |
| none | SLOW (RATE range 4x slower) | none | TOGGLE: T = left toggle is tap division, S = stages |
| none | MOTOBYP (momentary bypass) | none | SWEEP: T = knob → max, B = knob → min |

Compared with Wombtone MKII the right bank lost the Tap CONTROL (R/P) and Tap DIVISION (3/1) dips and the left bank
swapped STAGES for SLOW; there is no 3/6/8 division bank and no "tap sets the ramp rate" mode.
