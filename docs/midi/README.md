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
| Thermae | [thermae.md](thermae.md) | 2 | Thermae_MIDI-Manual (2018); no dip CCs |
| Dark World | [dark-world.md](dark-world.md) | 2 | Dark-World_MIDI-Manual (2018); both channels in CC103 |
| Tonal Recall / RKM | [tonal-recall.md](tonal-recall.md) | 2 | Tonal-Recall_MIDI-Manual (2016); RKM shares it |
| Bliss Factory | [bliss-factory.md](bliss-factory.md) | 2 | Bliss-Factory_MIDI-Manual (2020); AUX on CC101 |
| Condor | [condor.md](condor.md) | 2 | Condor_MIDI-Manual (c. 2017); bypass + drive in CC103 |
| Condor HiFi | [condor-hifi.md](condor-hifi.md) | 2 | Condor-Hifi_Midi-Manual (CBA ref 2024 – CDR02) |
| Gravitas | [gravitas.md](gravitas.md) | **4** | Gravitas_MIDI-Manual (c. 2015); no toggle CCs |
| Warped Vinyl HiFi | [warped-vinyl-hifi.md](warped-vinyl-hifi.md) | **6** | Warped-Vinyl-HiFi_MIDI-Manual (c. 2017); LAG on CC15 |
| Spectre | [spectre.md](spectre.md) | **3** | Spectre_MIDI-Manual (2016); no toggle CCs |
| Wombtone MKII | [wombtone-mkii.md](wombtone-mkii.md) | **6** | Wombtone_MKII_MIDI-Manual (2018); no toggle CCs |
| Billy Strings Wombtone | [billy-strings-wombtone.md](billy-strings-wombtone.md) | 2 | Billy_Strings_Wombtone_Midi_Manual (CBA + BS ref 2024 – WT03); bypass threshold 64 |

## Automatone series

Preamp MKII, CXM 1978 and Big Time are the large Automatone units: six motorized faders (CC14–19), five arcade
buttons (CC22–26), a 7-segment display, **5-pin DIN MIDI IN** (no TRS adapter) plus THRU / OUT. None of the
common facts above apply to them:

- **No live state, no preset toggle.** Presets are 0-based: PC n recalls slot n, **CC 27 = n saves** into slot n.
  Preamp MKII and CXM 1978 have 30 slots in 3 banks × 10; Big Time has "127 total slots" and also CC 28 = save to
  the current slot.
- **Button values differ by generation.** CXM 1978 and Preamp MKII document only 1 / 2 / 3; Big Time is 0-based
  with "3 or more" as the last state. Nothing uses the 0–42 / 43–85 / 86–127 split of the compact pedals.
- **Channel change** still starts with both footswitches held at power-up, but CXM 1978 and Preamp MKII adopt
  the channel of the first *Program Change* only (Big Time: first PC or CC).

| Pedal | File | Default channel | Manual |
|---|---|---|---|
| Preamp MKII | [preamp-mkii.md](preamp-mkii.md) | 2 | Preamp-MKII_MIDI-Manual (2019) |
| CXM 1978 | [cxm-1978.md](cxm-1978.md) | 2 | CXM-1978_MIDI-Manual (2020) |
| Big Time | [big-time.md](big-time.md) | 2 | Big Time_MIDI Manual (CBA + EAE ref 2026 - BT001) |

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
