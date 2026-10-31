# Condor HiFi

Default channel 2. Source: Condor-Hifi_Midi-Manual_Pedal_Chase-Bliss (CBA ref 2024 – CDR02).
Save: only PC while holding both footswitches (no save CC). MIDI arrives on the MIDI/EXT TRS jack (Chase Bliss MIDIBox converts 5-pin to TRS).

The 2024 manual lists the same eleven CCs as the original Condor; what changed is only the *value* definitions (see "Changes vs. Condor" at the end). Still **no** ramp-speed, dip-switch, tap, clock, reset or CC111 messages.

## Knobs
| CC | Control | Values |
|---|---|---|
| 14 | GAIN | value 0–127 |
| 15 | FREQ | value 0–127 (roughly 150 Hz ccw to a little over 4 kHz cw) |
| 16 | VOLUME | value 0–127 |
| 17 | BASS | value 0–127 (noon = neutral, boost up to 10 dB, cut up to 20 dB) |
| 18 | MIDS | value 0–127 (noon = neutral, ±18 dB) |
| 19 | LPF | value 0–127 (cw = open) |

GAIN "automatically changes to control the ramp speed" when any ramping dip is on; whether CC14 then addresses ramp speed is not stated (UNVERIFIED).

## Toggles
The manual prints a position icon per value: "= 0, 1", "= 2", "= 3 OR >" (3 or greater). In panel terms the first icon is the left position, the last the right position.

| CC | Toggle | Left (value 0 or 1) | Middle (value 2) | Right (value 3 or more) |
|---|---|---|---|---|
| 21 | BASS TOGGLE | bass only | bass and lower mids | bass, lower mids and mids |
| 22 | MIDS TOGGLE | mellow, wide range | mild resonance, medium range | heavy resonance, narrow range |
| 23 | LPF TOGGLE | mellow, tone-knob-like filtering | balanced resonant filtering | heavy resonant filtering |

The left-to-right order of the icons matches the user manual (pages 11 and 13), where the same icons are listed top-to-bottom next to the toggle. The mapping icon-to-physical-position is therefore inferred from icon shapes (smallest wedge = left), not spelled out in words (UNVERIFIED in that narrow sense).

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS | manual prints "Pedal off = 63, Pedal on = 64" — read as value 63 or lower = bypassed, value 64 or higher = engaged (interpretation UNVERIFIED; send 0 and 127 to be safe) |
| 103 | DRIVE / HOLD | value 0–29 = pedal off, clean engaged · value 30–59 = pedal on, clean engaged · value 60–89 = pedal off, dirt engaged · value 90–127 = pedal on, dirt engaged |

CC103 therefore sets *both* bypass state and clean/drive channel in one message. There is no separate momentary CC for the HOLD function of the left footswitch.

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EOM (expression over MIDI) | value 0–127 |

## Presets
PC 0 = Live ("matching the pedal's current settings"). PC 1 = right toggle slot, PC 2 = left toggle slot, PC 3–122 further slots, 122 total; an empty slot recalls nothing. Save = PC n while holding both footswitches. Channel change: hold both footswitches at power-up, the pedal adopts the channel of the first Program Change it sees.

**Not MIDI-controllable per manual:** the dip switches (left bank FREQ · VOLUME · BASS · MIDS · LPF · BOUNCE · BUFFER · MOTOBYP; right bank FREQ · VOLUME · BASS · MIDS · LPF · DRIVE · RESET · SWEEP).

## Changes vs. Condor (original)
| Item | Condor (original manual) | Condor HiFi (2024 manual) |
|---|---|---|
| Knob CCs 14–19 | same | same |
| Toggle values CC21–23 | value 1 / 2 / 3 = left / middle / right | value 0,1 / 2 / 3 or more |
| CC102 BYPASS | value 127 = last saved bypass state, value 0 = bypass | "Pedal off = 63, Pedal on = 64" |
| CC103 drive + bypass | four discrete values: 127 / 85 / 45 / 0 | four ranges: 0–29 / 30–59 / 60–89 / 90–127, same four states in the same order (off+clean, on+clean, off+dirt, on+dirt) |
| CC100 | EXPRESSION | EOM, same meaning |
| Default channel, presets, save | identical | identical |
| Dip label | "Lows" | "BASS" |
