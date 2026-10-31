# Thermae

Default channel 2. Save: only PC while holding TAP + BYPASS (no save CC documented).
Source: Thermae_MIDI-Manual_Pedal_Chase-Bliss (PDF dated 2018, pedal "CBA ref 2018-THRM1"); panel and dip
labels from Thermae_Manual_2022_Pedal_Chase-Bliss (web guide, 2022).

The MIDI manual is the short 2018 one-pager: it lists only the CCs below. It documents **no dip-switch CCs**
(no 61–68 / 71–78), no CC103, no CC111 and no factory reset.

## Knobs
| CC | Control | Values |
|---|---|---|
| 14 | MIX (becomes RAMP speed when a ramping dip is on) | value 0 = fully counter-clockwise, value 127 = fully clockwise |
| 15 | LPF | value 0–127, as above |
| 16 | REGEN | value 0–127, as above |
| 17 | GLIDE | value 0–127, as above |
| 18 | INT 1 (SPEED when the MODULATION dip is on) | value 0–127, as above |
| 19 | INT 2 (DEPTH when the MODULATION dip is on) | value 0–127, as above |
| 20 | RAMP | value 0–127, as above |

## Toggles
| CC | Toggle | Values |
|---|---|---|
| 21 | L Toggle Select | value 1 = left, value 2 = middle, value 3 = right |
| 22 | M Toggle Select | value 1 = left, value 2 = middle, value 3 = right |
| 23 | R Toggle Select | value 1 = left, value 2 = middle, value 3 = right |

Manual: "The functions of these CC messages will vary depending on what mode the pedal is in." Printed labels on all
three toggles are note values (quarter / dotted eighth / eighth = step length for base step, INT 1, INT 2). With both
INT knobs at noon the left toggle is a plain tap-tempo subdivision. With the MODULATION dip on, the middle toggle is
randomness (STEADY / TWITCHY / ABRUPT) and the right toggle is wave shape (TRIANGLE / SINE / SQUARE); the left
toggle keeps its note-division function.

## Footswitches and holds
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS SWITCH | value 127 = engage, value 0 = bypass; value 127 while already engaged resets any ramping |
| 93 | TAP SWITCH | any value = one tap (manual: "You can send any value with this CC#") |
| 24 | "HOLD" function (hold left footswitch = runaway oscillation) | value 127 = runaway oscillation, value 0 = resume REGEN knob position |
| 25 | SLOWDOWN MODE in sequencer mode / SET TAP TEMPO in step mode (hold both footswitches) | value 127 = enter (sequencer: half speed; step mode: tap in a new base tempo), value 0 = back to normal |

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EXPRESSION | value 0 = expression pedal fully "off", value 127 = fully depressed; the dips select the parameter(s) |
| 51 | MIDI CLOCK IGNORE | value 0 = ignore MIDI clock, value 127 = listen (default: listens) |

MIDI clock: 24 PPQN. Manual: "By using the tap selection toggle, you can select different types of notes divisions
including quarter note, dotted eighth note, eighth note, eighth note triplet, eighth note sextolet, and sixteenth
note." (That sentence is copied from Tonal Recall; the Thermae toggle only prints three note values — UNVERIFIED
whether the triplet / sextolet / sixteenth set is reachable on Thermae.)

## Presets
PC 0 = Live (preset toggle middle), PC 1 = right slot, PC 2 = left slot, PC 1–122 recall; empty slot = nothing recalled.
Save = send a PC while holding TAP + BYPASS. Dip-switch settings are saved with presets.

## Dip switches (user manual, no CCs documented)
| Dip | Left bank (ON / OFF, ramping / expression) | Right bank (RISE / FALL, customize) |
|---|---|---|
| dip one | LPF | LPF |
| dip two | REGEN | REGEN |
| dip three | GLIDE | GLIDE |
| dip four | INT1(SPEED) | INT1(SPEED) |
| dip five | INT2(DEPTH) | INT2(DEPTH) |
| dip six | BOUNCE | STEP |
| dip seven | TRAILS | MODULATION |
| dip eight | MoToByp | SWEEP (B = bottom, T = top) |

MIX is not rampable (it is the ramp-speed knob). STEP pauses the sequencer: the left footswitch then advances one step
per tap. MODULATION turns INT 1 / INT 2 and their toggles into SPEED / DEPTH / randomness / wave shape.
