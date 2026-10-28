# MOOD MKII

Default channel 2. Save: **CC111 = slot (0–122)** or PC while holding both footswitches.

## Knobs (0–127)
| CC | Control | Notes |
|---|---|---|
| 14 | TIME | synced: 0–12 1/32 · 13–36 1/16 · 37–61 1/8T · 62–84 1/8 · 85–110 1/8. · 111–127 1/4 |
| 15 | MIX | |
| 16 | LENGTH | synced (Tape only): ×1/32 · ×1/16 · ×1/8 · ×1/4 · ×1/2 · ×1 (same ranges as TIME) |
| 17 | MODIFY (wet) | |
| 18 | CLOCK | stepped: 2k 0–4 · 3k 5–16 · 4k 16–28 · 6k 29–40 · 8k 41–53 · 12k 54–69 · 16k 70–83 · 24k 84–95 · 32k 96–109 · 48k 110–121 · 64k 122–127 |
| 19 | MODIFY (loop) | Tape: 4x Rev 0–4 · 2x Rev 5–23 · 1x Rev 24–42 · 0.5x Rev 43–61 · 0.5x Fwd 62–84 · 1x Fwd 85–97 · 2x Fwd 98–119 · 4x Fwd 120–127. Stretch: No Stretch Rev 0–15 · 1.5x Rev 16–30 · 2x Rev 31–46 · 4x Rev 47–60 · Stalled 61–80 · 4x Fwd 81–96 · 2x Fwd 97–111 · 1.5x Fwd 112–126 · No Stretch Fwd 127 |
| 20 | RAMP SPEED | |

## Hidden options
| CC | Control | Values |
|---|---|---|
| 24 | STEREO WIDTH (wet) | 0–127 |
| 25 | RAMPING WAVEFORM | 0–14 · 15–54 · 55–80 · 81–126 · 127 (5 shapes) |
| 26 | FADE (loop) | 0–127 |
| 27 | TONE (wet) | 0–127 |
| 28 | LEVEL BALANCE | 0–127 |
| 29 | DIRECT MICRO-LOOP | 0–127 |
| 31 | SYNC | 0,1 loop→wet · 2 no sync · >2 wet→loop |
| 32 | SPREAD | 0,1 wet only · 2 both · >2 loop only |
| 33 | BUFFER LENGTH | 0,1 half (like MKI) · >1 full |

## Toggles
| CC | Toggle | 0,1 | 2 | >2 |
|---|---|---|---|---|
| 21 | WET CHANNEL | REVERB | DELAY | SLIP |
| 22 | ROUTING | IN | loop+IN | loop |
| 23 | MICRO-LOOPER | ENV | TAPE | STRETCH |

## Footswitches / aux
| CC | Function | Values |
|---|---|---|
| 102 | loop bypass | 0 off, ≥1 on |
| 103 | wet bypass | 0 off, ≥1 on |
| 104 | hidden menu | 0 off, ≥1 on |
| 105 | wet FREEZE | 0 off, ≥1 on |
| 106 | loop OVERDUB | 0 off, ≥1 on |
| 107 (or 93) | TAP TEMPO | any value > 0 |

## Misc
| CC | Function | Values |
|---|---|---|
| 51 | MIDI CLOCK IGNORE (global) | 0 ignore, >0 follow |
| 52 | STOP RAMPING | 0 stop, >0 resume |
| 53 / 54 | wet / loop CLOCK DIVISION (global) | 0 1/32 · 1 1/16 · 2 1/8T · 3 1/8 · 4 1/8. · 5 1/4 · 6 1/2 · 7 1/1 |
| 55 | TRUE BYPASS MODE | 0 buffered, 1–127 true bypass |
| 56 | FACTORY RESET | 0–127 |
| 100 | expression over MIDI | 0–127 |
| 110 | MIDI RESET | 1–127 (clock ignore off, octave +3, dividers ¼, portamento 0, gate mode 0) |
| 111 | PRESET SAVE | 0–122 |

## Dip switches (0 off, ≥1 on)
| CC | Left bank (ramping/expression) | CC | Right bank (customize) |
|---|---|---|---|
| 61 | TIME | 71 | CLASSIC |
| 62 | MODIFY wet | 72 | MISO |
| 63 | CLOCK | 73 | SPREAD |
| 64 | MODIFY loop | 74 | DRY KILL |
| 65 | LENGTH | 75 | TRAILS |
| 66 | BOUNCE | 76 | LATCH |
| 67 | SWEEP (B=0, T≥1) | 77 | NO DUB |
| 68 | POLARITY (F=0, R≥1) | 78 | SMOOTH |

## Synth mode (not implemented yet)
Any note enters synth mode, CC59 exits. CC58 output type (0 open, 1 on/off, >1 ADSR), CC80–83 ADSR, CC57 octave transpose 1–9, CC84 portamento, CC0 pitch bend, CC1 mod wheel. Settings are global.
