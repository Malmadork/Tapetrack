const { getGroupOwner, isUserInGroup } = require('../db/dao/GroupDAO');
const { getListOwner } = require('../db/dao/ListDAO');
const { getReviewOwner } = require('../db/dao/ReviewDAO');

exports.RequireUser = (req, res, next) => {
    const currentUserId = req.user.id;
    const userId = req.params.userId;

    if (currentUserId != userId) {
        return res.status(403).json({error: "Forbidden: You are not the authorized user"});
    }
    next();

}

exports.RequireGroupOwner = (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    getGroupOwner(groupId)
        .then(ownerId => {
            if (ownerId != userId) {
                const err = new Error("Forbidden: You do not own this group");
                err.code = 403;
                throw err;
            }
            next();
        })
        .catch(err => {
            res.status(err.code || 500).json({error: err.message});
        });
}

exports.RequireGroupMember = (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    isUserInGroup(userId, groupId)
        .then(isMember => {
            if (!isMember) {
                const err = new Error("Forbidden: You are not in this group");
                err.code = 403;
                throw err;
            }
            next();
        })
        .catch(err => {
            res.status(err.code || 500).json({error: err.message});
        });
}

exports.RequireListOwner = (req, res, next) => {
    const listId = req.params.listId;
    const userId = req.user.id;

    getListOwner(listId)
        .then(ownerId => {
            if (ownerId !== userId) {
                const err = new Error("Forbidden: you do not own this list");
                err.code = 403;
                throw err;
            }
            next();
        })
        .catch(err => {
            res.status(err.code || 500).json({error: err.message});
        });
}

exports.requireReviewOwner = (req, res, next) => {
    const reviewId = req.params.reviewId;
    const userId = req.user.id;

    getReviewOwner(reviewId)
        .then(ownerId => {
            if (ownerId !== userId) {
                const err = new Error("Forbidden");
                err.code = 403;
                throw err;
            }
            next();
        })
        .catch(err => {
            res.status(err.code || 500).json({error: err.message});
        });
}
