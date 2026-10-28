# Onward

Default channel 2. Save: **CC111 = slot (0–122)** or PC while holding both footswitches.
Source: Onward_MIDI-Manual and Quick Start Guide.

## Knobs (0–127)
| CC | Control | Where |
|---|---|---|
| 14 | SIZE | top left |
| 15 | MIX | top middle |
| 16 | OCTAVE | top right (noon = off; left half lower, right half upper octave) |
| 17 | ERROR | bottom left |
| 18 | SUSTAIN | bottom middle |
| 19 | TEXTURE | bottom right (noon = off; left sample-rate reduction, right soft clipping) |
| 20 | RAMP SPEED | hidden |

## Toggles (left → right on the pedal)
| CC | Toggle | 0,1 | 2 | ≥3 |
|---|---|---|---|---|
| 21 | ERROR TYPE | TIMING | CONDITION | PLAYBACK |
| 22 | FADE | LONG (slow) | USER | SHORT (fast) |
| 23 | ANIMATE | VIBRATO | OFF | CHORUS |

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | FREEZE BYPASS (right switch) | 0 off, ≥1 on |
| 103 | GLITCH BYPASS (left switch) | 0 off, ≥1 on |
| 104 | ALT MENU (hold both) | 0 exit, ≥1 enter |
| 105 | GLITCH HOLD (hold left switch) | 0 off, ≥1 on |
| 106 | FREEZE HOLD (hold right switch) | 0 off, ≥1 on |
| 108 | RETRIGGER GLITCH | any value |
| 109 | RETRIGGER FREEZE | any value |

## Hidden options
| CC | Control | Values |
|---|---|---|
| 24 | SENSITIVITY | 0–127 |
| 25 | BALANCE | 0–127 |
| 26 | DUCK DEPTH | 0–127 |
| 27 | ERROR BLEND | 0–127 |
| 28 | USER FADE | 0–127 |
| 29 | FILTER | 0–127 |
| 31 | ERROR ROUTING | 0,1 GLITCH · 2 BOTH · ≥3 FREEZE |
| 32 | SUSTAIN ROUTING | 0,1 GLITCH · 2 BOTH · ≥3 FREEZE |
| 33 | EFFECTS ROUTING | 0,1 GLITCH · 2 BOTH · ≥3 FREEZE |

## Dip switches (0 off, ≥1 on)
| CC | Left bank (ramping) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | SIZE | 71 | MISO |
| 62 | ERROR | 72 | SPREAD |
| 63 | SUSTAIN | 73 | LATCH |
| 64 | TEXTURE | 74 | SIDECHAIN |
| 65 | OCTAVE | 75 | DUCK |
| 66 | BOUNCE | 76 | REVERSE |
| 67 | SWEEP (B=0, T≥1) | 77 | 1/2 SPEED |
| 68 | POLARITY (F=0, R≥1) | 78 | MANUAL |

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EOM (expression over MIDI) | 0–127 |
| 111 | PRESET SAVE | 0–122 |
| 51 | MIDI CLOCK IGNORE | 0 ignore, >0 follow |
| 52 | RAMP/BOUNCE | 0 off, ≥1 on |
| 53 | MIDI SYNC SUBDIVISION | 0 whole · 1 dotted half · 2 half · 3 dotted quarter · 4 quarter · 5 dotted 8th · 6 8th · 7 8th triplet · 8 sixteenth |
| 56 | FACTORY RESET | 0–127 |
| 57 | DRY KILL | 0 off, ≥1 on |
| 58 | TRAILS | 0 off, ≥1 on |
| 93 or 107 | TAP TEMPO | any value |

PC n recalls slot n (122 slots), PC 0 = Live. Slot 1 = right toggle position, slot 2 = left.
