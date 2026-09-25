# CD Collection Catalog

A static catalog of the CD collection and its changer locations. Browse the album index, artist directory, and individual album details. The built site reads its data from `src/data/albums.json`; it does not call Google at runtime.

## Local development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Build and preview the static site with:

```sh
npm run build
npm run preview
```

The static build is written to `dist/`. Search works locally from the checked-in snapshot without Google credentials or a network request.

## Catalog sync

The source is the Google spreadsheet `10ihW9krbESgxEMtXUQ38dDGDnrZTnePpvEDUGdVIQgo`, tab ID `1336284669` (`final_sorted_updated_cd_collection`). The importer reads formatted values so multi-disc changer locations such as `173,174,175` remain readable strings. It also retains the optional `release_id`, `Discogs Artist URL`, and `MusicBrainz Release Group ID` fields when present. The public pages use these for direct Discogs release/profile links and optional Cover Art Archive artwork; missing external metadata stays blank. Blank presentation fields stay `null`, and the source's `0` release-year placeholder becomes `null`.

The additional metadata headers are stored in columns M:N. They are matched by header name, so the importer does not depend on column order. The existing changer-slot values in column K are read-only catalog locations; the website sync never writes to the Google Sheet. MusicBrainz release-group matches should be checked against the album and artist before adding them. Cover images load from the [MusicBrainz Cover Art Archive](https://musicbrainz.org/doc/Cover_Art_Archive), with a designed fallback when no image is available.

To run a sync locally:

1. In Google Cloud, enable the Google Sheets API and create a service account.
2. Share the source spreadsheet with the service account email as a Viewer.
3. Export the service-account JSON key, then provide the JSON as the `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable. Do not add the key to the repository or commit it.
4. Run `npm run sync:catalog`.

The importer requests the read-only Sheets scope. It checks the expected headers and at least one album row before replacing `src/data/albums.json`; failed reads or validation errors leave the current snapshot in place. `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_GID` can override the default spreadsheet and tab when syncing another source.

## GitHub Actions sync and deployment

`.github/workflows/catalog.yml` builds and deploys the committed snapshot on pushes to `main`. It also runs a read-only sheet sync daily at 09:00 UTC or when manually started from **Actions → Sync and deploy CD catalog → Run workflow**. Scheduled and manual runs commit `src/data/albums.json` only when it changed, then build and deploy that snapshot in the same run. Add the service-account key in the GitHub repository settings under **Secrets and variables → Actions** as `GOOGLE_SERVICE_ACCOUNT_JSON`.

The public repository is [justinkahrs/cds](https://github.com/justinkahrs/cds). GitHub Pages is configured to publish through Actions, and `cds.justinkahrs.com` is registered as its custom domain. To finish the external setup:

1. At the DNS provider, add a `CNAME` record for `cds` pointing to `justinkahrs.github.io`.
2. Follow the service-account steps above and add the key as the `GOOGLE_SERVICE_ACCOUNT_JSON` Actions secret.
3. Run **Actions → Sync and deploy CD catalog → Run workflow** to sync the sheet and publish the snapshot.
4. After DNS resolves and GitHub issues a TLS certificate, enable **Enforce HTTPS** under **Settings → Pages**.

GitHub Actions needs permission to write repository contents so a sync can commit an updated snapshot, and Pages deployment needs `pages: write` and `id-token: write`; the workflow declares these permissions. If repository rules block direct pushes to `main`, allow the workflow bot to push the generated catalog commit or adjust the branch rule.
