# Lossy

Default channel 2. Save: **CC111 = slot (0–122)** or PC while holding both footswitches.
Source: Lossy_Pedal_MIDI-Manual (Chase Bliss × Goodhertz) and Quick Start Guide. No MIDI clock / tap.

## Knobs (0–127)
| CC | Control | Where |
|---|---|---|
| 14 | FILTER | top left |
| 15 | GLOBAL (ramp) | top middle |
| 16 | REVERB (VERB) | top right |
| 17 | FREQ | bottom left |
| 18 | SPEED | bottom middle |
| 19 | LOSS | bottom right |
| 20 | RAMP SPEED | hidden |

## Toggles (left → right on the pedal)
| CC | Toggle | 0,1 | 2 | ≥3 |
|---|---|---|---|---|
| 21 | FILTER SLOPE | 6 dB | 24 dB | 96 dB |
| 22 | PACKET MODE | REPEAT | CLEAN | LOSS |
| 23 | LOSS MODE | INVERSE | STANDARD | JITTER |

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS (right switch) | 0 off, ≥1 on |
| 103 | FREEZE SLUSHIE (press left switch) | 0 off, ≥1 on |
| 104 | ALT MENU (hold both) | 0 exit, ≥1 enter |
| 105 | FREEZE SOLID (hold left switch) | 0 off, ≥1 on |
| 106 | GATE (hold right switch) | 0 off, ≥1 on |

## Hidden options
| CC | Control | Values |
|---|---|---|
| 24 | GATE | 0–127 |
| 25 | FREEZER | 0–127 |
| 26 | VERB DECAY | 0–127 |
| 27 | LIMITER THRESHOLD | 0–127 |
| 28 | AUTO GAIN | 0–127 |
| 29 | LOSS GAIN | 0–127 (±36 dB) |
| 33 | WEIGHTING | 0,1 DARK · 2 NEUTRAL · ≥3 BRIGHT |

## Dip switches (0 off, ≥1 on)
| CC | Left bank (ramping) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | FILTER | 71 | MISO |
| 62 | FREQ | 72 | SPREAD |
| 63 | SPEED | 73 | TRAILS |
| 64 | LOSS | 74 | LATCH |
| 65 | VERB | 75 | PRE/POST |
| 66 | BOUNCE | 76 | SLOW |
| 67 | SWEEP (B=0, T≥1) | 77 | INVERT |
| 68 | POLARITY (F=0, R≥1) | 78 | ALL WET |

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EOM (expression over MIDI) | 0–127 |
| 111 | PRESET SAVE | 0–122 |
| 52 | RAMP/BOUNCE | 0 off, ≥1 on |
| 56 | FACTORY RESET | 0–127 |
| 57 | DRY KILL | 0 off, ≥1 on |

PC n recalls slot n (122 slots), PC 0 = Live. Slot 1 = right toggle position, slot 2 = left.
