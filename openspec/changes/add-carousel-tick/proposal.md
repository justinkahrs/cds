# Proposal

## Why

The album carousel looks and moves like physical hardware but gives no audible feedback. A tiny, dry tick at each album change would make browsing feel more tactile without distracting from the collection.

## What Changes

- Add a very quiet, short mechanical tick when browsing selects a different album through the jog dial, horizontal wheel/drag, buttons, keyboard, or album-case selection.
- Let the tick follow selection changes during Surprise me, with a bounded cadence so fast motion cannot become a loud buzz or a backlog of clicks.
- Keep initialization, search, view changes, unchanged selections, and background tabs silent. Sound remains optional to successful browsing when the browser blocks or lacks audio support.
- Generate the effect locally with Web Audio; no downloaded sound asset or new dependency.

## Capabilities

### New Capabilities

- `carousel-browsing`: Add requirements for subtle navigation sound alongside the existing carousel requirements in the unarchived `sony-carousel-redesign` change. There are currently no main specs; reuse that capability path instead of inventing a parallel browsing capability.

### Modified Capabilities

None in the main spec inventory.

## Impact

- `src/scripts/changer.ts`: Audio activation and selection-change integration.
- A small local audio helper under `src/lib/`: Synthesized tick, bounded playback, and graceful failure.
- `README.md`: Distinguish navigation feedback from music playback.
- Supersedes the earlier carousel design's “no default sound” decision only for user-initiated browsing feedback. No album playback, hardware integration, or deployment changes.
