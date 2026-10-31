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

## Automatone series (Preamp MKII, CXM 1978, Big Time)

Connection: 5-pin MIDI cable from the interface's MIDI OUT straight into MIDI IN, no TRS box.

- [ ] Every fader moves the **motorized fader** on the pedal; "Sync pedal" moves all six at once
- [ ] Arcade buttons: each state lights the LED colour printed on the pedal (CXM / Preamp send 1 / 2 / 3, Big Time 0–3)
- [ ] Recall preset 3 (PC 3), then **PRESET** on screen steps to 4; hold PRESET switches the bank (PC +10); the
      BANK LED on screen matches the pedal (off / red / green)
- [ ] Store: slot 0 works (CC27 = 0); hold **BYPASS** on screen saves into the last recalled slot
- [ ] The display on screen shows the same preset digit as the pedal after a recall

### CXM 1978

- [ ] Heel / Toe position (CC28 / 29) move the faders if the preset has expression programmed; Buffer clear (CC30)
- [ ] Sustain lock (CC31 = 0) holds the tail, off (CC31 = 1) fades it

### Preamp MKII

- [ ] MIDS button Off: MIDS and FREQ faders stop reacting (editor marks them inactive)

### Big Time

- [ ] Left switch: tap tempo in SHORT / LONG (CC103 = 127), motion on / off in MOD, record in LOOP — does a value
      of 127 count as one tap every time? If taps are lost, try alternating values
- [ ] Right switch: bypass (CC102 0 / 1) in the delay modes, play / stop (CC102 = 127) in LOOP; hold = HOLD (CC106
      1 / 0) vs. delete (CC106 = 127)
- [ ] Alt layer: SHIFT on screen shows the alt controls; TEXTURE … DRY (CC32–37) and SPREAD / 0.5X / DIFFUSE TYPE /
      +12 dB (CC38–41) reach the pedal
- [ ] Options menu CC42–48 and tap subdivision CC54; MIDI clock CC110 (not in MOD mode); MIDI notes CC112
- [ ] Save to current slot (CC28); is PC 126 the last valid slot, or does PC 127 work too?

## Older analog pedals (Thermae, Dark World, Tonal Recall, Bliss Factory, Condor, Gravitas, Warped Vinyl HiFi)

Their MIDI manuals are one-pagers: no dip switch CCs, mostly no toggle CCs. The editors send only what is printed.

- [ ] Gravitas answers on **channel 4**, Warped Vinyl HiFi on **channel 6** by default (the editor starts there)
- [ ] Condor / Condor HiFi / Dark World: the two footswitch states go out as one CC103 value (0 / 45 / 85 / 127; HiFi
      15 / 45 / 75 / 110) — check all four combinations land in the right state on the pedal
- [ ] Condor HiFi toggles: values 1 / 2 / 3 select left / middle / right (manual prints "0, 1 / 2 / 3 or more")
- [ ] Thermae: hold TAP on screen = runaway (CC24 127 / 0); SLOWDOWN switch (CC25) halves the sequencer; the three
      toggles move with CC21–23 whatever mode the pedal is in
- [ ] Tonal Recall RKM: same mapping as the Tonal Recall (no RKM MIDI manual exists) — confirm CC14–21, 51, 93, 102
- [ ] Bliss Factory: AUX footswitch = CC101 1 / 0; the AuxPol dip reverses the direction on the pedal, not in the editor
- [ ] Dark World: CC23 value 1 = Spring, 3 = Hall (panel prints SPRING · PLATE · HALL left to right)
- [ ] Clock divisions (CC21) on Gravitas / Warped Vinyl HiFi / Tonal Recall: the editor switches clock listening on
      (CC51 = 127) with the first division you pick
