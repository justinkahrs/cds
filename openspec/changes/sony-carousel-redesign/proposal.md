# Proposal

## Why

The flat editorial catalog does not evoke browsing the user's Sony 300-disc changer. Make choosing an album feel like turning its physical carousel, using the supplied player photos as visual references.

## What Changes

- Introduce a dimensional carousel with jewel cases, a slotted platter, numbered locations, smoked glass, and a fluorescent display.
- Support drag, touch, keyboard, previous/next, a jog dial, and random album selection.
- Integrate search and a switchable full album index while preserving artist and album routes, source slot strings, local cover art, and fallbacks.
- Carry the dark hardware identity through the existing static Astro site with responsive and reduced-motion behavior.
- Keep the player height stable across selections, prevent case intersections, and animate surprise selection through a spin that slows to a stop.

## Capabilities

### New Capabilities

- `carousel-browsing`: Physical changer-inspired catalog browsing and synchronized album selection.

### Modified Capabilities

None. The previous editorial presentation is superseded by this requested visual direction; existing catalog and detail functionality remains.

## Impact

Astro homepage, shared layout and CSS, new carousel component and client logic, README, favicon, and tracked OpenSpec artifacts. No framework migration, runtime external API, sheet changes, audio playback, or physical hardware control.
