import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { mapAlbums, syncCatalog } from './sync-catalog.mjs';

const headers = ['Artist', 'Title', 'Released', 'Label', 'Format', 'Collection Disc Slot'];

function mockSheets(rows, { metadataError, valuesError } = {}) {
	return {
		spreadsheets: {
			get: async () => {
				if (metadataError) throw metadataError;
				return { data: { sheets: [{ properties: { sheetId: 1336284669, title: 'Collection' } }] } };
			},
			values: {
				get: async () => {
					if (valuesError) throw valuesError;
					return { data: { values: rows } };
				},
			},
		},
	};
}

async function createExistingSnapshot(t) {
	const directory = await mkdtemp(join(os.tmpdir(), 'cd-catalog-'));
	const outputPath = join(directory, 'albums.json');
	const previousSnapshot = '{"albums":[{"artist":"Existing"}]}\n';
	await writeFile(outputPath, previousSnapshot);
	t.after(() => rm(directory, { recursive: true, force: true }));
	return { outputPath, previousSnapshot };
}

test('normalizes optional values and retains formatted multi-slot text', () => {
	const [album] = mapAlbums([
		headers,
		['Aphex Twin', 'Selected Ambient Works Volume II', '0', '', '', '173,174,175'],
	]);

	assert.deepEqual(album, {
		artist: 'Aphex Twin',
		title: 'Selected Ambient Works Volume II',
		releaseYear: null,
		label: null,
		format: null,
		changerSlot: '173,174,175',
	});
});

test('does not replace the snapshot when the Sheets metadata read fails', async (t) => {
	const { outputPath, previousSnapshot } = await createExistingSnapshot(t);
	const sheets = mockSheets([], { metadataError: Object.assign(new Error('private details'), { response: { status: 403 } }) });

	await assert.rejects(
		syncCatalog({
			credentials: {},
			spreadsheetId: 'spreadsheet-id',
			sheetId: 1336284669,
			outputPath,
			providedSheets: sheets,
		}),
		/metadata read failed \(HTTP 403\)/,
	);
	assert.equal(await readFile(outputPath, 'utf8'), previousSnapshot);
});

test('does not replace the snapshot when required sheet headers are missing', async (t) => {
	const { outputPath, previousSnapshot } = await createExistingSnapshot(t);
	const sheets = mockSheets([['Artist', 'Title'], ['Artist', 'Title']]);

	await assert.rejects(
		syncCatalog({
			credentials: {},
			spreadsheetId: 'spreadsheet-id',
			sheetId: 1336284669,
			outputPath,
			providedSheets: sheets,
		}),
		/Expected exactly one "Released" header/,
	);
	assert.equal(await readFile(outputPath, 'utf8'), previousSnapshot);
});
