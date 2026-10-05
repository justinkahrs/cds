# Design

## Context

See proposal.md for motivation. `src/scripts/changer.ts` already funnels manual browsing through `move()` and renders selection separately from the animated scene. Normal browsing selects its target immediately; Surprise me changes selection as the animation crosses albums. Initial render, search, view changes, and animation settlement also invoke selection rendering, so unconditional sound inside render would create unwanted and duplicate ticks.

The existing `sony-carousel-redesign` design chose no default sound. This request supersedes that decision for navigation feedback; the controls still do not play music or control hardware. No main specs have been archived yet, so the delta adds distinct requirements to the established `carousel-browsing` capability path.

## Goals / Non-Goals

**Goals:** Keep feedback tiny, prompt, consistent across inputs, and independent of successful carousel operation.

**Non-Goals:** Music playback, sampled sound downloads, new packages, redesigning the controls, or adding a sound settings panel.

## Decisions

1. **Synthesize one short tick with a reusable Web Audio context.** Start tuning with a roughly 15 ms envelope (under 25 ms), a sub-millisecond softened attack, a fast decay, and a low-gain, damped click around 1.5–2 kHz. Aim for a dry mechanical detent without a ringing tail. Keep duration, tone, and level in a small helper under `src/lib/` so listening feedback is easy to apply. A downloaded sample adds an unnecessary request and decoding path; creating a context per tick adds overhead. Disconnect disposable nodes after completion.

2. **Opt into sound at browsing-driven selection updates.** Keep selection rendering silent by default. Manual movement and Surprise me selection updates may request a tick only when the active album identity changes, using the existing active-case comparison. Pass the sound intent through the immediate reduced-motion path. Settlement must not duplicate a manual tick; search, view changes, initial render, and visibility-triggered settlement stay silent. Do not attach playback directly to raw wheel or pointer events: many events do not change the selected album.

3. **Bound cadence without building a playback queue.** Use at least 50 ms between ticks. For multi-album jumps, emit at most one tick for the newly displayed selection and discard intermediate steps. Short envelopes finish before the next permitted tick. This preserves texture during Surprise me without accumulating a loud layered sound or playing stale ticks after a canceled spin. Ordinary one-step navigation remains one tick per change.

4. **Unlock lazily and tolerate silence.** Create/resume audio on trusted supported pointer, touch-completion, click, or keyboard interactions in the changer, with no sound for activation alone. A wheel event is not an activation-triggering event, so wheel-only browsing on a fresh page may remain silent until a permitted interaction; do not try to bypass policy. Only schedule a tick when the context is running and the document is visible. Catch creation/resume failures, avoid repeated outstanding resume requests, and never queue missed sounds behind an asynchronous resume. Reattempt on a later permitted interaction as needed. See [MDN user activation](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation) and [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).

## Risks / Trade-offs

- Loudness varies by speakers and system volume → start with conservative gain and audition slow and rapid browsing on headphones and speakers; do not claim a fixed acoustic loudness from a gain value.
- Browsers differ in audio activation, especially first touch/drag → validate fresh-page wheel behavior and click/tap/keyboard activation; preserve browsing when sound is unavailable and document the limitation.
- Sound during render or asynchronous resume could create stale ticks → explicit browsing intent, identity comparison, visibility checks, and no catch-up queue.
- Automated tests cannot judge whether a tick feels satisfying → use browser behavior checks plus a listening pass; report if acoustic verification is unavailable.

## Migration Plan

Implement the audio helper and focused changer integration, then update the README's statement that controls do not play audio to distinguish navigation ticks from music playback. Run existing tests and the production build, and check the spec scenarios in a browser. Publish only when requested. Reverting the source and README changes restores silent browsing; there is no data migration.
