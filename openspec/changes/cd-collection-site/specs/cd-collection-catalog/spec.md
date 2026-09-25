# Spec Delta

## Purpose

Defines a public catalog for browsing the physical CD collection and finding albums by their Sony changer slot, using data stored in the repository.

## ADDED Requirements

### Requirement: Catalog pages use repository data

The published catalog MUST render album records from a generated dataset stored in the GitHub repository. Public pages MUST NOT request Google Sheets or Google Drive to display catalog content.

#### Scenario: Static catalog is available to visitors and crawlers

- **WHEN** a visitor or crawler requests a catalog page
- **THEN** the page contains album names and changer locations from the repository dataset without a runtime Google request

### Requirement: Visitors can browse albums and find changer locations

The catalog MUST show artist and title for each identifiable album, and MUST display its Sony changer slot clearly in search results. When present, release year, label, and format MAY be shown as supporting details. Visitors MUST be able to search case-insensitively by artist, title, or changer slot.

#### Scenario: Search by artist, title, or slot

- **WHEN** a visitor enters text matching an artist, title, or changer slot
- **THEN** the catalog shows matching albums and keeps each matching slot visible

#### Scenario: Display an album with multiple changer slots

- **WHEN** an album occupies more than one changer slot
- **THEN** the catalog displays all provided slot values together as a readable location

#### Scenario: Display an incomplete album row

- **WHEN** a source row has an artist or title but lacks optional release details
- **THEN** the album remains in the catalog and unavailable optional details are omitted

### Requirement: Sheet synchronization updates a checked-in snapshot

The repository MUST contain a generated catalog snapshot refreshed from the configured Google Sheets document and worksheet. A GitHub Action MUST support both scheduled and manual runs. The public dataset MUST include only fields used for catalog presentation: artist, title, release year, label, format, and changer slot when present. Rows with neither artist nor title MUST be ignored. Changer slot values MUST be kept as readable text using the sheet's displayed value so that multi-slot values are not collapsed into an integer.

#### Scenario: Scheduled or manual synchronization succeeds

- **WHEN** the configured schedule runs or a user starts the sync action manually
- **THEN** the action reads the configured worksheet and updates the repository snapshot from its current album rows

#### Scenario: Source data has no changes

- **WHEN** the normalized snapshot is identical to the checked-in snapshot
- **THEN** the action does not create a data-change commit

#### Scenario: Sheet access or schema validation fails

- **WHEN** the sheet cannot be read or a required catalog column is missing
- **THEN** the action fails with a useful diagnostic and leaves the last checked-in snapshot unchanged

### Requirement: Catalog changes publish through GitHub Pages

Changes to site source or a successful sheet synchronization MUST build and publish the static catalog to `cds.justinkahrs.com` through GitHub Pages. A failed synchronization MUST NOT publish a partial or invalid catalog snapshot.

#### Scenario: Publish changed site or catalog data

- **WHEN** site source changes or a scheduled/manual synchronization succeeds
- **THEN** GitHub Pages serves a static catalog built from the repository snapshot at `cds.justinkahrs.com`

#### Scenario: Keep the last good publication after a failed sync

- **WHEN** synchronization fails before producing a valid snapshot
- **THEN** the workflow does not deploy the failed run and the last published catalog remains available
