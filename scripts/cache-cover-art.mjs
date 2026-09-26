import { appendFile, copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const CATALOG_PATH = resolve('src/data/albums.json');
const CACHE_DIRECTORY = resolve(process.env.COVER_ART_CACHE_DIR || '.cache/cover-art');
const PUBLIC_DIRECTORY = resolve('public/covers');
const MISSING_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const REQUEST_GAP_MS = 500;
const MAX_ATTEMPTS = 4;
const RELEASE_GROUP_ID_PATTERN = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

class NonRetryableError extends Error {}

function getCoverArtIds(albums) {
	return [...new Set(albums
		.map((album) => album.musicBrainzReleaseGroupId?.trim().toLowerCase())
		.filter((id) => id && RELEASE_GROUP_ID_PATTERN.test(id)))].sort();
}

async function getFileSize(filePath) {
	try {
		const file = await stat(filePath);
		return file.isFile() ? file.size : 0;
	} catch (error) {
		if (error?.code === 'ENOENT') return 0;
		throw error;
	}
}

async function isFreshMissingMarker(markerPath) {
	try {
		const marker = JSON.parse(await readFile(markerPath, 'utf8'));
		const checkedAt = Date.parse(marker.checkedAt);
		return Number.isFinite(checkedAt) && Date.now() - checkedAt < MISSING_TTL_MS;
	} catch {
		return false;
	}
}

function getRetryDelay(response, attempt) {
	const retryAfter = response?.headers.get('retry-after');
	if (retryAfter) {
		const seconds = Number(retryAfter);
		if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 30_000);
		const timestamp = Date.parse(retryAfter);
		if (Number.isFinite(timestamp)) return Math.min(Math.max(0, timestamp - Date.now()), 30_000);
	}
	return Math.min(1000 * (2 ** attempt), 30_000);
}

async function fetchCoverArt(id) {
	const url = `https://coverartarchive.org/release-group/${id}/front-500`;
	let lastError;

	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
		try {
			const response = await fetch(url, {
				headers: { 'user-agent': 'CDCollectionCatalog/1.0 (https://github.com/justinkahrs/cds)' },
				signal: AbortSignal.timeout(30_000),
			});

			if (response.status === 404) return { status: 'missing' };
			if (response.status === 408 || response.status === 429 || response.status >= 500) {
				lastError = new Error(`Cover Art Archive returned HTTP ${response.status} for ${id}.`);
				if (attempt < MAX_ATTEMPTS - 1) await delay(getRetryDelay(response, attempt));
				continue;
			}
			if (!response.ok) {
				throw new NonRetryableError(`Cover Art Archive returned HTTP ${response.status} for ${id}.`);
			}

			const contentType = response.headers.get('content-type') || '';
			if (!contentType.toLowerCase().startsWith('image/')) {
				throw new NonRetryableError(`Cover Art Archive returned an unexpected content type for ${id}.`);
			}
			const bytes = Buffer.from(await response.arrayBuffer());
			if (!bytes.length) throw new Error(`Cover Art Archive returned an empty image for ${id}.`);
			return { status: 'found', bytes };
		} catch (error) {
			if (error instanceof NonRetryableError) throw error;
			lastError = error;
			if (attempt < MAX_ATTEMPTS - 1) await delay(getRetryDelay(null, attempt));
		}
	}

	throw lastError ?? new Error(`Cover Art Archive could not return artwork for ${id}.`);
}

async function pruneStaleFiles(directory, activeIds) {
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	} catch (error) {
		if (error?.code === 'ENOENT') return;
		throw error;
	}

	let removed = 0;
	for (const entry of entries) {
		if (!entry.isFile()) continue;
		const match = /^([\da-f-]{36})\.(jpg|missing\.json)$/i.exec(entry.name);
		if (match && !activeIds.has(match[1].toLowerCase())) {
			await rm(resolve(directory, entry.name), { force: true });
			removed += 1;
		}
	}
	return removed;
}

async function cacheCoverArt() {
	const { albums } = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
	const ids = getCoverArtIds(albums);
	const activeIds = new Set(ids);
	await mkdir(CACHE_DIRECTORY, { recursive: true });
	await mkdir(PUBLIC_DIRECTORY, { recursive: true });
	let cacheChanged = (await pruneStaleFiles(CACHE_DIRECTORY, activeIds)) > 0;
	await pruneStaleFiles(PUBLIC_DIRECTORY, activeIds);

	let cacheHits = 0;
	let missingHits = 0;
	let downloaded = 0;
	let notFound = 0;
	let requests = 0;

	for (const id of ids) {
		const imagePath = resolve(CACHE_DIRECTORY, `${id}.jpg`);
		const missingPath = resolve(CACHE_DIRECTORY, `${id}.missing.json`);
		const publicImagePath = resolve(PUBLIC_DIRECTORY, `${id}.jpg`);

		if (await getFileSize(imagePath) > 0) {
			await copyFile(imagePath, publicImagePath);
			await rm(missingPath, { force: true });
			cacheHits += 1;
			continue;
		}

		if (await isFreshMissingMarker(missingPath)) {
			await rm(publicImagePath, { force: true });
			missingHits += 1;
			continue;
		}

		if (requests > 0) await delay(REQUEST_GAP_MS);
		requests += 1;
		console.log(`Checking Cover Art Archive (${requests}): ${id}`);
		const result = await fetchCoverArt(id);

		if (result.status === 'found') {
			await writeFile(imagePath, result.bytes);
			await rm(missingPath, { force: true });
			await copyFile(imagePath, publicImagePath);
			downloaded += 1;
			cacheChanged = true;
		} else {
			await writeFile(missingPath, `${JSON.stringify({ checkedAt: new Date().toISOString() })}\n`);
			await rm(publicImagePath, { force: true });
			notFound += 1;
			cacheChanged = true;
		}
	}

	await pruneStaleFiles(PUBLIC_DIRECTORY, activeIds);
	console.log(`Cover art: ${downloaded} downloaded, ${cacheHits} reused, ${notFound} unavailable, ${missingHits} unavailable markers reused.`);
	if (process.env.GITHUB_OUTPUT) {
		await appendFile(process.env.GITHUB_OUTPUT, `cache-changed=${cacheChanged}\n`);
	}
}

cacheCoverArt().catch((error) => {
	console.error(`Cover art caching failed: ${error.message}`);
	process.exitCode = 1;
});
