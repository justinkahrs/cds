# Tasks

## 1. Catalog metadata

- [x] 1.1 Resolve direct Discogs artist profile URLs and verified MusicBrainz release-group IDs for confident matches, add them in empty source columns M:N without touching column K, and verify the written ranges plus unchanged slot values.
- [x] 1.2 Extend the read-only importer and checked-in snapshot to retain `release_id`, artist URLs, and MusicBrainz release-group IDs as optional strings; verify the generated records keep every source changer-slot value exactly.

## 2. Browsing and detail pages

- [x] 2.1 Add deterministic static routes for the artist directory, artist pages, and album detail pages; verify representative route files exist in `dist/` after a production build.
- [x] 2.2 Add navigation between catalog, artist, and album pages, including full changer-slot values and available Discogs release/profile links; verify the built HTML contains expected links and slot text.
- [x] 2.3 Add Cover Art Archive thumbnails, attribution, and an on-error placeholder; verify a matched album uses its image URL and an unmatched album renders its placeholder in the built output.

## 3. Visual design and delivery

- [x] 3.1 Replace the record-led hero and flat styling with a responsive CD-library design; verify the production build succeeds and the pages use the new navigation and artwork layout.
- [x] 3.2 Document the source metadata columns, artwork attribution, and local build/sync behavior; verify README instructions match the importer and output fields.
- [x] 3.3 Publish the change through GitHub Pages, confirm the workflow succeeds, and enforce HTTPS once GitHub has provisioned the custom-domain certificate; verify the production URL serves the new catalog securely.
