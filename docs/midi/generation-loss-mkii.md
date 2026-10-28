# Generation Loss MKII

Default channel 2. Save: **CC111 = slot (1–122)** or PC while holding both footswitches. No MIDI clock / tap.

## Knobs (0–127)
| CC | Control | Classic mode |
|---|---|---|
| 14 | WOW | |
| 15 | VOLUME | |
| 16 | MODEL | LOW PASS |
| 17 | FLUTTER | |
| 18 | SATURATE | GEN |
| 19 | FAILURE | HIGH PASS |
| 20 | RAMP SPEED | |

CC16 models: 0 off/unfiltered · 15 CPR-3300 Gen 1 · 24 Gen 2 · 33 Gen 3 · 43 Portamax-RT · 53 Portamax-HT · 62 CAM-8 · 72 DICTATRON-EX · 82 DICTATRON-IN · 91 FISHY 60 · 101 MS-WALKER · 111 AMU-2 · 127 M-PEX

## Hidden options
| CC | Control | Values |
|---|---|---|
| 24 | AUX ONSET TIME | 0–127 |
| 26 | DSP BYPASS | < 64 true bypass, > 64 DSP bypass |
| 27 | HISS LEVEL | 0–127 |
| 28 | MECHANICAL NOISE LEVEL | 0–127 |
| 29 | CRINKLE AND POP LEVEL | 0–127 |
| 32 | INPUT GAIN | 1 line · 2 instrument · 3 high gain |
| 52 | RAMP/BOUNCE | 0 off, ≥1 on |
| 100 | EOM | 0–127 |

## Toggles (1 left, 2 middle, 3 right)
| CC | Toggle |
|---|---|
| 21 | AUX |
| 22 | DRY |
| 23 | NOISE |

## Switches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS/ENGAGE | 0 off, ≥1 on |
| 103 | AUX | 0 off, ≥1 on |
| 104 | ALT (both hold) | **0 enter, ≥1 exit** |
| 105 / 106 / 107 | aux switch left / center / right | 0 off, ≥1 on |

## Dip switches (0 off, ≥1 on)
| CC | Left bank (ramping) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | WOW | 71 | POLARITY (F=0, R≥1) |
| 62 | FLUTTER | 72 | CLASSIC |
| 63 | SAT/GEN | 73 | MISO |
| 64 | FAILURE/HP | 74 | SPREAD |
| 65 | MODEL/LP | 75 | DRY TYPE |
| 66 | BOUNCE | 76 | DROP BYP |
| 67 | RANDOM | 77 | SNAG BYP |
| 68 | SWEEP (B=0, T≥1) | 78 | HUM BYP |

## Presets
| CC | Function | Values |
|---|---|---|
| 111 | PRESET SAVE | 1–122 |

PC n recalls slot n (122 slots), PC 0 = Live. Slot 1 = right toggle position, slot 2 = left.
Flipping the preset toggle to Live (or out and back in) resets all controls to their physical positions.
