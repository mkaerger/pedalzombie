# Warped Vinyl HiFi

Default channel **6**. Source: Warped-Vinyl-HiFi_MIDI-Manual_Pedal_Chase-Bliss (undated single page, "MIDI CONFIGURATION"; Modified Empress Midibox era, c. 2017).
Save: only PC while holding TAP + BYPASS (no save CC). MIDI arrives on the TAP/MIDI TRS jack ("Ring Active" port of a Chase Bliss modified Empress Midibox; a standard Empress Midibox needs a tip/ring-flipped TRS cable).

The manual lists twelve CCs: seven knobs (incl. RAMP), note divisions, clock ignore, tap, expression, bypass. **No** CCs for the three toggles, the dip switches, the hold functions, factory reset or CC111.

## Knobs
"Sending a value 0 would be equivalent to the knob being completely counter clock-wise, sending 127 is equivalent to fully clock-wise."

| CC | Control | Values |
|---|---|---|
| 14 | TONE (RAMP) | value 0–127, ccw to cw (noon = transparent; cw shaves lows, ccw shaves highs; wet path only) |
| 15 | LAG | value 0–127, ccw to cw (wet/dry delay; ccw = none, for vibrato) |
| 16 | MIX | value 0–127, dry to wet (middle = chorus) |
| 17 | RPM | value 0–127, ccw to cw (vibrato rate, overridden by tap) |
| 18 | DEPTH | value 0–127, ccw to cw |
| 19 | WARP | value 0–127, ccw to cw (noon = symmetric wave) |
| 20 | RAMP | value 0–127, ramp speed |

## Tempo
| CC | Function | Values |
|---|---|---|
| 21 | MIDI NOTE DIVISIONS | value 0 = whole notes · value 1 = half notes · value 2 = quarter-note triplets · value 3 = quarter notes · value 4 = eighth notes · value 5 = sixteenth notes |
| 51 | MIDI CLOCK IGNORE | value 0 = ignore MIDI Clock, value 127 = listen for MIDI Clock (default: listen) |
| 93 | TAP SWITCH | any value = simulates one press of the tap switch |

MIDI clock: 24 PPQN per quarter note; one tap division = one period of the vibrato waveform (the manual literally says "phasers's waveform", evidently a copy-paste error). Panel equivalents: first toggle bank 1 = whole, 2 = half, 4 = quarter; second bank (Division dip in "3") 3 = quarter triplet, 6 = eighth, 8 = sixteenth.

## Footswitches and other
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS SWITCH | value 127 = engage, value 0 = bypass; value 127 while already engaged resets any ramping in progress |
| 100 | EXPRESSION | value 0 = expression pedal fully "off", value 127 = fully depressed; the dip switches select which parameter(s) respond |

## Presets
PC 0 = Live (same as preset toggle in the middle). PC 1 = right toggle slot, PC 2 = left toggle slot, PC 3–122 further slots, 122 total; an empty slot recalls nothing. Save = PC n while holding TAP + BYPASS. Channel change: hold TAP + BYPASS at power-up, the pedal adopts the channel of the first Program Change it receives.

**Not MIDI-controllable per manual:** the 1/2/4 (3/6/8) (R/−/+) toggle, the left and right wave-shape toggles, the TAP/HOLD footswitch's hold functions (R = hold to ramp, − = momentarily disable the LFO, + = momentarily enable it; only with the Hold dip on), and all dip switches (left bank Lag · Mix · RPM · Depth · Warp · Bounce · Hold · MoToByp; right bank Lag · Mix · RPM · Depth · Warp · Control · Division · Sweep).

## Differences vs. Warped Vinyl MKII
Per the HiFi manual, HiFi is the *later* model ("several changes from previous versions, including a lag knob … reduced noise … brighter tones"), so MKII → HiFi is the direction of the change.

| Item | Warped Vinyl MKII (warped-vinyl-mkii.md) | Warped Vinyl HiFi |
|---|---|---|
| Default channel | channel 5 | channel 6 |
| CC15 | Volume | LAG (the HiFi has no volume knob) |
| CC14, 16–20 | Tone, Mix, RPM, Depth, Warp, Ramp | same |
| CC21 / 51 / 93 / 100 / 102 | same meanings | same meanings |
| Toggles, dips | not MIDI-controllable | not MIDI-controllable |
| Left footswitch | TAP | TAP/HOLD (hold modes via Hold dip; no CC) |
