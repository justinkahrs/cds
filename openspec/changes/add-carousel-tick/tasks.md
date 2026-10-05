# Tasks

## 1. Navigation tick

- [x] 1.1 Add a small Web Audio helper with a quiet envelope under 25 ms, one reusable context, node cleanup, a minimum 50 ms interval, visibility checks, and caught creation/resume failures. Verify the duration and cadence with browser instrumentation and confirm unsupported or blocked audio produces no uncaught error or deferred ticks.
- [x] 1.2 Connect trusted audio activation and explicit browsing-driven selection updates in `src/scripts/changer.ts`. Verify wheel, jog dial, drag/touch, buttons, keyboard, case selection, wrapping, and Surprise me; confirm no duplicate settlement ticks and silence on initialization, search, view changes, unchanged selection, and empty/single-album results. Check reduced-motion and hidden-page behavior against the spec scenarios.
- [x] 1.3 Update `README.md` to describe the subtle navigation tick, distinguish it from music playback, and explain that browser audio permission can require an initial click/tap/keypress. Verify the text matches the implemented behavior.

## 2. Integration validation

- [x] 2.1 Run `npm test` and `npm run build`, then verify fresh-page audio activation and uninterrupted browsing with audio blocked in available desktop/mobile browser environments. Audition slow browsing and rapid spins for a quiet, dry tick without ringing or stacked loudness; record any browser or listening coverage that could not be verified.

## Validation — 2026-10-05

- `npm test`: all 10 existing tests pass. `npm run build`: 282 static pages built successfully. `git diff --check`: clean.
- Instrumented Chromium browsing passed wheel, dial click/rotation, drag, transport, keyboard, case selection, wrapping, Surprise me, and reduced-motion checks. Initial loading, remembered selection restoration, search, empty/single-album results, unchanged selection, view changes, and simulated document hiding stayed silent. Canceled spins and restored visibility produced no backlog.
- Measured 15 ms buffers with silent endpoints and a conservative peak (about 0.018 in the inspected sample). One context was reused; all 71 observed voices disconnected. The shortest measured interval was 53.3 ms, above the 50 ms minimum, with no browser errors.
- Unsupported audio, constructor failure, rejected/thrown resume, and pending resume were simulated in Chromium: browsing continued, errors were caught, pending resumes were not duplicated, and unlocking did not replay stale ticks. Chromium mobile emulation passed tap activation, dial tap/rotation, horizontal touch swipe, and reduced-motion Surprise me.
- Coverage limits: no physical phone, Safari/Firefox, or subjective headphone/speaker listening was verified. Timing, amplitude, envelope, cadence, and cleanup were checked programmatically; the local preview is available for listening and volume tuning.
