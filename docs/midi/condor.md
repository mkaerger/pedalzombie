# Condor

Default channel 2. Source: Condor_MIDI-Manual_Pedal_Chase-Bliss (undated single page, "MIDI CONFIGURATION"; the pedal is the c. 2017 original, see Condor HiFi for the 2024 revision).
Save: only PC while holding both footswitches (no save CC). MIDI arrives on the TAP/MIDI TRS jack via a Chase Bliss Midibox.

The manual documents exactly eleven CCs: six knobs, three toggles, expression and two bypass CCs. **Nothing else is listed** — no ramp speed, no dip switches, no tap tempo, no MIDI clock, no factory reset, no CC111. Condor has no tap tempo and no LFO, so the clock/tap CCs of the other pedals do not exist here.

## Knobs
"Sending a value 0 would be equivalent to the knob being completely counter clock-wise, sending 127 is equivalent to fully clock-wise."

| CC | Control | Values |
|---|---|---|
| 14 | GAIN (RAMP) | value 0–127, ccw to cw |
| 15 | FREQ | value 0–127, ccw to cw (roughly 150 Hz to a little over 4 kHz, noon about 1250 Hz) |
| 16 | VOLUME | value 0–127, ccw to cw |
| 17 | BASS | value 0–127, ccw to cw (noon = neutral) |
| 18 | MIDS | value 0–127, ccw to cw (noon = neutral) |
| 19 | LPF | value 0–127, ccw to cw (cw = open) |

GAIN doubles as the ramp-speed knob as soon as a ramping dip is on; the manual does not say whether CC14 then sets ramp speed (UNVERIFIED, likely yes because the knob itself does).

## Toggles
"Sending value 1 selects the left toggle position. Sending value 2 selects the middle toggle position. Sending value 3 selects the right toggle position." Values 0 and 4–127 are not documented (UNVERIFIED; Condor HiFi documents 0,1 / 2 / 3 or more).

| CC | Toggle | Left (value 1) | Middle (value 2) | Right (value 3) |
|---|---|---|---|---|
| 21 | BASS TOGGLE SELECT | small boost/cut | moderate | big |
| 22 | MIDS TOGGLE SELECT | wide hump/scoop (low Q) | more focused | very narrow |
| 23 | LPF TOGGLE SELECT | one-pole gentle (tone-control style) | two-pole slightly resonant | two-pole, much more resonance |

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS SWITCH | value 127 = "engages the last saved bypass state on the pedal", value 0 = bypasses pedal |
| 103 | BYPASS SWITCH (pedal + drive) | value 127 = pedal engaged and drive engaged · value 85 = drive engaged, pedal bypassed · value 45 = pedal engaged, drive (OD) bypassed · value 0 = both bypassed |

Only those four exact values are documented for CC103; behaviour of in-between values is UNVERIFIED (Condor HiFi defines four ranges, see condor-hifi.md). The DRIVE/HOLD footswitch has no dedicated momentary/hold CC.

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EXPRESSION | value 0 = expression pedal fully "off", value 127 = fully depressed; the dip switches select which parameter(s) respond |

## Presets
PC 0 = Live (same as preset toggle in the middle). PC 1 = right toggle slot, PC 2 = left toggle slot, PC 3–122 = further slots; 122 slots in total, an empty slot recalls nothing. Save = PC n while holding both footswitches. Channel change: hold both footswitches at power-up, the pedal adopts the channel of the first Program Change it receives.

**Not MIDI-controllable per manual:** all sixteen dip switches (left bank Freq · Volume · Lows · Mids · LPF · Bounce · Buffer · MoToByp; right bank Freq · Volume · Lows · Mids · LPF · Drive · Reset · Sweep), hold/ramp reset, buffer.
