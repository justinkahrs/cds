# CD Collection Catalog

A static, searchable catalog of the CD collection and its changer locations. The built site reads its data from `src/data/albums.json`; it does not call Google at runtime.

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

The source is the Google spreadsheet `10ihW9krbESgxEMtXUQ38dDGDnrZTnePpvEDUGdVIQgo`, tab ID `1336284669` (`final_sorted_updated_cd_collection`). The importer reads formatted values so multi-disc changer locations such as `173,174,175` remain readable strings. Only artist, title, release year, label, format, and changer slot are written to the public catalog. Blank optional values stay `null`; the source's `0` release-year placeholder becomes `null`.

To run a sync locally:

1. In Google Cloud, enable the Google Sheets API and create a service account.
2. Share the source spreadsheet with the service account email as a Viewer.
3. Export the service-account JSON key, then provide the JSON as the `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable. Do not add the key to the repository or commit it.
4. Run `npm run sync:catalog`.

The importer requests the read-only Sheets scope. It checks the expected headers and at least one album row before replacing `src/data/albums.json`; failed reads or validation errors leave the current snapshot in place. `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_GID` can override the default spreadsheet and tab when syncing another source.

## GitHub Actions sync and deployment

`.github/workflows/catalog.yml` builds and deploys the committed snapshot on pushes to `main`. It also runs a read-only sheet sync daily at 09:00 UTC or when manually started from **Actions → Sync and deploy CD catalog → Run workflow**. Scheduled and manual runs commit `src/data/albums.json` only when it changed, then build and deploy that snapshot in the same run. Add the service-account key in the GitHub repository settings under **Secrets and variables → Actions** as `GOOGLE_SERVICE_ACCOUNT_JSON`.

For the first deployment:

1. Push this repository to GitHub with `main` as its deployment branch.
2. In **Settings → Pages**, choose **GitHub Actions** as the publishing source.
3. Add `cds.justinkahrs.com` under **Settings → Pages → Custom domain**. The repository includes `public/CNAME` for the built artifact; the custom domain must also be set in repository settings.
4. At the DNS provider, add a `CNAME` record for `cds` pointing to `justinkahrs.github.io`.
5. Add the `GOOGLE_SERVICE_ACCOUNT_JSON` Actions secret and share the spreadsheet with the service account as a Viewer, then run **Sync and deploy CD catalog** manually once.

GitHub Actions needs permission to write repository contents so a sync can commit an updated snapshot, and Pages deployment needs `pages: write` and `id-token: write`; the workflow declares these permissions. If repository rules block direct pushes to `main`, allow the workflow bot to push the generated catalog commit or adjust the branch rule.
