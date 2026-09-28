# Spec Delta

## Purpose

Make the personal CD catalog feel like browsing a physical 300-disc changer while keeping every album and its location accessible.

## ADDED Requirements

### Requirement: Dimensional album selection
The homepage SHALL present a rotating, slotted carousel with album artwork, a selected album display, and the exact source changer-slot string. Selection SHALL follow physical slot order (first listed slot for multi-disc releases, unassigned albums last) and wrap through the available albums using previous/next controls, horizontal drag or touch, keyboard arrows, a jog dial, and a random-selection control.

#### Scenario: Changing selection
- **WHEN** a visitor advances or reverses the carousel
- **THEN** the carousel, title, artist, release metadata, detail link, and changer location update together
- **AND** crossing either end wraps to the other end

#### Scenario: Multi-disc selection
- **WHEN** an album has multiple changer slots
- **THEN** the display preserves the entire source slot string

#### Scenario: Stable player dimensions
- **WHEN** a visitor browses between short and long titles, including the Lord of the Rings soundtrack
- **THEN** the player height and control positions remain unchanged at the current viewport width
- **AND** the complete title remains readable within the details area or album page

#### Scenario: Case clearance
- **WHEN** the carousel is stationary or turning
- **THEN** neighboring jewel cases follow a shared circular path with sufficient spacing to avoid intersecting surfaces
- **AND** rear case edges do not show through foreground cases

#### Scenario: Surprise spin
- **WHEN** a visitor activates Surprise me with at least two matching albums
- **THEN** the carousel visibly spins through albums and slows to the destination selected at the start
- **AND** the final displayed album and links match that destination
- **AND** manual navigation or a search cancels the spin without a later stale selection

### Requirement: Focused collection entry
The homepage SHALL begin with the collection controls without a separate promotional introduction, and the shared navbar SHALL omit its descriptive caption.

#### Scenario: Opening the collection
- **WHEN** a visitor opens the site at desktop or mobile width
- **THEN** collection controls appear directly below the navbar
- **AND** the navbar contains the brand and navigation without a tagline

### Requirement: Mobile changer hierarchy
At mobile widths, the selected-album information SHALL appear before the carousel, and the jog dial SHALL appear immediately after the carousel as the most prominent browsing control. Desktop SHALL retain the side-by-side carousel and information panel with the dial in the hardware control deck.

#### Scenario: Browsing on a phone
- **WHEN** a visitor browses at a viewport no wider than 680 pixels
- **THEN** album information appears before the carousel artwork
- **AND** a prominent, touch-sized jog dial follows the carousel before the other hardware controls
- **AND** changing albums does not shift the player dimensions or dial position

### Requirement: Search and alternate browsing
The site SHALL provide search by album, artist, or slot and a full album grid with working album and artist links. Filtering SHALL update the carousel and result count, and a zero-result search SHALL show a recoverable empty state without stale selected-album controls.

#### Scenario: Empty search
- **WHEN** a visitor enters a query with no matches
- **THEN** the site shows an empty state and allows clearing the query to restore browsing

### Requirement: Accessible static experience
The site SHALL retain static routes, local cover artwork, no-art fallbacks, visible keyboard focus, narrow-screen usability, reduced-motion support, and access to the album index without JavaScript. Carousel controls SHALL describe browsing rather than imply audio playback or physical hardware control.

#### Scenario: Motion preference
- **WHEN** reduced motion is enabled
- **THEN** album selection remains functional without animated carousel movement
- **AND** Surprise me chooses its destination immediately without spinning

#### Scenario: Artwork or script unavailable
- **WHEN** artwork fails or JavaScript is unavailable
- **THEN** album titles and detail links remain available and usable
