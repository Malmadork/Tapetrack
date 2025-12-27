module.exports = class Review {
    id = null;
    userId = null;
    albumId = null;
    score = null;
    review = null;
    trackId = null;
    datetime = null;

  constructor(data, details=null) {
    this.id = data.rev_id;
    this.albumId = data.alb_id;
    this.userId = data.usr_id;
    this.score = data.score;
    this.review = data.review;
    this.trackId = data.trk_id;
    this.datetime = data.datetime;
    if(details === "username") {
      this.username = data.usr_username;
      this.usr_visibility = data.usr_visibility;
    }
    if(details === "album") this.album = {
      name: data.alb_name,
      coverart: data.alb_coverart,
      artist: data.alb_artist,
      numTracks: data.alb_numTracks
    }
  }

  toJSON() {
    return {
        id: this.id,
        albumId: this.albumId,
        userId: this.userId,
        score: this.score,
        review: this.review,
        trackId: this.trackId,
        datetime: this.datetime,
        username: this.username,
        usr_visibility: this.usr_visibility,
        album: this.album
    }
  }
};