# Spec Delta

## Purpose

Helps visitors browse a personal CD collection by artist, inspect album details, and follow reliable external references while keeping physical changer locations easy to find.

## ADDED Requirements

### Requirement: Catalog snapshots retain optional external metadata

The generated catalog MUST retain each row's Discogs release identifier, Discogs artist profile URL, and MusicBrainz release-group identifier when those values are present in the source. Missing external metadata MUST remain optional, and synchronization MUST preserve the source's displayed changer-slot value unchanged.

#### Scenario: Synchronize enriched album metadata
- **WHEN** a source row has Discogs and MusicBrainz metadata
- **THEN** the checked-in catalog snapshot retains those values as strings together with the unchanged displayed changer-slot value

#### Scenario: Synchronize a row without enrichment
- **WHEN** a source row lacks one or more external metadata values
- **THEN** the row remains in the catalog with missing metadata omitted

### Requirement: Visitors can browse an artist directory

The catalog MUST provide an artist directory with artists in alphabetical order and a dedicated artist page listing that artist's albums. Each album shown in the directory or on an artist page MUST link to its album detail page.

#### Scenario: Browse artists alphabetically
- **WHEN** a visitor opens the artist directory
- **THEN** the directory lists each distinct artist once in alphabetical order and provides a link to that artist's page

#### Scenario: Browse albums by artist
- **WHEN** a visitor opens an artist page
- **THEN** the page shows that artist's albums and links each album to its detail page

### Requirement: Visitors can open album detail pages

Each catalog album MUST have a stable detail page showing its artist, title, full changer-slot value, and available release year, label, and format. Visitors MUST be able to return to the catalog and navigate to the associated artist page.

#### Scenario: Inspect album details
- **WHEN** a visitor opens an album detail page
- **THEN** the page displays the album identity, its complete changer-slot value, and any available release metadata

#### Scenario: Album occupies multiple changer slots
- **WHEN** an album's changer-slot value contains multiple locations
- **THEN** the detail page presents the entire value exactly as supplied by the catalog data

### Requirement: Album details link to Discogs

Album detail pages MUST link directly to the matching Discogs release and artist profile when the corresponding source identifiers or resolved profile URL are available. Unavailable links MUST be omitted rather than pointing to an unrelated result.

#### Scenario: Direct Discogs release and artist links are available
- **WHEN** an album has a Discogs release identifier and a resolved Discogs artist URL
- **THEN** its detail page links to that release and artist profile on Discogs

#### Scenario: External metadata is unavailable
- **WHEN** a Discogs release identifier or artist URL is missing
- **THEN** the detail page omits only the unavailable Discogs link and remains usable

### Requirement: Album pages use sourced artwork when available

Album pages and catalog entries MUST display front-cover artwork from the MusicBrainz Cover Art Archive when a verified release-group identifier has available artwork. Pages MUST retain a legible CD-themed placeholder when a match or image is unavailable, and MUST attribute the artwork source with a link to its source record.

#### Scenario: Matched cover art is available
- **WHEN** an album has a verified MusicBrainz release-group identifier and a Cover Art Archive front image
- **THEN** the catalog displays that image and identifies the Cover Art Archive as its source

#### Scenario: Cover art is unavailable
- **WHEN** no verified release-group match or front image exists
- **THEN** the page displays the album title in a designed placeholder without a broken-image state

### Requirement: The catalog uses a CD-focused visual design

The public catalog MUST use a responsive visual design appropriate to a CD collection and MUST NOT use a vinyl-record graphic as its primary collection motif.

#### Scenario: Browse on a narrow screen
- **WHEN** a visitor uses the artist directory, catalog, or detail page on a narrow screen
- **THEN** the content and navigation remain readable and operable without horizontal page scrolling
