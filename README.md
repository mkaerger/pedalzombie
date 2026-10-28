# 🧟 pedalzombie

**Free Web MIDI editors for Chase Bliss pedals.** Open [pedalzombie.com](https://pedalzombie.com), plug in a MIDI
interface, pick your pedal — and every knob, toggle, dip switch and hidden option is on your screen. Randomize sounds,
save presets, store them on the pedal. No install, no account, nothing leaves your browser.

| Pedal | Editor |
|---|---|
| BAD MOOD | [/badmood-editor/](https://pedalzombie.com/badmood-editor/) |
| Lost + Found | [/lostfound-editor/](https://pedalzombie.com/lostfound-editor/) |
| Onward | [/onward-editor/](https://pedalzombie.com/onward-editor/) |
| Clean | [/clean-editor/](https://pedalzombie.com/clean-editor/) |
| Lossy | [/lossy-editor/](https://pedalzombie.com/lossy-editor/) |
| Brothers AM | [/brothersam-editor/](https://pedalzombie.com/brothersam-editor/) |
| Reverse Mode C | [/reversemodec-editor/](https://pedalzombie.com/reversemodec-editor/) |
| MOOD MKII | [/moodmkii-editor/](https://pedalzombie.com/moodmkii-editor/) |
| Generation Loss MKII | [/generationloss-editor/](https://pedalzombie.com/generationloss-editor/) |
| Habit | [/habit-editor/](https://pedalzombie.com/habit-editor/) |
| Blooper | [/blooper-editor/](https://pedalzombie.com/blooper-editor/) |
| MOOD | [/mood-editor/](https://pedalzombie.com/mood-editor/) |
| Warped Vinyl MKII | [/warpedvinyl-editor/](https://pedalzombie.com/warpedvinyl-editor/) |

Every MIDI mapping was transcribed from the official Chase Bliss manuals and is checked by tests
(see [docs/midi](docs/midi)). Works in Chrome, Edge and Opera — the browsers that support Web MIDI.

pedalzombie is an independent fan project by [Marco](https://pedalzombie.com/about/) from Munich and is not
affiliated with Chase Bliss. If an editor saved you from crawling under your pedalboard, I'm happy. If you found a
bug or own a pedal that is missing here, open an issue.

## Why

Chase Bliss pedals hide half of their power behind dip switches on the back and "hold both footswitches" menus.
MIDI can reach all of it — but nobody wants to look up CC numbers mid-jam. These editors draw the pedal on screen
and translate every click into the right MIDI message.

## How it works

```
src/
  editor/core/   framework-free engine: control model, MIDI, presets, tap tempo, analytics events
  editor/ui/     React components that render any pedal definition
  pedals/        one file per pedal — pure data plus a few small rules
  pages/         Astro pages; content pages are MDX
docs/midi/       MIDI reference per pedal, transcribed from the official manuals
docs/            hardware test checklist
```

A pedal is **data**. `src/pedals/<pedal>.ts` declares its knobs, toggles, dip switches, footswitches (press and
hold), hidden options, presets, tap tempo and LEDs. The engine knows nothing about specific pedals: all value changes
go through one path (`coerce → rules → commit → send MIDI once per CC`), and the UI renders whatever the definition
says. Adding a pedal means adding one file — the page, the home page card and the consistency tests come for free.

Stack: [Astro](https://astro.build) (static site), React + TypeScript (editors), [webmidi](https://webmidijs.org) v3,
Vitest. The build is plain static files, hosted on ordinary shared hosting.

## Development

Requires Node 22.23.4 or newer (see `.nvmrc`; Astro 7 refuses older 22.x builds).

```sh
npm install
npm run dev        # http://localhost:4321
npm test           # unit tests — engine, MIDI, presets, every pedal definition against docs/midi
npm run check      # type check
npm run build      # static build into dist/
```

### Adding a pedal

1. Write `docs/midi/<pedal>.md` from the official MIDI manual (tables — the tests read them).
2. Create `src/pedals/<pedal>.ts`; copy the closest existing pedal.
3. Add it to `src/pedals/index.ts`.
4. `npm test` checks unique ids, valid ranges, that every control is reachable in the UI, and that every CC the
   editor sends is documented in `docs/midi` — and vice versa.
5. Run through [docs/hardware-test.md](docs/hardware-test.md) with the real pedal.

### Compatibility with the 2023 editors

Presets saved with the old editors keep working: the localStorage keys and control ids (`k1`, `t1`, `d9`, …) are
unchanged, and missing or unknown values are sanitized on load. Never rename a `storageKey` or a control id.

## Privacy

Presets, MIDI channel and device stay in the browser's local storage. Google Analytics loads only after the visitor
accepts the cookie banner; the editor then reports which features are used (connect, randomize, presets, footswitches —
no values, no MIDI data).

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs tests, type check and build on every push and
pull request. The upload to the web root happens only when the workflow is started by hand (Actions → Deploy →
Run workflow): folders the build produces are mirrored with delete (stale files from older builds disappear);
anything else on the server is left alone.

The workflow needs three repository secrets: `SFTP_HOST`, `SFTP_USER`, `SFTP_PASSWORD`.

`npm run deploy` is a manual fallback from a Mac: it backs up the online state into `.deploy/` and uploads via
`sftp`. Connection settings come from `../sftp.conf`, the password from the macOS keychain item `pedalzombie-sftp`.
No credentials live in this repository.

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, build your own editors with it.

## Credits

- Chase Bliss for the pedals and the public MIDI manuals.
- The zombie is the "man zombie" from [Fluent Emoji](https://github.com/microsoft/fluentui-emoji),
  © Microsoft Corporation, MIT license.
