# Tasks

## 1. Static catalog

- [x] 1.1 Bootstrap the Astro app for static output and set the production site URL to `https://cds.justinkahrs.com`; verify the build produces a static `dist/` directory.
- [x] 1.2 Build the responsive album catalog and client-side search across artist, title, and changer slot; verify rendered album entries keep their full slot text visible and search results match each supported field.
- [x] 1.3 Add a checked-in catalog data file and document local development commands; verify the site builds from local data without a Google request.

## 2. Google Sheets snapshot sync

- [x] 2.1 Confirm the live sheet's tab, headers, and formatted changer-slot values, then define the normalized catalog record shape; verify only artist, title, release year, label, format, and changer slot are emitted and multi-slot locations remain readable strings.
- [x] 2.2 Implement the read-only Sheets API importer with header validation and safe snapshot replacement; verify incomplete optional fields are retained gracefully and a failed read or validation leaves the existing snapshot unchanged.
- [x] 2.3 Add scheduled and manual sync triggers that commit the generated file only when it changes; verify the workflow commits only changed catalog data and does not log credentials.
- [ ] 2.4 After the repository is connected and the service-account secret is configured, run the sync action manually and confirm a successful sync or a safe, useful setup error.

## 3. GitHub Pages deployment

- [x] 3.1 Configure the GitHub Actions flow to build and publish after site pushes and successful sync runs, with Pages permissions and the `cds.justinkahrs.com` custom-domain file; verify the static build contains the custom-domain file and the workflow declares the required Pages permissions.
- [x] 3.2 Document the service-account sharing, `GOOGLE_SERVICE_ACCOUNT_JSON` secret, Pages setting, DNS record, and manual sync procedure; verify the README setup steps match the workflow inputs and custom domain.
- [ ] 3.3 Connect the repository to GitHub, configure the service-account secret and Pages custom domain/DNS, run the first workflow, and confirm the published site at `https://cds.justinkahrs.com`.
