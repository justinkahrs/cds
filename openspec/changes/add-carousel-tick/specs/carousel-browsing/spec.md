# Spec Delta

## Purpose

Make browsing the personal CD catalog feel like selecting albums on a physical changer while keeping every album accessible.

## ADDED Requirements

### Requirement: Subtle audible album navigation
When browser audio is available and permitted, the changer SHALL provide a very quiet, dry tick for a user-initiated change to a different selected album. The tick SHALL last no more than 25 milliseconds, with a soft attack and short decay rather than a sustained tone. Navigation SHALL remain equally functional without sound.

#### Scenario: Manual browsing
- **WHEN** the visitor selects a different album using the jog dial, horizontal wheel gesture, horizontal drag or swipe, previous/next controls, keyboard navigation, or an album case
- **THEN** one tick accompanies that selection update when audio is permitted
- **AND** wrapping through either end behaves the same way
- **AND** settling the animation does not play a duplicate tick

#### Scenario: Fast browsing and surprise spin
- **WHEN** album selection changes rapidly during manual browsing or a user-initiated Surprise me spin
- **THEN** ticks follow selection updates at a maximum rate of 20 per second
- **AND** intermediate ticks exceeding that rate are dropped rather than queued or layered
- **AND** no delayed sequence plays after browsing stops or the spin is interrupted

#### Scenario: Unchanged or non-browsing selection
- **WHEN** the page initializes, restores a remembered album, filters search results, switches views, or receives navigation that leaves the same album selected
- **THEN** no tick plays for that operation
- **AND** empty and single-album results remain silent

### Requirement: Browser-compatible navigation feedback
Navigation sound SHALL respect browser audio restrictions, remain silent in hidden documents, and fail without interrupting browsing. The effect SHALL require no external audio request. Reduced-motion mode SHALL retain feedback for actual user-selected album changes without introducing animation.

#### Scenario: Audio blocked or unavailable
- **WHEN** audio is unsupported, cannot be created or resumed, or is blocked by browser policy
- **THEN** album browsing and links continue working without an uncaught audio error
- **AND** failed ticks are discarded rather than replayed after audio later becomes available

#### Scenario: Unlocking sound
- **WHEN** a supported user interaction permits the browser to start audio
- **THEN** subsequent album navigation can play ticks
- **AND** the unlocking interaction itself produces no sound unless it selects a different album

#### Scenario: Hidden page
- **WHEN** the document becomes hidden during navigation or a surprise spin
- **THEN** no further ticks are scheduled while hidden
- **AND** returning to the page does not replay missed ticks

#### Scenario: Reduced motion
- **WHEN** the visitor navigates or activates Surprise me with reduced motion enabled
- **THEN** the selection changes immediately with at most one tick for the new album
