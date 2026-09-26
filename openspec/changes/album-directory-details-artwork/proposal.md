# Proposal

## Why

The current catalog only presents one flat album list, so finding an artist or getting context for a particular album takes more work than it should. An artist directory, album detail pages, stable Discogs links, and credited cover art will make the collection easier to browse while keeping changer locations clear.

## What Changes

- Add an alphabetical artist directory and artist pages that list each artist's albums.
- Add an album detail page for every catalog entry, with release details, changer location, and external links.
- Link to the matching Discogs release and artist profile when source identifiers resolve them.
- Display MusicBrainz Cover Art Archive cover art when a verified release-group match has a front image; show a designed placeholder otherwise.
- Cache Cover Art Archive images during GitHub Actions builds and deploy them as same-origin static assets so visitor page views do not request artwork from external services.
- Replace the vinyl-record hero and flat list styling with a CD-focused editorial catalog design.
- Preserve the existing static-site and checked-in snapshot model, including displayed changer-slot strings.

## Capabilities

### New Capabilities

- `cd-collection-experience`: Artist browsing, album detail pages, external references, and cover artwork for the public CD catalog.

### Modified Capabilities

None.

## Impact

The Astro routes and shared styles, catalog snapshot importer and data, Google Sheet metadata columns, GitHub Pages workflow, and README will change. The public site remains static and does not request Google Sheets or Cover Art Archive at runtime. Cover images are fetched and cached during builds, then served from the deployed site with attribution and a no-art fallback.
