# Reverse Mode C

Default channel 2. Save: **CC111 = slot (0–122)** or PC while holding both footswitches.
Source: Reverse-Mode-C_MIDI-Manual (Small Batch Bliss 2023 – RMC1) and Quick Start Guide.

## Knobs (0–127)
| CC | Control |
|---|---|
| 14 | TIME |
| 15 | MIX |
| 16 | FEEDBACK |
| 17 | OFFSET |
| 18 | BALANCE |
| 19 | FILTER |
| 20 | RAMP SPEED |

## Toggles
| CC | Toggle | 0,1 | 2 | ≥3 |
|---|---|---|---|---|
| 21 | MOD SYNC | SYNC | OFF | FREE |
| 22 | MOD TYPE | VIB | TREM | FREQ |
| 23 | SEQUENCE MODE | RUN | OFF | ENV |

MOD TYPE dip (CC78) selects the alternate flavour: vibrato → chorus, square tremolo → ramp-down tremolo,
frequency shift up → down.

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS | 0 off, ≥1 on |
| 93 or 103 | TAP | any value |
| 104 | ALT MENU (hold both) | 0 exit, ≥1 enter |
| 105 | FREEZE (hold left) | 0 off, ≥1 on |
| 106 | HALF SPEED (hold right) | 0 normal, ≥1 half speed |

## Hidden options
| CC | Control | Values |
|---|---|---|
| 24 | SEQUENCER SUBDIVISION | ×16 0–15 · ×8 16–31 · ×4 32–47 · ×2 48–63 · ×1 64–79 · ×½ 80–95 · ×¼ 96–111 · ×⅛ 112–127 |
| 25 | RAMPING WAVEFORM | 0–14 · 15–54 · 55–80 · 81–126 · 127 (5 shapes, as MOOD MKII) |
| 27 | MOD DEPTH | 0–127 |
| 28 | MOD RATE | 0–127 |
| 31 | OCTAVE TYPE | 0,1 oct down · 2 both · ≥3 oct up |
| 33 | SEQUENCE SPACING | 0,1 rest · ≥2 skip |

## Dip switches (0 off, ≥1 on)
| CC | Left bank (ramping) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | TIME | 71 | SWAP |
| 62 | OFFSET | 72 | MISO |
| 63 | BALANCE | 73 | SPREAD |
| 64 | FILTER | 74 | TRAILS |
| 65 | FEED | 75 | LATCH |
| 66 | BOUNCE | 76 | FEED TYPE |
| 67 | SWEEP (B=0, T≥1) | 77 | FADE TYPE |
| 68 | POLARITY (F=0, R≥1) | 78 | MOD TYPE |

SWAP only swaps the surface controls on the pedal (DEPTH/RATE ↔ OFFSET/BALANCE); the CCs stay the same.

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EOM (expression over MIDI) | 0–127 |
| 111 | PRESET SAVE | 0–122 |
| 93 | TAP TEMPO | 0–127 |
| 51 | MIDI CLOCK IGNORE | 0 clock off, ≥1 clock on |
| 52 | RAMP/BOUNCE | 0 off, ≥1 on |
| 56 | FACTORY RESET | 0–127 |
| 57 | DRY KILL | 0 off, ≥1 on |

No MIDI reset, no clock division CCs.
