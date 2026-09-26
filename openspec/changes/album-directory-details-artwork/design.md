# Design

## Context

The site is a static Astro app built from `src/data/albums.json`. The sync reads displayed slot values from the Google Sheet and currently omits its existing `release_id` field. The source tab also has a note in column L, so new metadata columns will be placed in currently empty columns M and N, leaving the changer-slot column K and the note untouched.

## Goals / Non-Goals

**Goals:**

- Generate artist directory, artist, and album detail pages at build time.
- Keep external metadata in the source sheet and checked-in snapshot so the published site remains static.
- Use Cover Art Archive front covers for verified MusicBrainz release-group matches, cache them across GitHub Actions builds, and show a graceful placeholder when no cover is available.
- Serve artwork from the published site so visitor page views make no Cover Art Archive requests.
- Replace the vinyl-led hero with a CD-library identity and clear navigation.

**Non-Goals:**

- Make Discogs, Google Sheets, MusicBrainz, or Cover Art Archive requests from visitor pages.
- Display Discogs-sourced images.
- Change, reformat, or rewrite changer-slot cells.

## Decisions

### Store external identifiers in additive source columns

The existing `release_id` values provide direct Discogs release URLs. Add `Discogs Artist URL` and `MusicBrainz Release Group ID` as metadata columns in M:N, after confirming those target cells are empty. Column L contains a separate note, and column K contains changer slots; neither is part of the write range. The importer will read the new columns by header when present, preserve identifiers as strings, and keep them optional for rows without matches. This avoids visitor-time API calls and keeps the existing sheet as the editable source of truth.

### Generate routes from the checked-in snapshot

Astro will pre-render the artist directory, one page per distinct artist, and one page per album. Slugs will be deterministic and collision-safe. Catalog entries and artist pages link to album details, and detail pages link back to their artist and the catalog. This keeps navigation crawlable without client-side route generation.

### Use MusicBrainz Cover Art Archive for optional cover images

For reviewed release-group IDs, a build script will fetch the Cover Art Archive's 500-pixel front image into a GitHub Actions cache and copy available images into `public/covers/` for publication. The workflow restores the cache before fetching and stores successful images plus time-limited no-art markers, so only new, expired, or missing cache entries are requested. GitHub cache entries are immutable, so the workflow saves a new keyed entry only when the cached files change. Transient request failures will fail the build instead of being recorded as missing art. The pages use same-origin paths for locally available files and link the credit to the corresponding MusicBrainz record. Discogs API image URLs are excluded because API image data has restrictive freshness and caching terms for static hosting. The artwork field remains optional; absent images use the designed placeholder.

The persistent image cache is not committed to Git. The deployed Pages artifact contains its own copy of the images, so cache eviction can cause a later build to re-fetch artwork but does not make visitor page views call Cover Art Archive.

### Use a CD-library editorial design

Replace the record illustration and oversized dark hero with a compact typographic masthead, clear catalog/artist navigation, restrained paper-and-ink colors, and a grid that gives cover art room without hiding the slot. Use a local-designed placeholder for albums without artwork. Keep the page usable with reduced motion and narrow viewports.

## Risks / Trade-offs

- **A MusicBrainz search can find the wrong edition or similarly named album** → only write release-group IDs after checking the title and credited artist; leave uncertain matches blank.
- **Cover Art Archive has no image or an external image request fails** → use a local placeholder and never depend on the image for the album title, links, or location.
- **GitHub evicts an unused Actions cache** → the next build may fetch the covers again; deployed images remain available until that build completes.
- **Cover Art Archive temporarily fails or rate-limits requests** → retry transient failures with backoff and fail the build rather than recording a false no-art result.
- **New collection rows may lack enrichment metadata** → keep external columns optional and let those albums use placeholders and omit unavailable links until enriched.
- **The sheet's existing note occupies column L** → write only M:N and verify the note and all K slot values are unchanged after the update.

## Migration Plan

1. Resolve direct Discogs artist profile URLs and MusicBrainz release-group IDs for source rows with reliable matches; leave uncertain matches empty.
2. Add or fill only the metadata headers and cells in columns M:N, then verify the exact written cells and confirm column K matches its pre-write values.
3. Update the importer and checked-in snapshot to include release identifiers and resolved URLs.
4. Build and inspect static pages, then publish through the existing GitHub Pages workflow.
5. If the publication needs rollback, redeploy the previous main-branch commit; the source sheet's changer-slot cells remain outside the migration writes.
