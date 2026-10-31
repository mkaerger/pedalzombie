# Dark World

Default channel 2. Save: only PC while holding both footswitches (no save CC documented).
Source: Dark-World_MIDI-Manual_Pedal_Chase-Bliss (PDF dated 2018); panel and dip labels from
Dark-World_Manual_Pedal_Chase-Bliss (2018).

Short one-page MIDI manual. It documents **no dip-switch CCs** (no 61–68 / 71–78), no tap CC, no MIDI clock CC51,
no ramp CC20, no hold CCs, no CC111 and no factory reset. Dark World is a dual-channel reverb with no tap tempo.

## Knobs
| CC | Control | Values |
|---|---|---|
| 14 | DECAY (becomes RAMP speed when a ramping dip is on) | value 0 = fully counter-clockwise, value 127 = fully clockwise |
| 15 | MIX | value 0–127, as above |
| 16 | DWELL | value 0–127, as above |
| 17 | MODIFY | value 0–127, as above |
| 18 | TONE | value 0–127, as above |
| 19 | PRE-DELAY | value 0–127, as above |

DECAY and MODIFY change meaning with the Dark program: MOD = reverb decay / VHS warble amount, SHIM = path-swap LFO
time / octave mix (noon = none, CW = +1 oct, CCW = −1 oct), BLACK = freeze threshold (fully CW = never overwritten)
/ frozen-audio volume.

## Toggles
| CC | Toggle | Values |
|---|---|---|
| 21 | Dark Program Select (printed MOD / SHIM / BLACK) | value 1 = left, value 2 = middle, value 3 = right |
| 22 | Para Toggle Select (printed PARA / D>W / W>D) | value 1 = left, value 2 = middle, value 3 = right |
| 23 | World Program Select (printed SPRING / PLATE / HALL) | value 1 = left, value 2 = middle, value 3 = right |

The routing toggle only matters when both channels are active: PARA = parallel, D>W = Dark into World, W>D = World
into Dark. Printed order left→right is taken from the panel photo; the manual headings read "MOD | SHIM | BLACK" and
"HALL | PLATE | SPRING" — which value maps to HALL vs SPRING is UNVERIFIED.

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS SWITCH (whole pedal) | value 127 = engages the last saved bypass state of the pedal, value 0 = bypasses the pedal |
| 103 | BYPASS SWITCH (per channel, D = left footswitch, W = right footswitch) | value 127 = D and W engaged, value 85 = D engaged and W bypassed, value 45 = W engaged and D bypassed, value 0 = both bypassed |

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EXPRESSION | value 0 = expression pedal fully "off", value 127 = fully depressed; the dips select the parameter(s) |

With a plug in EXP/CV and no parameter dip set, expression controls DECAY (behaves as rise + bottom sweep; maxing it in
SHIM acts as a freeze).

## Presets
PC 0 = Live (preset toggle middle), PC 1 = right slot, PC 2 = left slot, PC 1–122 recall; empty slot = nothing recalled.
Save = send a PC while holding both footswitches. The manual also mentions up to 6 presets via the Faves controller.

## Dip switches (user manual, no CCs documented)
| Dip | Left bank (on / off, expression or ramp) | Right bank (rise / fall) |
|---|---|---|
| dip one | Mix | Mix |
| dip two | Dwell | Dwell |
| dip three | Modify | Modify |
| dip four | Tone | Tone |
| dip five | PD (Pre-Delay) | PD (Pre-Delay) |
| dip six | Bounce | Buffer |
| dip seven | MoTB D (momentary D footswitch) | Trails |
| dip eight | MoTB W (momentary W footswitch) | Sweep (T = top, B = bottom) |

DECAY is not rampable (it is the ramp-speed knob). The MIDI jack doubles as a momentary normally-open switch input
that toggles channel D.
