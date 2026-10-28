# Hardware test checklist

Run with the real pedals before going live. Open the **MIDI monitor** below the pedal to see what is sent.
Mark each line ✅ / ❌ and note what happened.

Start: `npm run build && npm run preview`, open the editor in Chrome, **Connect MIDI**, choose output and channel.

## All pedals

- [ ] MIDI output list shows the interface; selection survives a reload
- [ ] Channel 1–16 selectable; the pedal reacts on its channel; selection survives a reload
- [ ] Every knob moves the pedal's parameter (check min, max, middle)
- [ ] Toggles switch left / middle / right correctly
- [ ] Preset toggle: left = preset 2, middle = live, right = preset 1
- [ ] Recall slot 3 (PC 3)
- [ ] App preset: save, reload page, load → pedal sounds the same; delete
- [ ] A preset saved with the **old** editor (same browser profile) still loads
- [ ] Randomize: each group changes only the expected controls
- [ ] Editor defaults resets everything
- [ ] Sync pedal sends the full state
- [ ] Footswitch click and hold (≥ 0.6 s) with mouse and on a touch screen

## MOOD MKII

- [ ] **Tap (CC107 = 127 per tap)** — every tap registers. The 2023 editor alternated 0/127 ("suggested by Chase
      Bliss"); the manual says any value > 0. If taps are lost, switch `tap` to CC 93.
- [ ] Wet footswitch: click = wet on/off (CC103), hold = freeze (CC105) only while wet is on
- [ ] Loop footswitch: click = loop on/off (CC102), hold = overdub (CC106)
- [ ] Alt knobs CC24–29, ramp speed fader CC20
- [ ] Sync / spread / buffer length toggles (CC31–33)
- [ ] Dip switches CC61–68, CC71–78; classic dip changes the editor's look
- [ ] Clock divisions CC53 / CC54; MIDI clock follow (CC51), ramping stop/run (CC52), true bypass (CC55)
- [ ] Global defaults: the editor starts with clock = ignore, divisions 1/16 and 1/8 (as the 2023 editor). After a
      MIDI reset the pedal itself has clock = follow and both divisions = 1/4 — decide which defaults you prefer
- [ ] Store on pedal: CC111 = slot, then recall it
- [ ] Factory reset (CC56) and MIDI reset (CC110)

## Generation Loss MKII

- [ ] Model readout matches the model the pedal plays (CC16 values in docs/midi)
- [ ] Classic dip (CC72) relabels LOW PASS / GEN / HIGH PASS
- [ ] Aux footswitch only works while engaged; bypassing switches aux off
- [ ] Input gain toggle (CC32), bypass type switch (CC26: 0 = true bypass, 127 = DSP bypass)
- [ ] **Ramp speed CC20** and **ramp/bounce CC52** (new, not in the 2023 editor)
- [ ] Store on pedal: CC111 = slot (1–122)

## Warped Vinyl MKII

- [ ] Tap footswitch (CC93) and BPM input (two taps one beat apart)
- [ ] Bypass CC102 0/127
- [ ] **Ramp CC20** (new)
- [ ] MIDI clock listen/ignore CC51, clock divisions CC21 (0–5)
- [ ] Confirm the toggles really have no MIDI control (manual lists none — the editor no longer sends CC21–23 for
      them)

## Habit

- [ ] Tap (CC93), BPM input
- [ ] Bypass hold = loop (CC24), tap hold = scan (CC25); loop/scan switches in the panel
- [ ] **Clear memory = CC26** (the 2023 editor used CC53 — wrong per manual)
- [ ] Ramp fader CC20 (new), MIDI clock CC51
- [ ] Modifier and spread ideas set the expected toggles/knobs

## MOOD

- [ ] Wet / loop footswitches → CC103 = 127 / 85 / 45 / 0
- [ ] Changing the micro-looper toggle stops the looper (as in the 2023 editor)
- [ ] "Both on / both off" quick settings

## Reverse Mode C

- [ ] Knobs CC14–19, ramp speed fader CC20
- [ ] Toggles: modulation sync/off/free (CC21), vib/trem/freq (CC22), sequence run/off/env (CC23)
- [ ] Tap footswitch: click = tap (CC93), hold = freeze (CC105)
- [ ] Bypass footswitch: click = bypass (CC102), hold = half speed (CC106)
- [ ] Hidden options: subdivision (CC24), waveform (CC25), mod depth/rate (CC27/28), octave type (CC31),
      sequence spacing (CC33)
- [ ] Dip switches CC61–68, CC71–78; MOD TYPE dip changes the flavour shown under depth/rate
- [ ] MIDI clock (CC51): the manual's heading says "ignore", its value column says "0 = clock off, ≥1 = clock on".
      The editor follows the value column — confirm that CC51 = 1 makes the pedal follow MIDI clock
- [ ] Store on pedal (CC111) and recall; factory reset (CC56)

## Brothers AM

- [ ] Knobs CC14–19; presence CC27 (ch 2) / CC29 (ch 1) — compare with holding the footswitch and turning TONE
- [ ] Toggles: GAIN 2 TYPE boost/OD/dist (CC21 = 1/2/3), TREBLE BOOST full/off/half (CC22), GAIN 1 TYPE dist/OD/boost (CC23)
- [ ] Left footswitch = channel 2 (CC103), right = channel 1 (CC102)
- [ ] HI GAIN dips (CC71/72): the channel LED turns red — confirm the normal LED colour (editor shows amber)
- [ ] Dip switches CC61–68, CC71–77 (BANK has no CC)
- [ ] Store on pedal (CC111 = 1–122) and recall

## Clean

- [ ] Knobs CC14–19, ramp speed CC20; toggles release/mode/physics (CC21–23 = 1/2/3 left→right)
- [ ] Aux footswitch = swell (CC103); bypass hold = dynamics max (CC106)
- [ ] Hidden options CC24–29, envelope mode CC31, shifty mode CC32 (1 / 3), spread routing CC33
- [ ] Dip switches CC61–68, CC71–78; ramp/bounce CC52; factory reset CC56

## Onward

- [ ] Knobs CC14–19 (octave and texture off at noon), ramp speed CC20; toggles CC21–23
- [ ] Glitch footswitch = CC103, hold = lock sample (CC105); freeze = CC102, hold = CC106
- [ ] Retrigger glitch (CC108) and retrigger freeze (CC109) buttons
- [ ] Tap (CC93), MIDI clock follow (CC51), sync subdivision CC53 = 0–8, dry kill CC57, trails CC58
- [ ] Hidden options CC24–29, routing toggles CC31–33; dips CC61–68, CC71–78

## Lossy

- [ ] Knobs CC14–19, ramp speed CC20; toggles slope/packets/mode (CC21–23)
- [ ] Freeze footswitch: tap = slushie (CC103), hold = solid (CC105); bypass hold = gate (CC106)
- [ ] Hidden options CC24–29, weighting CC33; dips CC61–68, CC71–78; ramp/bounce CC52, dry kill CC57

## Lost + Found

- [ ] Knobs CC14–19; MODIFY below/above noon selects mode A/B — the readout names the mode
- [ ] Effect toggles CC21 (1–3) / CC23 (4–6), routing CC22 (L▸R / L+R / L◂R), spread routing CC32
- [ ] L footswitch = CC103 (hold CC105), R = CC102 (hold CC106)
- [ ] Hidden options CC20, CC24–30; L/R SWAP dips swap the mode names shown in the editor
- [ ] Tap (CC93), MIDI clock CC51, subdivisions CC53/54 (0–12), **CC52 ramping**: editor sends 1 = running, 0 =
      stopped (manual: "STOP RAMPING on = 0, off = 1 or >") — confirm
- [ ] Random mode commands CC112/113/114; factory reset CC56; dry kill CC57; dips CC61–68, CC71–78

## Blooper

- [ ] Knobs CC14–19, ramp CC20; toggles MOD A / MODE / MOD B (CC21–23 = 1/2/3), save toggle CC24 (preview / loop / save-load)
- [ ] Left footswitch: click = record on (CC1 = 127) / off (CC1 = 0 → playback); hold = one-shot overdub (CC9)
- [ ] Right footswitch: click = stop (CC4); hold = "hold switch B" (CC8: undo/redo menu, sampler looping on/off)
- [ ] Transport buttons: play CC2, overdub CC3, undo CC5, redo CC6, erase CC7 — confirm what CC1 = 0 does (play or stop?)
- [ ] **Modifier buttons** (edge): each click sends CC30 / CC31 = 127 and must toggle the modifier; the editor's
      on/off state and LED are a guess — if they drift from the pedal, click once more
- [ ] Sync pedal / editor defaults / preset load never send CC1–9, CC30, CC31
- [ ] **Loops are zero-based:** Recall loop 1 sends PC 0, loop 16 sends PC 15. Save: hold the right footswitch, press Recall
- [ ] MIDI clock CC51, ramping CC52, note division CC54 (0–7)

## BAD MOOD

- [ ] Knobs CC14–19, ramp speed CC20; toggles Soup/Relay/Flip (CC21), In / loop+In / loop (CC22), Burst/Radio/Mask (CC23)
- [ ] Wet footswitch: click = CC103, hold = freeze (CC105); loop footswitch: click = CC102, hold = overdub (CC106)
- [ ] **Flip chords:** with the wet channel in Flip, the MODIFY readout names the chord (1–48) — compare a few
      values against what you hear (e.g. 0 = -Oct, 127 = four notes)
- [ ] **Radio stations:** loop MODIFY readout (Tape / Ambient / Orchestral / Shoegaze / Dance) — the manual gives
      single values, the range boundaries are the editor's midpoints
- [ ] Hidden options CC24–30, sync CC31, spread CC32, cross input CC33; EQ per channel CC85
- [ ] Clock divisions CC53/54 = 0–8 (double whole = 8), MIDI clock CC51, stop ramping CC52, true bypass CC55
- [ ] Store CC111, factory reset CC56, MIDI reset CC110; tap CC93
