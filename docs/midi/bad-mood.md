# BAD MOOD

Default channel 2. Save: **CC111 = slot (0–122)** or PC while holding both footswitches.
Source: BAD-MOOD_MIDI-Manual (Small Batch Bliss 2026, BAD1.1) and the user manual.

Two channels like MOOD MKII: a wet channel (Soup / Relay / Flip) and a micro-looper (Burst / Radio / Mask),
both through a global GLUE. Layout, footswitches and dip banks follow MOOD MKII; the hidden options differ.

## Knobs (0–127)
| CC | Control | Soup / Burst | Relay / Radio | Flip / Mask |
|---|---|---|---|---|
| 14 | TIME (wet) | Decay / size | Delay time | Lag / spacing |
| 15 | MIX (ramp) | | | |
| 16 | LENGTH (loop) | Size / speed | Station dependent | Character |
| 17 | MODIFY (wet) | Character | Feedback | Harmony (chord table below) |
| 18 | CLOCK | stepped: 2k 0–4 · 3k 5–16 · 4k 16–28 · 6k 29–40 · 8k 41–53 · 12k 54–69 · 16k 70–83 · 24k 84–95 · 32k 96–109 · 48k 110–121 · 64k 122–127 | | |
| 19 | MODIFY (loop) | Sensitivity | Radio station: TAPE 0 · AMBIENT 32 · ORCHESTRAL 63 · SHOEGAZE 97 · DANCE 127 | Sensitivity |
| 20 | RAMP SPEED | | | |

## Toggles
| CC | Toggle | 0,1 | 2 | >2 |
|---|---|---|---|---|
| 21 | WET CHANNEL | SOUP | RELAY | FLIP |
| 22 | ROUTING | IN | loop + IN | loop |
| 23 | MICRO-LOOPER | BURST | RADIO | MASK |

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | loop BYPASS (right switch) | 0 off, ≥1 on |
| 103 | wet BYPASS (left switch) | 0 off, ≥1 on |
| 104 | HIDDEN OPTIONS (hold both) | 0 off, ≥1 on |
| 105 | wet FREEZE (hold left) | 0 off, ≥1 on |
| 106 | loop OVERDUB (hold right) | 0 off, ≥1 on |

## Hidden options
| CC | Control | Values |
|---|---|---|
| 24 | CROSS | 0–127 (modulation intensity, off by default) |
| 25 | BALANCE (effect volume) | 0–127 |
| 26 | FADE (loop) | 0–127 |
| 27 | EQ | 0–127 (noon = flat; cw removes lows, ccw removes highs) |
| 28 | GLUE | 0–127 |
| 29 | BLEND (loop) | 0–127 |
| 30 | MASTER VOLUME | 0–127 |
| 31 | SYNC | 0,1 loop → wet · 2 no sync · >2 wet → loop |
| 32 | SPREAD | 0,1 wet only · 2 both · >2 loop only |
| 33 | CROSS INPUT | 0,1 wet → loop · 2 input → wet + loop · >2 loop → wet |

## Dip switches (0 off, ≥1 on)
| CC | Left bank (control) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | TIME (wet) | 71 | MISO |
| 62 | MODIFY (wet) | 72 | SPREAD |
| 63 | CLOCK | 73 | DRY KILL |
| 64 | MODIFY (loop) | 74 | TRAILS |
| 65 | LENGTH | 75 | LATCH |
| 66 | BOUNCE | 76 | HALF (loop) |
| 67 | SWEEP (B=0, T≥1) | 77 | SMOOTH |
| 68 | POLARITY (F=0, R≥1) | 78 | DRY GLUE |

## Misc
| CC | Function | Values |
|---|---|---|
| 51 | MIDI CLOCK IGNORE (global) | 0 ignore, ≥1 follow |
| 52 | STOP RAMPING | 0 stop, >0 resume |
| 55 | TRUE BYPASS MODE | 0 off, >0 on |
| 56 | FACTORY RESET | 0–127 |
| 85 | EQ PER CHANNEL | 0,1 only wet EQ · 2 both (default) · >2 only loop EQ |
| 93 | TAP TEMPO | 0–127 (exit tap tempo: hold the wet footswitch and turn TIME) |
| 100 | EXPRESSION OVER MIDI | 0–127 |
| 110 | MIDI RESET | 0–127 (clock ignore off, octave +3, clock division ¼, portamento off, gate off) |
| 111 | PRESET SAVE | 0–122 |
| 53 | wet CLOCK DIVISION (global) | 0 1/32 · 1 1/16 · 2 1/8T · 3 1/8 · 4 1/4 · 5 1/2 · 6 dotted 1/2 · 7 whole · 8 double whole |
| 54 | loop CLOCK DIVISION (global) | same values |

Below 60 BPM the pedal changes its sample rate, shifting existing audio.

## Flip mode chords (CC17)
48 chords selected by the wet MODIFY knob; value ranges and notes transcribed from the manual (page 08).
Chords 1–6 are single intervals (-Oct, -5th, -4th, +4th, +5th, +Oct), 7–21 two notes, 22–40 three notes,
41–48 four notes. The full table lives in `src/pedals/badmood.ts` (`FLIP_CHORDS`).

## Synth mode (not implemented)
Any MIDI note enters synth mode, CC59 exits. CC58 output type (0 open, 1 on/off, >1 ADSR), CC80–83 ADSR,
CC57 octave transpose 1–9, CC84 portamento, CC0 pitch bend, CC1 mod wheel. Saved globally.
