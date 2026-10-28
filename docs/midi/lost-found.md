# Lost + Found

Default channel 2. Save: **CC111 = slot** or PC while holding both footswitches.
Source: Lost-Found_MIDI-Manual and Quick Start Guide.

## Knobs (0–127)
| CC | Control | Where |
|---|---|---|
| 14 | L TIME | top left |
| 15 | MIX (ramp) | top middle |
| 16 | R TIME | top right |
| 17 | L MODIFY | bottom left (A below noon, B above noon, noon = no effect) |
| 18 | BLEND | bottom middle |
| 19 | R MODIFY | bottom right (A / B as above) |

## Toggles (left → right on the pedal)
| CC | Toggle | 0,1 | 2 | ≥3 |
|---|---|---|---|---|
| 21 | L EFFECTS MODE | 1 REVERB | 2 PITCH | 3 WARP |
| 22 | ROUTING | L▸R | L+R | L◂R |
| 23 | R EFFECTS MODE | 4 DELAY | 5 SYNTH | 6 BEND |
| 32 | SPREAD (hidden) | L ONLY | BOTH | R ONLY |

Modes (A = MODIFY below noon, B = above noon):

| Mode | Name | TIME | MODIFY | ALT |
|---|---|---|---|---|
| 1A | Slow-verb | size | decay | diffusion |
| 1B | Useful Ambience | size | decay | diffusion |
| 2A | Orchestral Swell | swell time | pitch | feedback |
| 2B | Pitch Repeater | delay | pitch | number of repeats |
| 3A | Pinging Phaser | rate | poles | resonance |
| 3B | Spectral Modulator | rate | depth | resonance |
| 4A | Tape Echo | delay time | feedback | stability |
| 4B | Grain Tumbler | grain size | feedback | grain shape |
| 5A | Impulse Synthesizer | portamento | texture | attack / release |
| 5B | Sympathic Resonator | onset | feedback | octave |
| 6A | Ensemble Expander | rate | depth | number of voices |
| 6B | Gen Lite | rate | depth | drops and snags |

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | R FOOTSWITCH | 0 off, ≥1 on |
| 103 | L FOOTSWITCH | 0 off, ≥1 on |
| 104 | ALT MENU (hold both) | 0 exit, ≥1 enter |
| 105 | L HOLD (hold left switch) | 0 off, ≥1 on |
| 106 | R HOLD (hold right switch) | 0 off, ≥1 on |

Hold = mode-specific secondary function (e.g. tape stop, grain pattern).

## Hidden options
| CC | Control | Values |
|---|---|---|
| 20 | RAMP SPEED | 0–127 |
| 24 | L ALT | 0–127 |
| 25 | SPILL | 0–127 |
| 26 | R ALT | 0–127 |
| 27 | L EQ | 0–127 |
| 28 | GLUE | 0–127 |
| 29 | R EQ | 0–127 |
| 30 | MASTER WET VOLUME | 0–127 |

## Dip switches (0 off, ≥1 on)
| CC | Left bank (ramping) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | L TIME | 71 | MISO |
| 62 | L MODIFY | 72 | SPREAD |
| 63 | BLEND | 73 | LATCH |
| 64 | R MODIFY | 74 | L SWAP |
| 65 | R TIME | 75 | R SWAP |
| 66 | BOUNCE | 76 | UNSYNC |
| 67 | SWEEP (B=0, T≥1) | 77 | TRAILS |
| 68 | POLARITY (F=0, R≥1) | 78 | BANK |

L SWAP / R SWAP replace a channel's effects with those of the other channel.

## Other
| CC | Function | Values |
|---|---|---|
| 51 | MIDI CLOCK IGNORE | 0 ignore, ≥1 follow |
| 52 | STOP RAMPING | 0 ramping stopped, ≥1 ramping runs (manual: "on = 0, off = 1 or >") |
| 53 | L TAP SUBDIVISION | see below |
| 54 | R TAP SUBDIVISION | see below |
| 56 | FACTORY RESET | any value |
| 57 | DRY KILL | 0 off, ≥1 on |
| 93 | TAP TEMPO | any value |
| 100 | EOM (expression over MIDI) | 0–127 |
| 111 | SAVE PRESET | preset # = value |
| 112 | RANDOM L MODE | any value |
| 113 | RANDOM R MODE | any value |
| 114 | RANDOM BOTH MODES | any value |

Subdivisions (CC53 / CC54): 0 thirty-second · 1 sixteenth · 2 triplet sixteenth · 3 eighth · 4 triplet eighth ·
5 dotted eighth · 6 quarter · 7 triplet quarter · 8 dotted quarter · 9 half · 10 dotted half · 11 whole ·
>11 double whole.

PC n recalls slot n (122 slots), PC 0 = Live. Slot 1 = right toggle position, slot 2 = left.
