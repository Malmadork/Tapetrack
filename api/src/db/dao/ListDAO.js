const db = require('./DBConnection');
const List = require('../models/List');
const { getUserById } = require('./UserDAO');
const { getAlbumById } = require('./AlbumDAO');

module.exports = {

    getListOwner: (listId) => {
        return db.query('SELECT usr_id FROM list WHERE list_id = ?', [listId])
        .then(rows => {
            if (rows.length === 0) {
                const customError = new Error("List not found");
                customError.code = 404;
                throw customError;
            }
            return rows[0].usr_id;
        });
    },

// ----------------------------------------------------
// GET ALL LISTS
// ----------------------------------------------------
    getLists: () => {
        return db.query('SELECT * FROM list')
        .then(rows => rows.map(row => new List(row)));
    },

    getListsByUserId: (userId) => {
        return getUserById(userId).then(user => {
            console.log(user)
            return db.query('SELECT list.list_id, list_name, usr_id, datetime, (SELECT COUNT(*) FROM list_album WHERE list_id = list.list_id) AS albums FROM list WHERE usr_id =  ?', [user.id])
            .then(rows => 
               rows.map(row => new List(row))
            );
        }).catch(err => {
            throw err;
        })

    },
    
// ----------------------------------------------------
// GET LIST BY ID
// ----------------------------------------------------
    getListById: (listId) => {
        return db.query('SELECT * FROM list WHERE list_id = ?', [listId])
        .then(rows => {
            if (rows.length === 1) {
                return new List(rows[0]);
            } else {
                const customError = new Error("List not found");
                customError.code = 404;
                throw customError;
            }
        });
    },

// ----------------------------------------------------
// CREATE A NEW LIST
// ----------------------------------------------------
    createList: (listData) =>{
        return getUserById(listData.userId).then(user => {
            return db.query('INSERT INTO list (list_name, usr_id) VALUES (?, ?)',
            [
                listData.list_name,
                listData.userId,
            ]).then(result => {
                if (result.affectedRows === 1) {
                    return module.exports.getListById(result.insertId);
                } else {
                    throw new Error('Could not create list');
                }
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// UPDATE A LIST'S NAME
// ----------------------------------------------------
    updateListNameById: (listId, listData) => {
        return db.query('UPDATE list SET list_name = ? WHERE list_id = ?', [listData.list_name, listId])
        .then(result => {
            if (result.affectedRows === 1) {
                return module.exports.getListById(listId);
            } else {
                throw new Error('List could not be updated');
            }
        });
    },

// ----------------------------------------------------
// GET THE ALBUMS IN A LIST
// ----------------------------------------------------
    getListAlbums: (listId) => {
        // Verify that list exists
        return module.exports.getListById(listId).then(list => {
            return db.query('SELECT album.*, list_album.datetime FROM album JOIN list_album ON list_album.alb_id = album.alb_id WHERE list_album.list_id = ?', [listId]
            ).then(rows => {
                const albums = {};
                rows.forEach(row => {
                    albums[row.alb_id] = row;
                });
                return albums;
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// ADD AN ALBUM TO A LIST
// ----------------------------------------------------
    addAlbumToList: (listId, albumId) => {
        // Verify that list exists
        return module.exports.getListById(listId).then(list => {
            // Verify that album exists in db
            return getAlbumById(albumId).then(album => {
                return db.query(
                    'INSERT INTO list_album (list_id, alb_id) VALUES (?, ?)',
                    [listId, albumId]
                ).then(result => {
                    if (result.affectedRows === 1) {
                        return db.query(
                            'UPDATE list SET datetime = CURRENT_TIMESTAMP WHERE list_id = ?', [listId]
                        ).then(listRes => {
                            if(listRes.affectedRows === 1) {
                                return module.exports.getListAlbums(listId);
                            }
                            throw new Error('Could not update list after adding album.');
                        })
                        .catch(err => {
                            throw err;
                        })
                    }
                    throw new Error('Album could not be added to list');
                }).catch(err => {
                    if (err.code === 'ER_DUP_ENTRY') {
                        const customError = new Error('Album is already in the list');
                        customError.code = 409;
                        throw customError;
                    }
                    throw err;
                });
            }).catch(err => {
                throw err;
            })
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// REMOVE AN ALBUM FROM A LIST
// ----------------------------------------------------
    deleteAlbumFromList: (listId, albumId) => {
        // Verify that list exists
        return module.exports.getListById(listId).then(list => {
            return db.query(
                'DELETE FROM list_album WHERE list_id = ? AND alb_id = ?', [listId, albumId]
            ).then(result => {
                if (result.affectedRows === 1) {
                    return;
                }
                throw new Error('Album not found in list');
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// DELETE A LIST
// ----------------------------------------------------
    deleteListById: (listId) => {
        return db.query(
            'DELETE FROM list WHERE list_id = ?', [listId]
        ).then(result => {
            if (result.affectedRows === 1) {
                return;
            }
            throw new Error('List not found');
        });
    }

}
