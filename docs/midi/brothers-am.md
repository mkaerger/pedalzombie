# Brothers AM

Default channel 2. Save: **CC111 = slot (1–122)** or PC while holding both footswitches.
Source: Brothers-AM_MIDI-Manual (Chase Bliss × Analog Man) and Quick Start Guide.

Three circuits in series: treble booster → channel 1 → channel 2. No ramp speed CC, no ramp/bounce CC,
no factory reset, no MIDI clock.

## Knobs (0–127)
| CC | Control | Where |
|---|---|---|
| 14 | GAIN 2 | top left |
| 15 | VOLUME 2 | top middle |
| 16 | GAIN 1 | top right |
| 17 | TONE 2 | bottom left |
| 18 | VOLUME 1 | bottom middle |
| 19 | TONE 1 | bottom right |
| 27 | PRESENCE 2 | hidden: hold footswitch 2 + TONE 2 |
| 29 | PRESENCE 1 | hidden: hold footswitch 1 + TONE 1 |

## Toggles (left → right on the pedal)
| CC | Toggle | 0,1 | 2 | ≥3 |
|---|---|---|---|---|
| 21 | GAIN 2 TYPE | BOOST | OD | DIST |
| 22 | TREBLE BOOST | FULL SUN | OFF | HALF SUN |
| 23 | GAIN 1 TYPE | DIST | OD | BOOST |

The treble booster is linked to channel 1 and sits at the very front of the circuit.

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | CHANNEL 1 BYPASS (right switch) | 0 off, ≥1 on |
| 103 | CHANNEL 2 BYPASS (left switch) | 0 off, ≥1 on |

Holding a footswitch and turning TONE sets PRESENCE on the pedal; over MIDI use CC27/29 directly.

## Dip switches (0 off, ≥1 on)
| CC | Left bank (ramping) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | VOLUME 1 | 71 | HI GAIN 1 |
| 62 | VOLUME 2 | 72 | HI GAIN 2 |
| 63 | GAIN 1 | 73 | MOTOBYP 1 |
| 64 | GAIN 2 | 74 | MOTOBYP 2 |
| 65 | TONE 1 | 75 | PRES LINK 1 |
| 66 | TONE 2 | 76 | PRES LINK 2 |
| 67 | SWEEP (B=0, T≥1) | 77 | MASTER |
| 68 | POLARITY (F=0, R≥1) | — | BANK (no MIDI control) |

HI GAIN: +25 % gain, the channel LED turns red. MOTOBYP: footswitch becomes momentary. PRES LINK: TONE also
moves PRESENCE. MASTER: VOL 2 becomes a master volume.

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EOM (expression over MIDI) | 0–127 |
| 111 | PRESET SAVE | 1–122 |

PC n recalls slot n (122 slots), PC 0 = Live. Slot 1 = right toggle position, slot 2 = left.
