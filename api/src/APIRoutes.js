const express = require('express');
const cookieParser = require('cookie-parser');

const apiRouter = express.Router();

apiRouter.use(cookieParser());
apiRouter.use(express.json());

const AlbumDAO = require('./db/dao/AlbumDAO');
const GroupDAO = require('./db/dao/GroupDAO');
const ListDAO = require('./db/dao/ListDAO');
const ReviewDAO = require('./db/dao/ReviewDAO');
const UserDAO = require('./db/dao/UserDAO');

const { TokenMiddleware, generateToken, removeToken } = require('./middleware/TokenMiddleware');
const { RequireUser, RequireGroupOwner, RequireGroupMember, RequireListOwner } = require('./middleware/AuthorizationMiddleware');

function catchError(res, err) {
    console.error(`Error ${err.code || 500}: ${err.message}`); 
    res.status(err.code || 500).json({error: err.message});
}

apiRouter.get('/', (req,  res) => {

  res.json({your_api: 'it works'});
});

/************\
* USER ROUTES *
\************/

// Log a user in
apiRouter.post('/users/login', (req, res) => {
    if (req.body.username && req.body.password) {
        UserDAO.getUserByCredentials(req.body.username, req.body.password)
        .then(user => {
        generateToken(req, res, user);
        res.json({user: user});
        }).catch(err => {
            catchError(res, err);
        });
    } else {
        res.status(400).json({error: 'Credentials not provided'})
    }
})

// Log out a user
apiRouter.post('/users/logout', (req, res) => {
    removeToken(req, res);
    res.json({success: true});
});

// Register a new user
apiRouter.post('/users/register', (req, res) => {
    return UserDAO.createUser(req.body.username, req.body.password)
    .then(newUser => {
        if (newUser) {
            res.status(201).json(newUser);
        }
    }).catch(err => {
        catchError(res, err);
    });
});

// // Update a user's password
// apiRouter.put('/users/:userId/settings/password', (req, res) => {

// });

// Get all users
apiRouter.get('/users', TokenMiddleware, (req, res) => {
    UserDAO.getUsers().then(users => res.json(users));
});

// Get current user
apiRouter.get('/users/current', TokenMiddleware, (req,  res) => {
    res.json(req.user);
});

// Get user by ID
apiRouter.get('/users/:userId', TokenMiddleware, RequireUser, (req, res) => {
    UserDAO.getUserById(req.params.userId)
    .then(user => res.json(user))
    .catch(err => {
        catchError(res, err);
    });
});

// Update user by ID
apiRouter.put('/users/:userId/settings', TokenMiddleware, RequireUser, (req, res) => {
    UserDAO.updateUserById(req.params.userId, req.body)
    .then(updatedUser => res.json(updatedUser))
    .catch(err => {
        catchError(res, err);
    });
});

// Delete user by ID
apiRouter.delete('/users/:userId', TokenMiddleware, RequireUser, (req, res) => {
    UserDAO.deleteUserById(req.params.userId)
    .then(() => {
        removeToken(req, res); // Remove token
        res.json({message: 'User successfully deleted'});
    })
    .catch(err => {
        catchError(res, err);
    });
});

// Get a user's reviews
apiRouter.get('/users/:userId/reviews', TokenMiddleware, RequireUser, (req, res) => {
   if(req.query.album) {
        ReviewDAO.getReviewsByUserIdWithAlbum(req.params.userId)
        .then(reviews => res.json(reviews))
        .catch(err => {
            catchError(res, err);
        });
   }
   else {
        ReviewDAO.getReviewsByUserId(req.params.userId)
        .then(reviews => res.json(reviews))
        .catch(err => {
            catchError(res, err);
        });
   }
});

// Add a review
apiRouter.post('/users/:userId/reviews/:albumId', TokenMiddleware, RequireUser, (req, res) => {
    ReviewDAO.addReview(req.params.userId, req.params.albumId, req.body)
    .then(newReview => res.status(201).json(newReview))
    .catch(err => {
        catchError(res, err);
    });
});

// Update a user's review
apiRouter.put('/users/:userId/reviews/:albumId', TokenMiddleware, RequireUser, (req, res) => {
    ReviewDAO.updateReviewById(req.params.albumId, req.params.userId, req.body)
    .then(updatedReview => res.json(updatedReview))
    .catch(err => {
        catchError(res, err);
    });
});

// Remove a user's review
apiRouter.delete('/users/:userId/reviews/:albumId', TokenMiddleware, RequireUser, (req, res) => {
    ReviewDAO.deleteReviewById(req.params.albumId, req.params.userId)
    .then(() => res.json({message: 'Review successfully deleted'}))
    .catch(err => {
        catchError(res, err);
    });
});

// Get lists by user ID
apiRouter.get('/users/:userId/lists', TokenMiddleware, RequireUser, (req, res) => {
    ListDAO.getListsByUserId(req.params.userId)
    .then(lists => {
        // FIX THIS LATER
        lists ? res.json(lists) : res.json({})
        // res.json(lists);
    })
    .catch(err => {
        catchError(res, err);
    });
});

// Get a user's groups
apiRouter.get('/users/:userId/groups', TokenMiddleware, RequireUser, (req, res) => {
    GroupDAO.getGroupsByUserId(req.params.userId)
    .then(groups => res.json(groups))
    .catch(err => {
        catchError(res, err);
    });
});

/************\
* LIST ROUTES *
\************/

// Get all lists
apiRouter.get('/lists', TokenMiddleware, (req, res) => {
    ListDAO.getLists().then(lists => res.json(lists))
    .catch(err => {
        catchError(res, err);
    })
});

// Add a list
apiRouter.post('/lists', TokenMiddleware, (req, res) => {
    ListDAO.createList(req.body)
    .then(newList => res.status(201).json(newList))
    .catch(err => {
        catchError(res, err);
    })
});

// Update a list by ID
// Only list owner can do this
apiRouter.put('/lists/:listId', TokenMiddleware, RequireListOwner, (req, res) => {
    ListDAO.updateListNameById(req.params.listId, req.body)
    .then(newList => res.status(201).json(newList))
    .catch(err => {
        catchError(res, err);
    });
});

// Delete a list by ID
// Only list owner can do this
apiRouter.delete('/lists/:listId', TokenMiddleware, RequireListOwner, (req, res) => {
    ListDAO.deleteListById(req.params.listId)
    .then(() => res.json({message: 'List successfully deleted'}))
    .catch(err => {
        catchError(res, err);
    });
});

// Get list by ID
// Only list owner can do this
apiRouter.get('/lists/:listId', TokenMiddleware, RequireListOwner, (req, res) => {
    ListDAO.getListById(req.params.listId)
    .then(list => res.json(list))
    .catch(err => {
        catchError(res, err);
    });
});

// Get albums in a list
// Only list owner can do this
apiRouter.get('/lists/:listId/albums', TokenMiddleware, RequireListOwner, (req, res) => {
    ListDAO.getListAlbums(req.params.listId)
    .then(list => res.json(list))
    .catch(err => {
        catchError(res, err);
    });
});

// Add album to a list
// Only list owner can do this
apiRouter.post('/lists/:listId/albums/:albumId', TokenMiddleware, RequireListOwner, (req, res) => {
    ListDAO.addAlbumToList(req.params.listId, req.params.albumId)
    .then(list => res.json(list))
    .catch(err => {
        catchError(res, err);
    });
});

// Remove album from list
// Only list owner can do this
apiRouter.delete('/lists/:listId/albums/:albumId', TokenMiddleware, RequireListOwner, (req, res) => {
    ListDAO.deleteAlbumFromList(req.params.listId, req.params.albumId)
    .then(() => res.json({message: 'Album successfully removed from list'}))
    .catch(err => {
        catchError(res, err);
    });
});

/************\
* ALBUM ROUTES *
\************/

// Get all albums
apiRouter.get('/albums', (req, res) => {
    AlbumDAO.getAlbums().then(albums => res.json(albums));
});

// Get hot albums from Discogs
apiRouter.get('/albums/hot', (req, res) => {
    AlbumDAO.getHotAlbums().then(albums => res.json(albums));
});

// Get popular albums from Discogs
apiRouter.get('/albums/popular', (req, res) => {
    AlbumDAO.getPopularAlbums().then(albums => res.json(albums));
});


// Search for album
apiRouter.get('/albums/search', (req, res) => {
    AlbumDAO.searchAlbum(req.query.q)
    .then(albums => res.json(albums))
    .catch(err => {
      res.status(err.code || 500).json({ error: 'Failed to fetch albums from Discogs' });
    });
});

// Get album by ID
apiRouter.get('/albums/:albumId', (req, res) => {
    AlbumDAO.getAlbumById(req.params.albumId)
    .then(album => res.json(album))
    .catch(err => {
        catchError(res, err);
    });
});

// Get a track from an album
apiRouter.get('/albums/:albumId/tracks/:trackId', TokenMiddleware, (req, res) => {
    AlbumDAO.getAlbumTrackById(req.params.albumId, req.params.trackId)
    .then(track => res.json(track))
    .catch(err => {
        catchError(res, err);
    });
});

// Get album's reviews
apiRouter.get('/albums/:albumId/reviews', (req, res) => {
    if(!req.query.username) {
        ReviewDAO.getReviewsByAlbumId(req.params.albumId)
        .then(reviews => res.json(reviews))
        .catch(err => {
            catchError(res, err);
        });
    }
    else {
        ReviewDAO.getReviewsByAlbumIdWithUsername(req.params.albumId)
        .then(reviews => res.json(reviews))
        .catch(err => {
            catchError(res, err);
        })
    }
});

// Add an album
apiRouter.post('/albums', (req, res) => {
    AlbumDAO.addAlbum(req.body).then(album => {
        res.status(201).json(album);
    }).catch(err => {
        catchError(res, err);
    });
});

/************\
* GROUP ROUTES *
\************/

// Get all groups
apiRouter.get('/groups', TokenMiddleware, (req, res) => {
    GroupDAO.getGroups().then(groups => res.json(groups));
});

// Create a group
apiRouter.post('/groups', TokenMiddleware, (req, res) => {
    GroupDAO.createGroup(req.body).then(newGroup => {
        res.status(201).json(newGroup);
    }).catch(err => {
        catchError(res, err);
    });
});

// Get group by ID
apiRouter.get('/groups/:groupId', TokenMiddleware, (req, res) => {
    GroupDAO.getGroupById(req.params.groupId)
    .then(group => res.json(group))
    .catch(err => {
        catchError(res, err);
    });
});

// Update group by ID
// Only group owner is allowed to do this
apiRouter.put('/groups/:groupId', TokenMiddleware, RequireGroupOwner, (req, res) => {
    GroupDAO.updateGroupById(req.params.groupId, req.body)
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => {
        catchError(res, err);
    });
});

// Delete group by ID
// Only group owner is allowed to do this
apiRouter.delete('/groups/:groupId', TokenMiddleware, RequireGroupOwner, (req, res) => {
    GroupDAO.deleteGroupById(req.params.groupId)
    .then(() => res.json({message: 'Group successfully deleted'}))
    .catch(err => {
        catchError(res, err);
    });
});

// Get a group's members
apiRouter.get('/groups/:groupId/members', TokenMiddleware, (req, res) => {
    GroupDAO.getGroupMembers(req.params.groupId)
    .then(members => res.json(members))
    .catch(err => {
        catchError(res, err);
    });
});

// Get a group's message chat
// Only group members can do this
apiRouter.get('/groups/:groupId/messages', TokenMiddleware, RequireGroupMember, (req, res) => {
    GroupDAO.getGroupMessages(req.params.groupId)
    .then(groupChat => res.json(groupChat))
    .catch(err => {
        catchError(res, err);
    });
});

// Add a message to a group's chat
// Only group members can do this
apiRouter.post('/groups/:groupId/messages', TokenMiddleware, RequireGroupMember, (req, res) => {
    GroupDAO.addGroupMessage(req.params.groupId, req.body)
    .then(groupChat => res.status(201).json(groupChat))
    .catch(err => {
        catchError(res, err);
    });
});

// Add a user to a group
apiRouter.post('/groups/:groupId/users/:userId', TokenMiddleware, (req, res) => {
    GroupDAO.addUserToGroup(req.params.groupId, req.params.userId)
    .then(user => res.status(201).json(user))
    .catch(err => {
        catchError(res, err);
    });
});

// Remove a user from a group
apiRouter.delete('/groups/:groupId/users/:userId', TokenMiddleware, (req, res) => {
    GroupDAO.removeUserFromGroup(req.params.groupId, req.params.userId)
    .then(() => res.status(201).json({message: 'User successfully removed from group'}))
    .catch(err => {
        catchError(res, err);
    });
});

// Add an album to a group
// Only group members can do this
apiRouter.post('/groups/:groupId/albums/:albumId', TokenMiddleware, RequireGroupMember, (req, res) => {
    GroupDAO.addAlbumToGroup(req.params.groupId, req.params.albumId)
    .then(group => res.status(201).json(group))
    .catch(err => {
        catchError(res, err);
    });
});

module.exports = apiRouter;
