# Preamp MKII (Automatone)

Default channel 2. Source: Preamp-MKII_MIDI-Manual and Preamp-MKII_Manual (Chase Bliss × Benson Amps, 2019).

**Automatone format:** 5-pin DIN MIDI IN and THRU (no TRS adapter needed). Six motorized faders, five arcade
buttons with a tri-colour LED, a 7-segment display, BANK and ACTIVE LEDs. **No live state and no preset
toggle:** 30 presets in 3 banks × 10, recalled with **PC 0–29** (PC 4 = bank 1 preset 4, PC 17 = bank 2 preset 7,
PC 20 = bank 3 preset 0) and saved with **CC 27 = slot (0–29)**. On the pedal: PRESET footswitch = next preset,
hold = next bank; hold BYPASS = save to the current preset.

**Channel change:** hold both footswitches at power-up, release when the display lights, then send a *Program
Change* on the new channel.

## Faders (0 = full down, 127 = full up)
| CC | Fader | Notes |
|---|---|---|
| 14 | VOLUME | master volume |
| 15 | TREBLE | |
| 16 | MIDS | parametric mids, ±18 dB, halfway = flat; inactive while MIDS button = Off |
| 17 | FREQ | mids centre frequency, ~150 Hz bottom to a little over 4 kHz top; inactive while MIDS = Off |
| 18 | BASS | |
| 19 | GAIN | |

## Arcade buttons — only values 1, 2 and 3 are documented
| CC | Button | 1 (LED off) | 2 (blue) | 3 (red) |
|---|---|---|---|---|
| 22 | JUMP | Off | preset 0 | preset 5 |
| 23 | MIDS | Off | Pre | Post |
| 24 | Q | Low (wide) | Mid | High (narrow) |
| 25 | DIODE | Off | Sil | Germ |
| 26 | FUZZ | Off | Open | Gated |

JUMP: when on, the PRESET footswitch jumps to preset 0 or 5 of the current bank; saved per preset. What values 0
or 4–127 do on these CCs is not documented — the editor never sends them.

## Other
| CC | Function | Values |
|---|---|---|
| 27 | PRESET SAVING | 0–29 = slot to save the current settings into |
| 100 | EXPRESSION over MIDI | 0 heel … 127 toe, through the per-preset expression mapping (not sent by the editor) |
| 102 | BYPASS | 0 bypassed, 1 (or more) engaged |

No tap tempo, no MIDI clock, no aux CCs. The pedal does not transmit its state.
