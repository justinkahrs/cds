# Proposal

## Why

The CD collection currently lives in a Google Sheet, which is useful for editing but not a good public catalog or reliable browsing experience. A static site will make the albums easier to browse and make the collection available to search engines without requiring visitors to fetch data from Google Drive.

## What Changes

- Add a responsive Astro catalog that presents albums with their artist, title, release details, and Sony changer slot prominently.
- Keep a generated catalog dataset in the GitHub repository and refresh it from the Google Sheet through a scheduled or manually started GitHub Action.
- Publish the static site with GitHub Pages at `cds.justinkahrs.com`.
- Keep Google credentials and sheet access in the sync workflow; public pages will use only the checked-in dataset.

## Capabilities

### New Capabilities

- `cd-collection-catalog`: Public static catalog for browsing the CD collection, with repository-backed data synchronization from Google Sheets.

### Modified Capabilities

None.

## Impact

This is a greenfield Astro app in the repository. It adds a generated data file, a Google Sheets read integration for GitHub Actions, a scheduled/manual sync and deployment workflow, and GitHub Pages configuration for the custom domain. The initial data shape is based on `CD Collection.xlsx`; the live sheet could not be read by the available web reader, so its current headers and values must be confirmed during implementation.
