# MIDI reference

Source of truth for every pedal definition in `src/pedals/`. Transcribed from the
official Chase Bliss MIDI manuals (https://www.chasebliss.eu/manuals), checked on 2026-10-27.
If a pedal definition and this reference disagree, the reference wins.

Common to all pedals covered here:

- 122 preset slots. **PC 0 = Live**, **PC 1 = right** preset-toggle slot, **PC 2 = left** slot, PC n recalls slot n (empty slot = no-op).
- Saving: send a PC *while holding both footswitches*. Only MOOD MKII, Generation Loss MKII and Reverse Mode C also document **CC 111 = save to slot** — that is the only save method an editor can trigger on its own.
- MIDI channel: hold both footswitches on power-up, the pedal adopts the channel of the first PC it receives.

| Pedal | File | Default channel | Manual |
|---|---|---|---|
| MOOD MKII | [mood-mkii.md](mood-mkii.md) | 2 | MOOD-MKII_MIDI-Manual (CBA ref 2022-GEN02) |
| Generation Loss MKII | [generation-loss-mkii.md](generation-loss-mkii.md) | 2 | Generation-Loss-MKII_MIDI-Manual (CBA ref 2022-GEN02) |
| Warped Vinyl MKII | [warped-vinyl-mkii.md](warped-vinyl-mkii.md) | 5 | Warped-Vinyl-MKII_MIDI-Manual (2016) |
| Habit | [habit.md](habit.md) | 2 | Habit_MIDI-Manual (2022) |
| MOOD (MKI) | [mood.md](mood.md) | 2 | MOOD_MIDI-Manual (2019) |
| Reverse Mode C | [reverse-mode-c.md](reverse-mode-c.md) | 2 | Reverse-Mode-C_MIDI-Manual (RMC1, 2023) |
| Brothers AM | [brothers-am.md](brothers-am.md) | 2 | Brothers-AM_MIDI-Manual (2023) |
| Lossy | [lossy.md](lossy.md) | 2 | Lossy_Pedal_MIDI-Manual (2023) |
| Clean | [clean.md](clean.md) | 2 | Clean_Midi-Manual (2024) |
| Onward | [onward.md](onward.md) | 2 | Onward_MIDI-Manual (2024) |
| Lost + Found | [lost-found.md](lost-found.md) | 2 | Lost-Found_MIDI-Manual (2025) |
| Blooper | [blooper.md](blooper.md) | 2 | Blooper_MIDIManual (2019; loops are PC 0–15) |
| BAD MOOD | [bad-mood.md](bad-mood.md) | 2 | BAD-MOOD_MIDI-Manual (Small Batch Bliss 2026, BAD1.1) |

## Corrections vs. the 2023 editors

| Pedal | Old editor | Manual | New editor |
|---|---|---|---|
| all | MIDI channel list 0–15 → WebMidi `channels[0]` crash, ch 16 unreachable | channels 1–16 | channels 1–16 |
| MOOD MKII | tap CC107 alternating 0/127 (every 2nd tap lost) | any value > 0 is a tap | 127 per tap ¹ |
| MOOD MKII | — | CC20 RAMP SPEED, CC100 EOM | CC20 kept (fader) |
| Generation Loss MKII | CC20 RAMP SPEED missing | CC20 RAMP SPEED | added |
| Generation Loss MKII | store slot 0–122 | CC111 = 1–122 | 1–122 |
| Warped Vinyl MKII | toggles t1–t3 sent on CC21–23 | no CCs for toggles; CC21 = MIDI note divisions 0–5 | toggles shown as reference only, CC21 = divisions |
| Warped Vinyl MKII | CC20 RAMP missing; hold on tap sent CC51 | CC20 RAMP, CC51 = clock ignore | CC20 added, hold bug removed |
| Habit | clear memory = CC53=1 + CC102=1 | CLEAR = CC26 (any value) | CC26 |
| Habit | tap CC93 sent with the BPM as value (>127 invalid) | any value | 127 per tap |
| Habit, Warped Vinyl | bypass-off also sent CC93=0 (spurious tap) | — | removed |

¹ To be confirmed in the hardware test (`docs/hardware-test.md`): the old code comment says the alternating scheme was a Chase Bliss suggestion.
