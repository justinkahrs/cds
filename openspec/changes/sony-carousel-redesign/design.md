# Design

## Context

The existing Astro app pre-renders 170 albums and artist pages from JSON. Shared vanilla CSS and locally cached artwork already support stable detail routes and image fallbacks. See proposal.md for motivation. The supplied references show black Sony hardware, a densely slotted circular drum, fluorescent text, and a large jog dial.

## Goals / Non-Goals

**Goals:** Deliver depth and tactile interaction with the existing Astro stack and native browser rendering; keep selection state consistent across every control.

**Non-Goals:** Audio playback, hardware integration, metadata edits, framework migration, or external runtime image requests.

## Decisions

- Use CSS perspective and transformed jewel cases above an elliptical slotted platter. This keeps the artwork legible and DOM-accessible without a WebGL dependency. Model the loaded albums, rather than inventing data for all 300 slots.
- Use one client-side selection index over a filtered snapshot ordered by first physical changer slot; leave the static grid alphabetical by artist. A bounded visible neighborhood limits active transforms and image work. Normalize wrapping, slot ordering, and shortest index offsets in pure functions for meaningful unit checks.
- Search and carousel/grid view controls share the same dataset. Preserve the static grid as progressive enhancement fallback; enhance only after initialization.
- Use graphite surfaces, restrained warm-white typography, mint phosphor displays, engraved labels, and a tactile jog wheel. Extend shared dark tokens to album and artist routes.
- Horizontal touch gestures preserve vertical page scrolling. Keyboard arrows operate within the carousel, not in text fields. Reduced motion removes transform transitions; no autonomous rotation or default sound.
- Fix the viewport and detail-panel dimensions at each responsive breakpoint. Allow the metadata area to scroll independently so long titles remain readable without moving the controls or resizing the player.
- Drive every case from one continuous angular position using animation frames, with enough angular clearance for the full jewel-case width. Hide rear-facing cases and use opaque case bodies to prevent edges showing through neighboring cases. This replaces independent straight-line transform transitions.
- Surprise selection chooses its destination before starting, advances through at least one visual revolution, and eases into the chosen album. Manual navigation and search cancel ongoing motion; reduced motion selects immediately. Keep announcements quiet while spinning and announce the settled selection.

## Risks / Trade-offs

- Dense three-dimensional artwork can be hard to read → enlarge the selected case and show separate metadata and detail link.
- Long album titles and multi-disc slots → use a fixed-height, scrollable metadata area and retain full unmodified location text.
- Cover service availability → use the existing cache/fallback contract, report any build-fetch limitation separately from application checks.
- Mobile perspective can overflow → clip only the visual stage and stack controls below it.

## Migration Plan

Build and inspect locally at desktop and mobile widths. Publish only through the existing deployment workflow when requested. Reverting these source changes restores the previous presentation without a data migration.
