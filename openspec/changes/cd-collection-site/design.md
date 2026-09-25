# Design

## Context

See proposal.md for motivation. The repository has no application or deployment code yet. The local workbook has one populated catalog sheet with artist, title, label, format, release year, Discogs release ID, date added, and collection disc slot columns. Its `Rating` column is empty. Slot values include text lists and numeric cells formatted with comma separators, so numeric conversion would lose the user-visible multi-slot location. The live Google Sheet could not be inspected with the available web reader.

The user selected a scheduled and manually started GitHub Action for synchronization and GitHub Pages for hosting. The proposed daily schedule is a configurable default; a manual run remains available for immediate updates.

## Goals / Non-Goals

**Goals:**

- Generate the catalog as a static Astro site using a checked-in JSON snapshot.
- Let visitors search by artist, album title, or changer slot and see the slot clearly in results.
- Read the configured Google Sheet with read-only credentials and preserve its displayed changer-slot text.
- Refresh the snapshot on a schedule or manual request and publish it through GitHub Pages at `cds.justinkahrs.com`.

**Non-Goals:**

- Editing the Google Sheet from the website.
- Making Google Sheets or Drive requests from a visitor's browser.
- Publishing administrative fields such as `Date Added`, `CollectionFolder`, catalog numbers, or `release_id` unless a later requirement calls for them.
- Fetching album artwork from a third-party service in the first version. The local export has no artwork URL; the catalog layout can accommodate artwork if the live sheet provides a source field.

## Decisions

### Build a static Astro catalog from repository data

Astro will render album cards into static HTML from a versioned JSON file. A small local script can filter the rendered cards in the browser. This makes album names and locations available in page source for crawlers and keeps the public site independent of Google availability and credentials.

An alternative is loading Google Sheets data in the browser or through a runtime endpoint. That would expose a live data dependency to every visitor and make catalog availability depend on Google access, so it does not meet the stated hosting goal.

The first layout will be a responsive, typography-led album catalog rather than an artwork gallery because the available workbook does not contain image URLs. Album title, artist, and changer location will remain useful when optional metadata or artwork is absent.

### Synchronize through a single GitHub Actions flow

One workflow will support `push` to the default branch, a daily schedule, and `workflow_dispatch`. A push builds and deploys the checked-in snapshot. A scheduled or manual run first synchronizes the sheet, commits the generated JSON only when it changed, then builds and deploys in that same workflow invocation. This avoids relying on a follow-up push workflow, which a commit made with the standard `GITHUB_TOKEN` does not start.

The workflow will validate the downloaded rows before replacing the snapshot. It will write the new file only after a complete successful read and validation. If access or validation fails, the workflow will fail and keep the previous snapshot and publication. When the data is unchanged, it will not create a commit.

### Read the sheet with a restricted service account

The sync script will use the Google Sheets API with a service account that has read-only access to the source document. Its credential JSON will be stored as a GitHub Actions secret and will never be included in site output or logs. The document ID and worksheet ID from the provided URL will be configuration values. The script will resolve the worksheet title from its sheet ID before reading the header and rows.

The importer will map columns by header name, emit only artist, title, release year, label, format, and changer slot, ignore rows with neither artist nor title, and retain identifiable rows with missing optional details. It will request formatted sheet values for the changer-slot column and store those values as strings. This preserves locations such as comma-separated multi-slot values when the underlying cell is numeric with comma grouping.

The live sheet headers and values must be checked when credentials are available. Required headers will be validated before any generated file is replaced. The workbook snapshot is useful for defining the initial mapping, but the first production snapshot will come from the Google Sheet.

### Publish with GitHub Pages and the custom domain

The workflow will use GitHub Pages' Actions deployment. The site will be configured for `cds.justinkahrs.com`, and the published output will include the Pages custom-domain file. The repository's Pages setting must use GitHub Actions, and the domain's DNS must point the `cds` subdomain to GitHub Pages.

An external static host was considered but not selected because the user chose GitHub Pages. Hosting secrets and Google credentials remain separate; only Pages deployment permissions are needed for the static publication.

## Risks / Trade-offs

- **The live worksheet differs from the downloaded workbook** → Confirm the live tab's headers, formatted values, and slot display during initial sync; fail clearly if required columns are absent.
- **The service account cannot read the private sheet** → Store its key only as a repository secret and share the source sheet with the service account as a viewer.
- **Scheduled Actions are delayed or disabled in an inactive repository** → Keep manual dispatch available and document how to run it after a sheet update.
- **The domain is not configured for GitHub Pages** → Document the required DNS record and Pages settings, and keep the site build independent so the generated catalog can be previewed before DNS changes propagate.
- **The workbook lacks album artwork URLs** → Make the initial card layout work without artwork and add image support only when a source field is confirmed.

## Migration Plan

1. Build the Astro app and an importer using the local workbook only as a schema reference.
2. Create a read-only Google service account, share the sheet with it, and add its credential as a GitHub Actions secret.
3. Run the importer against the live sheet, confirm the mapped fields and formatted slot values, and write the initial checked-in snapshot.
4. Enable GitHub Pages with the Actions source, configure the `cds.justinkahrs.com` DNS record, and publish the site.
5. Enable the daily schedule. For rollback, disable scheduled synchronization and redeploy a prior commit containing the last known-good snapshot.
