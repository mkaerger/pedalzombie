# Tonal Recall

Default channel 2. Save: only PC while holding TAP + BYPASS (no save CC documented).
Source: Tonal-Recall_MIDI-Manual_Pedal_Chase-Bliss (PDF dated 2016); panel and dip labels from
Tonal-Recall_Manual_Pedal_Chase-Bliss (2017) and Tonal-Recall-RKM_Manual_Pedal_Chase-Bliss (2017).

Short one-page MIDI manual. It documents **no dip-switch CCs** (no 61–68 / 71–78), **no toggle CCs 22 / 23** (the S/L/B
and wave-shape toggles are not MIDI-controllable), no hold CC for the TAP/HOLD runaway function, no CC103, no CC111
and no factory reset. CC21 is MIDI note divisions, not a toggle.

**Tonal Recall RKM** ("Red Knob Mod", 4 × MN3005, max 1100 ms instead of 550 ms) has no MIDI manual of its own; its user
manual says "Much more information on this in the MIDI manual" and has the same controls, so it shares this mapping.
UNVERIFIED by a separate document.

## Knobs
| CC | Control | Values |
|---|---|---|
| 14 | TONE (becomes RAMP speed when a ramping dip is on) | value 0 = fully counter-clockwise, value 127 = fully clockwise |
| 15 | MIX | value 0–127, as above |
| 16 | RATE | value 0–127, as above |
| 17 | TIME | value 0–127, as above |
| 18 | REGEN | value 0–127, as above |
| 19 | DEPTH | value 0–127, as above |
| 20 | RAMP | value 0–127, as above |

TIME is overridden by tap tempo. Max delay: S = 20–275 ms, L = 40–550 ms (RKM: 80–1100 ms).

## Note divisions (no toggle CCs)
| CC | Control | Values |
|---|---|---|
| 21 | MIDI NOTE DIVISIONS | value 0 = quarter, value 1 = dotted eighth, value 2 = eighth triplet, value 3 = eighth, value 4 = eighth sextolet, value 5 = sixteenth |

The panel toggle prints quarter / dotted eighth / eighth with the triplet / sextolet / sixteenth set in parentheses,
reached with the Division dip in position "3" ("also important for selecting MIDI note divisions"). The S/L/B toggle
(1 chip / 2 chips / both) and the wave-shape toggle (triangle / sine / square) have no CC.

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS SWITCH | value 127 = engage, value 0 = bypass; value 127 while already engaged resets any ramping |
| 93 | TAP SWITCH | any value = one tap (manual: "You can send any value with this CC#") |

Holding TAP/HOLD on the pedal = runaway self-oscillation (as if REGEN fully clockwise); no CC is documented for it.

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EXPRESSION | value 0 = expression pedal fully "off", value 127 = fully depressed; the dips select the parameter(s) |
| 51 | MIDI CLOCK IGNORE | value 0 = ignore MIDI clock, value 127 = listen (default: listens) |

MIDI clock: 24 PPQN; the division toggle / CC21 picks quarter, dotted eighth, eighth, eighth triplet, eighth sextolet or
sixteenth. With a plug in EXP/CV and no parameter dip set, expression sweeps the modulation directly (range limited by
DEPTH).

## Presets
PC 0 = Live (preset toggle middle), PC 1 = right slot, PC 2 = left slot, PC 1–122 recall; empty slot = nothing recalled.
Save = send a PC while holding TAP + BYPASS.

## Dip switches (user manual, no CCs documented; identical on RKM)
| Dip | Left bank (on / off, expression or ramp) | Right bank (rise / fall) |
|---|---|---|
| dip one | Mix | Mix |
| dip two | Rate | Rate |
| dip three | Time | Time |
| dip four | Regen | Regen |
| dip five | Depth | Depth |
| dip six | Bounce | Control (Tap: R = ramp, P = parameter) |
| dip seven | Trails | Division (Tap: 3 = triplet set, 1 = normal set) |
| dip eight | MoToByp | Sweep (T = top, B = bottom) |

TONE is not rampable (it is the ramp-speed knob).
