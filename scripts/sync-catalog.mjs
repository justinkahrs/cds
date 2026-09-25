import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const DEFAULT_SPREADSHEET_ID = '10ihW9krbESgxEMtXUQ38dDGDnrZTnePpvEDUGdVIQgo';
const DEFAULT_SHEET_ID = 1336284669;
const SHEETS_READ_ONLY_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
export const OUTPUT_PATH = fileURLToPath(new URL('../src/data/albums.json', import.meta.url));

const COLUMNS = {
	artist: 'Artist',
	title: 'Title',
	releaseYear: 'Released',
	label: 'Label',
	format: 'Format',
	changerSlot: 'Collection Disc Slot',
};

class SyncError extends Error {}

function readServiceAccount() {
	const serialized = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
	if (!serialized) {
		throw new SyncError('GOOGLE_SERVICE_ACCOUNT_JSON is not set.');
	}

	let credentials;
	try {
		credentials = JSON.parse(serialized);
	} catch {
		throw new SyncError('GOOGLE_SERVICE_ACCOUNT_JSON must contain valid service-account JSON.');
	}

	if (!credentials.client_email || !credentials.private_key) {
		throw new SyncError('The service-account JSON must include client_email and private_key.');
	}

	return credentials;
}

function getHttpStatus(error) {
	return error?.response?.status ?? error?.code;
}

function readErrorMessage(error, operation) {
	const status = getHttpStatus(error);
	if (status) return `Google Sheets ${operation} failed (HTTP ${status}).`;
	return `Google Sheets ${operation} failed. Check network access and the service-account permissions.`;
}

function cleanCell(value) {
	if (value == null) return null;
	const cleaned = String(value).trim();
	return cleaned || null;
}

function normalizeReleaseYear(value) {
	const year = cleanCell(value);
	return year === '0' ? null : year;
}

export function mapAlbums(rows) {
	if (!rows.length) throw new SyncError('The selected sheet is empty.');

	const headers = rows[0].map((value) => cleanCell(value) ?? '');
	const positions = {};

	for (const [field, columnName] of Object.entries(COLUMNS)) {
		const matches = headers
			.map((header, index) => (header === columnName ? index : -1))
			.filter((index) => index !== -1);
		if (matches.length !== 1) {
			throw new SyncError(
				`Expected exactly one "${columnName}" header; found ${matches.length}. The existing snapshot was not changed.`,
			);
		}
		positions[field] = matches[0];
	}

	const albums = rows.slice(1).flatMap((row) => {
		const artist = cleanCell(row[positions.artist]);
		const title = cleanCell(row[positions.title]);
		if (!artist && !title) return [];

		return [{
			artist,
			title,
			releaseYear: normalizeReleaseYear(row[positions.releaseYear]),
			label: cleanCell(row[positions.label]),
			format: cleanCell(row[positions.format]),
			// FORMATTED_VALUE retains the human-readable comma-separated changer slots.
			changerSlot: cleanCell(row[positions.changerSlot]),
		}];
	});

	if (!albums.length) {
		throw new SyncError('No album rows with an artist or title were found. The existing snapshot was not changed.');
	}

	return albums;
}

export async function writeSnapshot(albums, outputPath = OUTPUT_PATH) {
	const directory = dirname(outputPath);
	const temporaryPath = resolve(directory, `.albums.${process.pid}.${randomUUID()}.tmp`);
	const snapshot = `${JSON.stringify({ albums }, null, 2)}\n`;

	await mkdir(directory, { recursive: true });
	try {
		await writeFile(temporaryPath, snapshot, 'utf8');
		await rename(temporaryPath, outputPath);
	} finally {
		await rm(temporaryPath, { force: true });
	}
}

export async function syncCatalog({
	credentials = readServiceAccount(),
	spreadsheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SPREADSHEET_ID,
	sheetId = Number(process.env.GOOGLE_SHEET_GID || DEFAULT_SHEET_ID),
	outputPath = OUTPUT_PATH,
	providedSheets,
} = {}) {
	if (!Number.isSafeInteger(sheetId) || sheetId < 0) {
		throw new SyncError('GOOGLE_SHEET_GID must be a non-negative integer.');
	}

	const sheets = providedSheets ?? google.sheets({
		version: 'v4',
		auth: new google.auth.GoogleAuth({
			credentials,
			scopes: [SHEETS_READ_ONLY_SCOPE],
		}),
	});

	let metadata;
	try {
		metadata = await sheets.spreadsheets.get({
			spreadsheetId,
			fields: 'sheets(properties(sheetId,title))',
		});
	} catch (error) {
		throw new SyncError(readErrorMessage(error, 'spreadsheet metadata read'));
	}

	const sheet = metadata.data.sheets?.find(({ properties }) => properties?.sheetId === sheetId);
	if (!sheet?.properties?.title) {
		throw new SyncError(`No sheet tab with ID ${sheetId} exists in the configured spreadsheet.`);
	}

	const escapedTitle = sheet.properties.title.replaceAll("'", "''");
	let rows;
	try {
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range: `'${escapedTitle}'!A:Z`,
			valueRenderOption: 'FORMATTED_VALUE',
		});
		rows = response.data.values ?? [];
	} catch (error) {
		throw new SyncError(readErrorMessage(error, 'values read'));
	}

	const albums = mapAlbums(rows);
	await writeSnapshot(albums, outputPath);
	return { count: albums.length, sheetTitle: sheet.properties.title };
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
	try {
		const result = await syncCatalog();
		console.log(`Synced ${result.count} albums to src/data/albums.json from sheet tab "${result.sheetTitle}".`);
	} catch (error) {
		const message = error instanceof SyncError
			? error.message
			: 'An unexpected error occurred. The existing snapshot was not intentionally replaced.';
		console.error(`Catalog sync failed: ${message}`);
		process.exitCode = 1;
	}
}
