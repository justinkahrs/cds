import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface CatalogAlbum {
	artist: string | null;
	title: string | null;
	releaseYear: string | null;
	label: string | null;
	format: string | null;
	changerSlot: string | null;
	discogsReleaseId?: string | null;
	discogsArtistUrl?: string | null;
	musicBrainzReleaseGroupId?: string | null;
}

export interface AlbumView extends CatalogAlbum {
	slug: string;
	path: string;
	artistPath: string | null;
}

export interface ArtistView {
	name: string;
	slug: string;
	path: string;
	discogsArtistUrl: string | null;
	albums: AlbumView[];
}

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

function artistKey(value: string | null | undefined) {
	return value?.trim().toLocaleLowerCase() ?? '';
}

function slugify(value: string) {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
	.replace(/^-|-$/g, '');
}

function stableHash(value: string) {
	let hash = 2166136261;
	for (let index = 0; index < value.length; index += 1) {
		hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
	}
	return (hash >>> 0).toString(36);
}

function uniqueSlug(base: string, identity: string, used: Set<string>) {
	let slug = base || 'untitled';
	if (used.has(slug)) slug = `${slug}-${stableHash(identity)}`;
	let suffix = 2;
	while (used.has(slug)) {
		slug = `${base || 'untitled'}-${stableHash(identity)}-${suffix}`;
		suffix += 1;
	}
	used.add(slug);
	return slug;
}

export function isDiscogsArtistUrl(value: string | null | undefined): value is string {
	if (!value) return false;
	try {
		const url = new URL(value);
		return (
			(url.hostname === 'discogs.com' || url.hostname === 'www.discogs.com') &&
			/^\/artist\/\d+(?:-|$)/.test(url.pathname)
		);
	} catch {
		return false;
	}
}

export function getDiscogsReleaseUrl(album: CatalogAlbum) {
	return album.discogsReleaseId && /^\d+$/.test(album.discogsReleaseId)
		? `https://www.discogs.com/release/${album.discogsReleaseId}`
		: null;
}

export function getMusicBrainzReleaseGroupUrl(album: CatalogAlbum) {
	const id = album.musicBrainzReleaseGroupId;
	return id && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
		? `https://musicbrainz.org/release-group/${id}`
		: null;
}

export function getCoverArtUrl(album: CatalogAlbum) {
	const releaseGroupId = album.musicBrainzReleaseGroupId;
	if (!getMusicBrainzReleaseGroupUrl(album) || !releaseGroupId) return null;
	const normalizedId = releaseGroupId.toLowerCase();
	const localPath = resolve(process.cwd(), 'public', 'covers', `${normalizedId}.jpg`);
	return existsSync(localPath) ? `/covers/${normalizedId}.jpg` : null;
}

export function buildCatalog(albums: CatalogAlbum[]) {
	const groups = new Map<string, { name: string; key: string; records: CatalogAlbum[] }>();
	for (const album of albums) {
		const key = artistKey(album.artist);
		if (!key) continue;
		const group = groups.get(key) ?? { name: album.artist?.trim() ?? '', key, records: [] };
		group.records.push(album);
		groups.set(key, group);
	}

	const usedArtistSlugs = new Set<string>();
	const sortedGroups = [...groups.values()].sort((left, right) => collator.compare(left.name, right.name));
	const artistByKey = new Map<string, ArtistView>();
	for (const group of sortedGroups) {
		const slug = uniqueSlug(slugify(group.name), group.key, usedArtistSlugs);
		artistByKey.set(group.key, {
			name: group.name,
			slug,
			path: `/artists/${slug}/`,
			discogsArtistUrl: null,
			albums: [],
		});
	}

	const usedAlbumSlugs = new Set<string>();
	const albumViews: AlbumView[] = albums.map((album, index) => {
		const artist = album.artist?.trim() ?? '';
		const title = album.title?.trim() ?? '';
		const base = slugify(`${artist || 'unknown-artist'}-${title || 'untitled-album'}`);
		const identity = [artist, title, album.changerSlot ?? '', album.discogsReleaseId ?? '', index].join('\0');
		const slug = uniqueSlug(base, identity, usedAlbumSlugs);
		const group = artistByKey.get(artistKey(artist));
		const artistUrl = isDiscogsArtistUrl(album.discogsArtistUrl) ? album.discogsArtistUrl : null;
		if (group && !group.discogsArtistUrl && artistUrl) group.discogsArtistUrl = artistUrl;
		return {
			...album,
			artist,
			title,
			slug,
			path: `/albums/${slug}/`,
			artistPath: group?.path ?? null,
		};
	});

	for (const album of albumViews) {
		const group = artistByKey.get(artistKey(album.artist));
		group?.albums.push(album);
	}

	const sortAlbums = (left: AlbumView, right: AlbumView) =>
		collator.compare(left.title ?? '', right.title ?? '') ||
		collator.compare(left.changerSlot ?? '', right.changerSlot ?? '');
	for (const artist of artistByKey.values()) artist.albums.sort(sortAlbums);
	return {
		albums: [...albumViews].sort(
			(left, right) => collator.compare(left.artist ?? '', right.artist ?? '') || sortAlbums(left, right),
		),
		artists: [...artistByKey.values()],
	};
}
