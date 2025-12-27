module.exports = class Album {
  id = null;
  name = null;
  artist = null;
  year = null;
  genre = null;
  numTracks = null;
  runtime = null;
  coverart = null;
  tracks = null;
  datetime = null

  constructor(data) {
    this.id = data.alb_id;
    this.name = data.alb_name;
    this.artist = data.alb_artist;
    this.year = data.alb_year;
    this.genre = data.alb_genre;
    this.numTracks = data.alb_numTracks;
    this.runtime = data.alb_runtime;
    this.coverart = data.alb_coverart;
    this.tracks = data.alb_tracks;
    if(data.datetime) this.datetime = data.datetime;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      artist: this.artist,
      year: this.year,
      genre: this.genre,
      numTracks: this.numTracks,
      runtime: this.runtime,
      coverart: this.coverart,
      tracks: this.tracks,
      datetime: this.datetime
    }
  }
};