# Bliss Factory

Default channel 2. Save: only PC while holding both footswitches (no save CC documented).
Source: Bliss-Factory_MIDI-Manual_Chase-Bliss (Chase Bliss × ZVEX, PDF dated 2020); panel and dip labels from
Bliss-Factory_Manual_Chase-Bliss (2020).

Short one-page MIDI manual. It documents **no dip-switch CCs** (no 61–78), no tap CC, no MIDI clock CC51, no ramp
CC20, no hold CCs, no CC103, no CC111 and no factory reset. Bliss Factory is a fuzz (ZVEX Fuzz Factory with digital
control and a resonant LPF); it has no tap tempo. The second footswitch is AUX, on CC101.

## Knobs
| CC | Control | Values |
|---|---|---|
| 14 | VOLUME | value 0 = fully counter-clockwise, value 127 = fully clockwise |
| 15 | GATE (becomes RAMP speed when a ramping dip is on) | value 0–127, as above |
| 16 | COMP | value 0–127, as above |
| 17 | DRIVE | value 0–127, as above |
| 18 | STAB | value 0–127, as above |
| 19 | LPF | value 0–127, as above |

The five fuzz knobs are bias / level controls: DRIVE "becomes meaningless when COMP is all the way right"; STAB fully
right = classic fuzz, left = squishy / self-oscillation; GATE right closes the gate.

## Toggles
| CC | Toggle | Values |
|---|---|---|
| 21 | AUX FUNC Select (printed STAB / LPF / GATE) | value 1 = left, value 2 = middle, value 3 = right |
| 22 | FAT Select (printed FATTER / FAT / NORM) | value 1 = left, value 2 = middle, value 3 = right |
| 23 | LPF Select (printed one-pole / two-pole / resonant icons) | value 1 = left, value 2 = middle, value 3 = right |

LPF toggle: left = one-pole gentle filter, middle = two-pole resonant, right = two-pole with enough resonance to
self-oscillate. The printed left→right order of the AUX FUNC and FAT labels is read from the panel art (vertical
text); which value is NORM vs FATTER is UNVERIFIED.

## Footswitches
| CC | Function | Values |
|---|---|---|
| 102 | BYPASS SWITCH (right footswitch) | value 0 = bypass, value 1–127 = engage |
| 101 | AUX FUNC (left footswitch) | value 0 = bypass the AUX function, value 1–127 = engage the AUX function |

AUX applies the function picked by the AUX FUNC toggle: STAB = STAB maxed out, LPF = jump between max LPF and knob
LPF, GATE = close the gate (max CW). The AuxPol dip (U default) reverses it. The MIDI/AUX jack doubles as a momentary
normally-open switch input for AUX.

## Other
| CC | Function | Values |
|---|---|---|
| 100 | EXPRESSION | value 0 = heel, value 127 = toe; the dips select the parameter(s) |

With a plug in EXP/CV and no parameter dip set, expression controls GATE (as if the rise dip were on).

## Presets
PC 0 = live (preset toggle middle), PC 1 = right slot, PC 2 = left slot, PC 1–122 recall; empty slot = nothing recalled.
Save = send a PC while holding both footswitches. Manual wording differs from the other pedals: "Slots 1 and 2 are the
presets that can only be saved via the preset toggle and can be activated either directly from the pedal using the
preset toggle, or a MIDI controller." The manual also mentions up to 6 presets via the Faves controller.

## Dip switches (user manual, no CCs documented)
| Dip | Left bank (on / off, expression or ramp) | Right bank (rise / fall) |
|---|---|---|
| dip one | Volume | Volume |
| dip two | Comp | Comp |
| dip three | Drive | Drive |
| dip four | Stab | Stab |
| dip five | LPF | LPF |
| dip six | Bounce | Shape (ramp shape: triangle / linear default, square) |
| dip seven | MoTAux (momentary AUX footswitch) | AuxPol (U = up default, D = down) |
| dip eight | MoTByp (momentary bypass) | Sweep (T = top, B = bottom) |

GATE is not rampable (it is the ramp-speed knob).
