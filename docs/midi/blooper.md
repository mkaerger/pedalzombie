# Blooper

Default channel 2. Source: Blooper_MIDIManual (Chase Bliss) and Quick Start Guide.

**Loops are zero-based:** the 16 loop slots are recalled with **PC 0–15** (PC 0 = loop 1). There is no "live" PC and
no preset toggle; the toggle between the footswitches is PREVIEW / SAVE-LOAD (CC24). Saving over MIDI: send the PC
*while holding the right footswitch* (in loop mode, toggle centred). No save CC.

## Transport (0 off, >0 on)
| CC | Function | Pedal |
|---|---|---|
| 1 | RECORD | left footswitch tap (record / play) |
| 2 | PLAY | |
| 3 | OVERDUB | left footswitch tap while playing |
| 4 | STOP | right footswitch tap |
| 5 | UNDO | right footswitch hold → undo/redo menu |
| 6 | REDO | |
| 7 | ERASE | tap both footswitches |
| 8 | HOLD SWITCH B | right footswitch hold (undo/redo menu; sampler: looping on/off) |
| 9 | ONE SHOT DUB | left footswitch hold (sampler: momentary record) |
| 11 | MULTI-CONTROL | 1 record · 2 play · 3 overdub · 4 stop · 5 undo · 6 redo · 7 erase |

## Knobs (0–127)
| CC | Control | Where |
|---|---|---|
| 14 | VOLUME (ramp) | top left; unity at noon, 2× at max |
| 15 | LAYERS | top middle; undo/redo through up to 8 layers |
| 16 | REPEATS | top right |
| 17 | MOD A | bottom left; noon = neutral |
| 18 | STABILITY | bottom middle; min = bypassed |
| 19 | MOD B | bottom right; noon = neutral |
| 20 | RAMP | ramp speed (hidden; VOLUME knob while ramping is on) |

## Toggles (1 left, 2 centre, 3 right)
| CC | Toggle | 1 | 2 | 3 |
|---|---|---|---|---|
| 21 | MOD A | 1 | 2 | 3 |
| 22 | LOOPER MODE | NORMAL | ADDITIVE | SAMPLER |
| 23 | MOD B | 4 | 5 | 6 |
| 24 | PREVIEW / SAVE-LOAD | PREVIEW | (loop mode) | SAVE / LOAD |

Stock modifiers: A1 Chromatic speed · A2 Pitcher · A3 Stutter · B4 Filter · B5 Stopper · B6 Swapper (changeable
with the BLIP interface).

## Modifier buttons (arcade buttons on the bottom edge)
| CC | Button | Values |
|---|---|---|
| 30 | MOD A | any value > 0 toggles on/off |
| 31 | MOD B | any value > 0 toggles on/off |

The editor cannot read the pedal, so it keeps its own on/off state and sends 127 on every click. It never re-sends
these on sync, reset or preset load. Button LEDs: blue (bank 1) / red (bank 2) on the pedal.

## Other
| CC | Function | Values |
|---|---|---|
| 51 | MIDI CLOCK IGNORE | 0 ignore, >0 listen |
| 52 | RAMPING ON/OFF | 0 off, >0 on |
| 54 | NOTE DIVISIONS | 0 whole · 1 half · 2 dotted · 3 quarter · 4 eighth · 5 triplet · 6 sixteenth · 7 thirty-second |
| 100 | EXPRESSION | 0–127 |

Dip switches (ramping targets, sync, wiggle, bounce, …) have no MIDI control.
