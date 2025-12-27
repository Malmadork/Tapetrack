const db = require('./DBConnection');
const Album = require('../models/Album');

const token = process.env.DISCOGS_TOKEN;

// Helper function for parsing album artist and title from search results
function parseArtistAndTitle(result) {
  if (result.title.includes(' - ')) {
    const [artist, ...titleParts] = result.title.split(' - ');
    return {
      artist: artist.trim(),
      title: titleParts.join(' - ').trim()
    };
  }
  return {
    artist: "Unknown Artist",
    title: result.title
  };
}

// Helper function for sorting track positions
// because the position is sometimes letters (A1), sometimes numbers (11)
function sortTrackPositions(a, b) {
  const posA = a.trk_position;
  const posB = b.trk_position;

  // Split letters and numbers
  const regex = /^([A-Z]*)(\d+)$/i;

  const matchA = posA.match(regex);
  const matchB = posB.match(regex);

  const [ , letterA, numA ] = matchA;
  const [ , letterB, numB ] = matchB;

  // Compare letters first
  if (letterA !== letterB) {
    return letterA.localeCompare(letterB);
  }

  // Compare numbers next
  return Number(numA) - Number(numB);
}

module.exports = {

// ----------------------------------------------------
// GET ALL ALBUMS
// ----------------------------------------------------
  getAlbums: () => {
    return db.query('SELECT * FROM album')
      .then(rows => rows.map(row => new Album(row)));
  },

// ----------------------------------------------------
// GET ALBUM BY ID WITH TRACKS
// ----------------------------------------------------
  getAlbumById: (albumId) => {
    return db.query('SELECT * FROM album WHERE alb_id = ?', [albumId])
      .then(rows => {
        if (rows.length !== 1) {
          const customError = new Error("Album not found");
          customError.code = 404;
          throw customError;
        } 
        return rows[0];
      })
      .then(albumRow => {
        return db.query(
          'SELECT * FROM track WHERE alb_id = ?',
          [albumId]
        ).then(trackRows => {
            if(trackRows > 2) 
              trackRows.sort(sortTrackPositions);
            const album = new Album({ ...albumRow, alb_tracks: trackRows });
            return album;
        });
      });
  },

// ----------------------------------------------------
// GET ALBUM BY NAME
// ----------------------------------------------------
  getAlbumByName: (name) => {
    return db.query('SELECT * FROM album WHERE alb_name = ?', [name])
      .then(rows => {
        if (rows.length !== 1) {
          throw new Error('Album not found');
        }
        return new Album(rows[0]);
      });
  },

// ----------------------------------------------------
// GET ALBUM TRACK BY ID
// ----------------------------------------------------
  getAlbumTrackById: (albumId, trackId) => {
    return db.query('SELECT * FROM track WHERE alb_id= ? AND trk_id = ?', [albumId, trackId])
      .then(rows => {
        if (rows.length !== 1) {
          throw new Error('Track not found');
        }
        return rows[0];
      });
  },

// ----------------------------------------------------
// DISCOGS SEARCH
// ----------------------------------------------------
  searchAlbum: (query) => {

    const makeRequest = url => fetch(url).then(r => r.json());

    const artistUrl = `https://api.discogs.com/database/search?artist=${encodeURIComponent(query)}&type=master&per_page=10&token=${token}`;
    const albumUrl  = `https://api.discogs.com/database/search?release_title=${encodeURIComponent(query)}&type=master&per_page=10&token=${token}`;
    const anyUrl    = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=master&per_page=10&token=${token}`;

    return Promise.all([makeRequest(albumUrl), makeRequest(artistUrl), makeRequest(anyUrl)])
      .then(([albumSearch, artistSearch, anySearch]) => {
        const combined = [...albumSearch.results, ...artistSearch.results, ...anySearch.results];

        // Deduplicate by ID
        const unique = Array.from(new Map(combined.map(r => [r.id, r])).values());

        return Promise.all(unique.map(result => {
            const { artist, title } = parseArtistAndTitle(result);

            return makeRequest(`https://api.discogs.com/masters/${result.master_id}?token=${token}`)
                .then(data => {
                const tracks = (data.tracklist || []).map(t => ({
                    name: t.title,
                    position: t.position,
                    duration: t.duration || '0:00'
                }));

                const runtime = tracks.reduce((sum, t) => {
                    const [m, s] = (t.duration || '0:00').split(':').map(Number);
                    return sum + (m * 60 + (s || 0));
                }, 0);

                return {
                    id: result.master_id,
                    name: title,
                    artist: artist,
                    year: result.year,
                    genre: result.genre,
                    numTracks: tracks.length,
                    runtime,
                    cover_art: result.cover_image,
                    tracklist: tracks
                };
            })
            .catch(() => ({
              id: result.master_id,
              name: title,
              artist: artist,
              year: result.year,
              genre: result.genre,
              numTracks: null,
              runtime: null,
              cover_art: result.cover_image,
              tracklist: null
            }));
        }));
      });
  },

// ----------------------------------------------------
// GET MOST WANTED (HOT) ALBUMS FROM DISCOGS FROM 2025
// ----------------------------------------------------
 getHotAlbums: () => {
    const makeRequest = url => fetch(url).then(r => r.json());

    const url = `https://api.discogs.com/database/search?type=master&year=2025&sort=want&sort_order=desc&year_gt=2024&per_page=15&token=${token}`;

    return makeRequest(url)
        .then(searchData => {
            const results = searchData.results || [];

            return Promise.all(
                results.map(result => {
                    const { artist, title } = parseArtistAndTitle(result);

                    const masterId = result.master_id || result.id;

                    const masterUrl = `https://api.discogs.com/masters/${masterId}?token=${token}`;

                    return makeRequest(masterUrl)
                        .then(data => {
                            const tracks = (data.tracklist || []).map(t => ({
                                name: t.title,
                                position: t.position,
                                duration: t.duration || "0:00"
                            }));

                            const runtime = tracks.reduce((sum, t) => {
                                const [m, s] = (t.duration || "0:00").split(":").map(Number);
                                return sum + (m * 60 + (s || 0));
                            }, 0);

                            return {
                                id: result.master_id,
                                name: title,
                                artist: artist,
                                year: result.year,
                                genre: result.genre,
                                numTracks: tracks.length,
                                runtime: runtime,
                                cover_art: result.cover_image,
                                tracklist: tracks
                            };
                        })
                        .catch(() => ({
                            id: result.master_id,
                            name: title,
                            artist: artist,
                            year: result.year,
                            genre: result.genre,
                            numTracks: null,
                            runtime: null,
                            cover_art: result.cover_image,
                            tracklist: null
                        }));
                    })
            );
        });
},

// ----------------------------------------------------
// GET MOST OWNED (POPULAR) ALBUMS FROM DISCOGS
// ----------------------------------------------------
 getPopularAlbums: () => {
    const makeRequest = url => fetch(url).then(r => r.json());

    const url = `https://api.discogs.com/database/search?type=master&sort=have&sort_order=desc&per_page=15&token=${token}`;

    return makeRequest(url)
        .then(searchData => {
            const results = searchData.results || [];

            return Promise.all(
                results.map(result => {
                    const { artist, title } = parseArtistAndTitle(result);

                    const masterId = result.master_id || result.id;

                    const masterUrl = `https://api.discogs.com/masters/${masterId}&?token=${token}`;

                    return makeRequest(masterUrl)
                        .then(data => {
                            const tracks = (data.tracklist || []).map(t => ({
                                name: t.title,
                                position: t.position,
                                duration: t.duration || "0:00"
                            }));

                            const runtime = tracks.reduce((sum, t) => {
                                const [m, s] = (t.duration || "0:00").split(":").map(Number);
                                return sum + (m * 60 + (s || 0));
                            }, 0);

                            return {
                                id: result.master_id,
                                name: title,
                                artist: artist,
                                year: result.year,
                                genre: result.genre,
                                numTracks: tracks.length,
                                runtime: runtime,
                                cover_art: result.cover_image,
                                tracklist: tracks
                            };
                        })
                        .catch(() => ({
                            id: result.master_id,
                            name: title,
                            artist: artist,
                            year: result.year,
                            genre: result.genre,
                            numTracks: null,
                            runtime: null,
                            cover_art: result.cover_image,
                            tracklist: null
                        }));
                    })
            );
        });
},

// ----------------------------------------------------
// ADD ALBUM TO DATABASE
// ----------------------------------------------------
  addAlbum: (albumData) => {
    const { discogs_id, name, artist, year, genre, numTracks, runtime, coverart, tracklist } = albumData;
    // Check if album already exists
    return db.query(`SELECT * FROM album WHERE alb_discogs_id = ?`, [discogs_id])
      .then(rows => {
        if (rows.length === 1) {
          const albumRow = rows[0];

          return db.query(
            'SELECT * FROM track WHERE alb_id = ? ORDER BY trk_position',
            [albumRow.alb_id]
          ).then(tracks => new Album({ ...albumRow, tracks }));
        }

        // Insert new album
        const insertQuery = `
          INSERT INTO album (
            alb_discogs_id, alb_name, alb_artist,
            alb_year, alb_genre, alb_numTracks,
            alb_runtime, alb_coverart
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return db.query(insertQuery, [discogs_id, name, artist, year, genre, numTracks, runtime, coverart])
          .then(result => {
            if (result.affectedRows !== 1) {
              throw new Error('Could not add album');
            }
            return result.insertId;
          }).then(albumId => {
            if (!tracklist || tracklist.length === 0) {
              return albumId;
            }

            const trackPromises = tracklist.map(track => {
              return db.query(
                'INSERT INTO track (alb_id, trk_name, trk_position, trk_duration) VALUES (?, ?, ?, ?)',
                [albumId, track.name, track.position, track.duration]
              );
            });

            return Promise.all(trackPromises).then(() => albumId);
          })
          .then(albumId => new Album({
            alb_id: Number(albumId), // convert BigInt
            alb_discogs_id: discogs_id,
            alb_name: name,
            alb_artist: artist,
            alb_year: year,
            alb_genre: genre,
            alb_numTracks: numTracks,
            alb_runtime: runtime,
            alb_coverart: coverart,
            alb_tracks: tracklist || []
        }))
      });
  }
};
