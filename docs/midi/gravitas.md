# Gravitas

Default channel **4**. Source: Gravitas_MIDI-Manual_Pedal_Chase-Bliss (undated single page, "MIDI CONFIGURATION"; Modified Empress Midibox era, c. 2015).
Save: only PC while holding TAP + BYPASS (no save CC). MIDI arrives on the TAP/MIDI TRS jack ("Ring Active" port of a Chase Bliss modified Empress Midibox; a standard Empress Midibox needs a tip/ring-flipped TRS cable).

The manual lists twelve CCs: seven knobs (incl. RAMP), note divisions, clock ignore, tap, expression, bypass. **No** CCs for the three toggles, the dip switches, factory reset or CC111.

## Knobs
"Sending a value 0 would be equivalent to the knob being completely counter clock-wise, sending 127 is equivalent to fully clock-wise."

| CC | Control | Values |
|---|---|---|
| 14 | DRIVE (RAMP) | value 0–127, ccw to cw (clean boost gain) |
| 15 | VOLUME | value 0–127, ccw to cw |
| 16 | TONE | value 0–127, ccw to cw (noon = transparent) |
| 17 | RATE | value 0–127, ccw to cw |
| 18 | DEPTH | value 0–127, ccw to cw |
| 19 | SWAY | value 0–127, ccw to cw (noon = symmetric wave) |
| 20 | RAMP | value 0–127, ramp speed |

CC14 and CC20 are separate here: DRIVE stays DRIVE over MIDI while RAMP has its own CC (unlike Condor, which has no CC20).

## Tempo
| CC | Function | Values |
|---|---|---|
| 21 | MIDI NOTE DIVISIONS | value 0 = whole notes · value 1 = half notes · value 2 = quarter-note triplets · value 3 = quarter notes · value 4 = eighth notes · value 5 = sixteenth notes |
| 51 | MIDI CLOCK IGNORE | value 0 = ignore MIDI Clock, value 127 = listen for MIDI Clock (default: listen) |
| 93 | TAP SWITCH | any value = simulates one press of the tap switch |

MIDI clock: 24 PPQN per quarter note; one tap division = one period of the tremolo waveform. Panel equivalents: first toggle bank 1 = whole, 2 = half, 4 = quarter; second bank (Division dip in "3") 3 = quarter triplet, 6 = eighth, 8 = sixteenth.

## Footswitches and other
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS SWITCH | value 127 = engage, value 0 = bypass; value 127 while already engaged resets any ramping in progress |
| 100 | EXPRESSION | value 0 = expression pedal fully "off", value 127 = fully depressed; the dip switches select which parameter(s) respond |

## Presets
PC 0 = Live (same as preset toggle in the middle). PC 1 = right toggle slot, PC 2 = left toggle slot, PC 3–122 further slots, 122 total; an empty slot recalls nothing. Save = PC n while holding TAP + BYPASS. Channel change: hold TAP + BYPASS at power-up, the pedal adopts the channel of the first Program Change it receives.

**Not MIDI-controllable per manual:** the 1/2/4 (3/6/8) (S/B/H) toggle (tap division or Standard/Both/Harmonic mode when the Mode dip is on), the left and right wave-shape toggles, and all dip switches (left bank Volume · Tone · Rate · Depth · Sway · Bounce · Mode · MoToByp; right bank Volume · Tone · Rate · Depth · Sway · Control · Division · Sweep). CC21 only changes the note division of the MIDI clock, it does not move the toggle into S/B/H mode.
