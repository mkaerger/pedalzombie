# Clean

Default channel 2. Save: **CC111 = slot (1–122)** or PC while holding both footswitches.
Source: Clean_Midi-Manual and Quick Start Guide. No MIDI clock / tap on this pedal.

## Knobs (0–127)
| CC | Control | Where |
|---|---|---|
| 14 | DYNAMICS | top left |
| 15 | SENSITIVITY (ramp) | top middle |
| 16 | WET | top right |
| 17 | ATTACK | bottom left |
| 18 | EQ | bottom middle |
| 19 | DRY | bottom right |
| 20 | RAMP SPEED | hidden |

## Toggles (left → right on the pedal)
| CC | Toggle | 0,1 | 2 | ≥3 |
|---|---|---|---|---|
| 21 | RELEASE | FAST | USER | SLOW |
| 22 | MODE (dynamic EQ) | SHIFTY | MANUAL | MODULATED |
| 23 | PHYSICS | WOBBLY | OFF | TWITCHY |

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS (right switch) | 0 off, ≥1 on |
| 103 or 105 | SWELL (left AUX switch) | 0 off, ≥1 on |
| 104 | ALT MENU (hold both) | 0 exit, ≥1 enter |
| 106 | DYNAMICS MAX (hold right switch) | 0 off, ≥1 on |

## Hidden options
| CC | Control | Values |
|---|---|---|
| 24 | NOISE GATE RELEASE | 0–127 |
| 25 | NOISE GATE SENS | 0–127 |
| 26 | SWELL IN | 0–127 |
| 27 | USER RELEASE | 0–127 (default 650 ms) |
| 28 | BALANCE FILTER | 0–127 |
| 29 | SWELL OUT | 0–127 |
| 31 | ENVELOPE MODE | 0,1 ANALOG · 2 HYBRID · ≥3 ADAPTIVE |
| 32 | SHIFTY MODE | 0,1 ASR SHIFTY · 3 ENV SHIFTY |
| 33 | SPREAD ROUTING | 0,1 EQ · 2 BOTH · ≥3 VOL/COMP |

## Dip switches (0 off, ≥1 on)
| CC | Left bank (ramping) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | DYNAMICS | 71 | MISO |
| 62 | ATTACK | 72 | SPREAD |
| 63 | EQ | 73 | LATCH |
| 64 | DRY | 74 | SIDECHAIN |
| 65 | WET | 75 | NOISE GATE |
| 66 | BOUNCE | 76 | MOTION |
| 67 | SWEEP (B=0, T≥1) | 77 | SWELL AUX |
| 68 | POLARITY (F=0, R≥1) | 78 | DUSTY |

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EOM (expression over MIDI) | 0–127 |
| 111 | PRESET SAVE | 1–122 |
| 52 | RAMP/BOUNCE | 0 off, ≥1 on |
| 56 | FACTORY RESET | 0–127 |

PC n recalls slot n (122 slots), PC 0 = Live. Slot 1 = right toggle position, slot 2 = left.
