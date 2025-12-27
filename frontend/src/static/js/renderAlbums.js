import api from './APIClient.js'

const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes

function setCache(key, data) {
    const cacheData = {
        timestamp: Date.now(),
        data
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

function getCache(key) {
    const cache = localStorage.getItem(key);
    if (!cache) {
        return null;
    }

    try {
        const parsed = JSON.parse(cache);
        // Check if cache is still valid
        if (Date.now() - parsed.timestamp < CACHE_EXPIRATION) {
            return parsed.data;
        } else {
            localStorage.removeItem(key); // Expired
            return null;
        }
    } catch (err) {
        showError(err);
        return null;
    }
}

function fetchHotAlbums() {
    const cached = getCache('hotAlbums');
    if (cached) {
        const randNewRelease = Math.floor(Math.random() * cached.length);
        cached.forEach(album => renderAlbumSimpleHot(album));
        renderAlbumDetailed(cached[randNewRelease]);
        return Promise.resolve(cached);
    } else {
        return api.getHotAlbums().then(albums => {
            const randNewRelease = Math.floor(Math.random() * albums.length);
            setCache('hotAlbums', albums);
            albums.forEach(album => renderAlbumSimpleHot(album));
            renderAlbumDetailed(albums[randNewRelease]);
            return albums;
        }).catch(err => showError(err));
    }
}

function fetchPopularAlbums() {
    const cached = getCache('popularAlbums');
    if (cached) {
        cached.forEach(album => renderAlbumSimplePopular(album));
        return Promise.resolve(cached);
    } else {
        return api.getPopularAlbums().then(albums => {
            setCache('popularAlbums', albums);
            albums.forEach(album => renderAlbumSimplePopular(album));
            return albums;
        }).catch(err => showError(err));
    }
}

function renderAlbumSimplePopular(album) {
    const albumList = document.getElementById('albumList-popular');
    const albumTemplate = document.getElementById('albumTemplate-simple');

    const albumInstance = albumTemplate.content.cloneNode(true);
    const albumLink = albumInstance.querySelector('.albumLink');
    const albumElement = albumInstance.querySelector('.album-container');

    albumLink.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                api.addAlbum(
                    album.id,
                    album.name,
                    album.artist,
                    album.year,
                    album.genre,
                    album.numTracks,
                    album.runtime,
                    album.cover_art,
                    album.tracklist
                ).then(addedAlbum => {
                    // Navigate to album page
                    window.location.href = `/albums/${addedAlbum.id}`;
                });
            } catch (err) {
                showError(err);
            }
    });

    albumElement.querySelector('.cover-art').src = album.cover_art || "/images/placeholder.png";
    albumElement.querySelector('h1').textContent = album.name;

    albumList.append(albumInstance);
}

function renderAlbumSimpleHot(album) {
    const albumList = document.getElementById('albumList-hot');
    const albumTemplate = document.getElementById('albumTemplate-simple');

    const albumInstance = albumTemplate.content.cloneNode(true);
    const albumLink = albumInstance.querySelector('.albumLink');
    const albumElement = albumInstance.querySelector('.album-container');

    albumLink.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                api.addAlbum(
                    album.id,
                    album.name,
                    album.artist,
                    album.year,
                    album.genre,
                    album.numTracks,
                    album.runtime,
                    album.cover_art,
                    album.tracklist
                ).then(addedAlbum => {
                    // Navigate to album page
                    window.location.href = `/albums/${addedAlbum.id}`;
                });
            } catch (err) {
                showError(err);
            }
    });

    albumElement.querySelector('.cover-art').src = album.cover_art || "/images/placeholder.png";
    albumElement.querySelector('h1').textContent = album.name;

    albumList.append(albumInstance);
}

function formatRuntime(seconds) {
    if (!seconds || seconds <= 0) {
        return null;
    }

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const paddedSecs = secs.toString().padStart(2, '0');
    return `${mins}:${paddedSecs}`;
}

function renderAlbumDetailed(album) {
    const albumList = document.getElementById('album-popular');
    const albumTemplate = document.getElementById('albumTemplate-detailed');

    const albumInstance = albumTemplate.content.cloneNode(true);
    const albumLink = albumInstance.querySelector('.albumLink');
    const albumElement = albumInstance.querySelector('.album-container-detailed');

    albumLink.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                api.addAlbum(
                    album.id,
                    album.name,
                    album.artist,
                    album.year,
                    album.genre,
                    album.numTracks,
                    album.runtime,
                    album.cover_art,
                    album.tracklist
                ).then(addedAlbum => {
                    // Navigate to album page
                    window.location.href = `/albums/${addedAlbum.id}`;
                });
            } catch (err) {
                showError(err);
            }
    });

    albumElement.querySelector('.cover-art').src = album.cover_art || "/images/placeholder.png";
    albumElement.querySelector('#albumName').textContent = album.name || "N/A";
    albumElement.querySelector('#albumDesc').textContent = album.genre.join(', ') || "N/A";

    // Convert runtime format
    const runtime = formatRuntime(album.runtime);

    let text = `${album.numTracks} Tracks • ${runtime} min`;
    if (!album.numTracks && runtime) {
        text = `N/A Tracks • ${runtime} min`;
    }
    if (!runtime && album.numTracks) {
        text = `${album.numTracks} Tracks • N/A min`;
    }
    if (!album.numTracks && !runtime) {
        text = `N/A Tracks • N/A min`;
    }
    albumElement.querySelector('#tracks-runtime').textContent = text;

    albumList.append(albumInstance);
}

fetchHotAlbums();
fetchPopularAlbums();
