# Big Time (Automatone)

Default channel 2. Source: Big Time_MIDI Manual (CBA + EAE ref 2026 - BT001), Big Time Manual and Quick Start
Guide (Chase Bliss × Electronic Audio Experiments, 2026).

**Automatone format:** 5-pin DIN MIDI IN and MIDI OUT (thru by default, clock out with CC 110). Six motorized
faders with an alt function each (hold SHIFT = the SCALE button), five arcade buttons with four states (LED
off / blue / red / purple) and an alt function each, a 7-segment display, two LEDs. **No live state and no preset
toggle:** "127 total slots", recalled with **PC = slot** and saved with **CC 27 = slot** or **CC 28 = current
slot** (any value). Loading an empty slot loads a default delay. Whether PC 127 is a valid slot is not
documented; the editor uses 0–126.

**Channel change:** hold both footswitches at power-up; the first PC *or CC* received sets the channel.

## Faders (0–127)
| CC | Fader | Alt (SHIFT) | CC |
|---|---|---|---|
| 14 | COLOR | TEXTURE | 32 |
| 15 | TIME | RATE | 33 |
| 16 | CLUSTER | DEPTH | 34 |
| 17 | TILT EQ | CROSSOVER | 35 |
| 18 | FEEDBACK | DIFFUSION | 36 |
| 19 | WET | DRY | 37 |

## Buttons (0-based; the last state is "3 or more")
| CC | Button | 0 (off) | 1 (blue) | 2 (red) | 3 (purple) |
|---|---|---|---|---|---|
| 22 | SCALE | Off | Chromatic | Oct+4+5 | Octave |
| 23 | MOTION | Off | Sine | Square | Env |
| 24 | MODE | Mod (3–46 ms) | Short (46–736 ms) | Long (736 ms – 12.2 s) | Loop |
| 25 | VOICING | HiFi | Focus | Warm | Analog |
| 26 | STATE | Digital | Compressed | Saturated | #!&% |

## Alt buttons (SHIFT + button)
| CC | Function | Values |
|---|---|---|
| 38 | SPREAD (MOTION alt) | 0 off, 1 blue = offsets CLUSTER + MOTION for widening, 2 (or more) red = ping-pong |
| 39 | 0.5X (MODE alt) | 0 normal, 1 (or more) = 12-bit at half the sample rate |
| 40 | DIFFUSE TYPE (VOICING alt) | 0 normal, 1 (or more) double |
| 41 | +12 dB (STATE alt) | 0 normal, 1 (or more) +12 dB preamp boost |

## Options menu
| CC | Option | Values |
|---|---|---|
| 42 | PLAY / DUB | 0 play, 1 (or more) dub |
| 43 | SCALE IGNORE | 0 off, 1 (or more) on |
| 44 | STEP | 0 off, 1 (or more) on |
| 45 | TRAILS | 0 off, 1 (or more) on |
| 46 | DRY KILL | 0 off, 1 (or more) on |
| 47 | DRY CLEAN | 0 off, 1 (or more) on |
| 48 | BALANCED / UNBALANCED | 0 balanced, 1 (or more) unbalanced |

## Footswitches — the same CCs mean different things in LOOP mode
| CC | Delay modes (MOD / SHORT / LONG) | LOOP mode | Values |
|---|---|---|---|
| 102 | BYPASS (tap right switch) | PLAY / STOP (tap right switch) | delay: 0 off, 1 (or more) on; loop: 0–127 |
| 103 | TAP / MOD ENGAGE (tap left switch) | REC / PLAY / DUB (tap left switch) | 0–127 |
| 104 | — | RECORD | 0–127 |
| 105 | — | PLAY | 0–127 |
| 106 | HOLD (hold switch) | DELETE | delay: 0 off, 1 (or more) on; loop: 0–127 |
| 107 | — | STOP | 0–127 |

In the delay modes the left switch is tap tempo (SHORT / LONG) or motion on/off (MOD). The manual lists "0–127"
for the loop functions and the tap without saying whether 0 counts; the editor sends 127. In LOOP mode the
editor's bypass switch sends nothing on CC 102 (it would mean play / stop) — use the looper commands instead.

## Tap subdivisions
| CC | Function | Values |
|---|---|---|
| 54 | TAP SUBDIVISIONS | 0 sixteenth · 1 eighth triplet · 2 dotted sixteenth · 3 eighth · 4 quarter triplet · 5 dotted eighth · 6 quarter · 7 half triplet · 8 dotted quarter · 9 half · 10 whole triplet · 11 (or more) dotted half |

## Other
| CC | Function | Values |
|---|---|---|
| 27 | SAVE TO SLOT | value = slot |
| 28 | SAVE TO CURRENT SLOT | any value |
| 100 | EOM (expression over MIDI) | 0–127 (not sent by the editor) |
| 101 | EOM DISENGAGE | any value; semantics undocumented (not sent by the editor) |
| 110 | MIDI CLOCK | 0 no clock, 1 clock in, 2 (or more) clock out (60–240 BPM from the MIDI OUT jack); not available in MOD mode |
| 112 | MIDI NOTES | 0 off, 1 channel, 2 (or more) global; the manual does not explain what notes do |

MIDI clock in: with SCALE Off / Chromatic the TIME fader bends the buffer and settles on the nearest subdivision;
with Oct+4+5 / Octave the quarter note sits at the centre of TIME. The pedal does not transmit its state.
