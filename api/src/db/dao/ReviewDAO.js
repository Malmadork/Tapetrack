const db = require('./DBConnection');
const Review = require('../models/Review');
const { getUserById } = require('./UserDAO');
const { getAlbumById, getAlbumTrackById } = require('./AlbumDAO');

module.exports = {

// ----------------------------------------------------
// GET A REVIEW BY ID
// ----------------------------------------------------
    getReviewById: (reviewId) => {
        return db.query('SELECT * FROM review WHERE rev_id = ?', [reviewId])
        .then(rows => {
            if (rows.length === 1) {
                return new Review(rows[0]);
            }
            const customError = new Error("Review not found");
            customError.code = 404;
            throw customError;
        });
    },

// ----------------------------------------------------
// GET A USER'S REVIEWS
// ----------------------------------------------------
    getReviewsByUserId: (userId) => {
        return getUserById(userId).then(user => {
            return db.query('SELECT * FROM review WHERE usr_id = ?', [userId])
            .then(rows => rows.map(row => new Review(row)));
        }).catch(err => {
            throw err;
        });
    },

    getReviewsByUserIdWithAlbum: (userId) => {
        return getUserById(userId).then(user => {
            return db.query('SELECT rev_id, review.alb_id, score, review, trk_id, usr_id, alb_name, alb_coverart, alb_artist, alb_numTracks, datetime FROM review INNER JOIN album ON review.alb_id = album.alb_id WHERE usr_id = ?', [userId])
            .then(rows => rows.map(row => new Review(row, "album")));
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// CREATE A NEW ALBUM REVIEW FOR A USER
// ----------------------------------------------------
    addReview: (userId, albumId, reviewData) => {
        return getUserById(userId).then(user => {
            return getAlbumById(albumId);
        }).then(album => {
            if (reviewData.trackId) {
                return getAlbumTrackById(albumId, reviewData.trackId);
            } 
            return null;
        }).then(track => {
            return db.query('INSERT INTO review (usr_id, alb_id, score, review, trk_id) VALUES (?, ?, ?, ?, ?)',
            [
                userId,
                albumId,
                reviewData.score,
                reviewData.review,
                reviewData.trackId
            ]);
        }).then(result => {
                if (result.affectedRows === 1) {
                    return module.exports.getReviewById(result.insertId);
                }
                throw new Error('Review could not be added');
        }).catch(err => {
            if (err.code === 'ER_DUP_ENTRY') {
                throw new Error('User has already reviewed this album');
            }
            throw err;
        });
    },

// ----------------------------------------------------
// GET AN ALBUM'S REVIEWS
// ----------------------------------------------------
    getReviewsByAlbumId: (albumId) => {
        return getAlbumById(albumId).then(album => {
            return db.query('SELECT * FROM review WHERE alb_id = ?', [albumId])
            .then(rows => rows.map(row => new Review(row)));
        }).catch(err => {
            throw err;
        });
    },

    getReviewsByAlbumIdWithUsername: (albumId) => {
        return getAlbumById(albumId).then(album => {
            return db.query('SELECT rev_id, alb_id, score, review, trk_id, review.usr_id, usr_username, usr_visibility, datetime FROM review INNER JOIN user ON review.usr_id = user.usr_id WHERE alb_id = ?', [albumId])
            .then(rows => rows.map(row => new Review(row, "username")));
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// UPDATE AN ALBUM REVIEW MADE BY A USER
// ----------------------------------------------------
    updateReviewById: (albumId, userId, reviewData) =>{
        const { score, review, trackId } = reviewData;
        return db.query(
            'UPDATE review SET score = ?, review = ?, trk_id = ?, datetime = CURRENT_TIMESTAMP WHERE usr_id = ? AND alb_id = ?', [score, review, trackId, userId, albumId]
        ).then(result => {
            if (result.affectedRows === 1) {
                return module.exports.getReviewsByUserId(userId);
            }
            throw new Error('Review could not be updated');
        });
    },

// ----------------------------------------------------
// DELETE AN ALBUM REVIEW MADE BY A USER
// ----------------------------------------------------
    deleteReviewById: (albumId, userId) =>{
        return db.query(
            'DELETE FROM review WHERE usr_id = ? AND alb_id = ?', [userId, albumId]
        ).then(result => {
            if (result.affectedRows === 1) {
                return;
            }
            throw new Error('Review could not be deleted');
        });
    }
}