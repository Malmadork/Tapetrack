const db = require('./DBConnection');
const Group = require('../models/Group');
const { getUserById } = require('./UserDAO');
const { getAlbumById } = require('./AlbumDAO');

module.exports = {
 
// ----------------------------------------------------
// CHECK USER GROUP MEMBERSHIP
// ----------------------------------------------------
    isUserInGroup: (userId, groupId) => {
        return db.query(
            'SELECT 1 FROM group_user WHERE usr_id = ? AND grp_id = ?',
            [userId, groupId]
        ).then(rows => {
            return rows.length === 1;
        });
    },

// ----------------------------------------------------
// GET THE GROUP OWNER
// ----------------------------------------------------
    getGroupOwner: (groupId) => {
        return db.query('SELECT grp_usr_id FROM `group` WHERE grp_id = ?', [groupId])
        .then(rows => {
            if (rows.length === 0) {
                const customError = new Error("Group not found");
                customError.code = 404;
                throw customError;
            }
            return rows[0].grp_usr_id;
        });
    },

// ----------------------------------------------------
// GET ALL GROUPS
// ----------------------------------------------------
    getGroups: () => {
        return db.query('SELECT * FROM `group`')
            .then(rows => {
                const groups = rows.map(row => new Group(row));

                // Get members for all groups
                const memberPromises = groups.map(group =>
                    module.exports.getGroupMembers(group.id)
                        .then(members => {
                            group.members = members;
                            return group;
                        })
                );
                return Promise.all(memberPromises)
                .then(groups => {
                    // Get albums for all groups
                    const albumPromises = groups.map(group =>
                        module.exports.getGroupAlbums(group.id)
                            .then(albums => {
                                group.albums = albums;
                                return group;
                            })
                    );
                    return Promise.all(albumPromises);
                });
            });
    },

// ----------------------------------------------------
// GET A GROUP BY ID
// ----------------------------------------------------
    getGroupById: (groupId) => {
        return db.query('SELECT * FROM `group` WHERE grp_id = ?', [groupId])
        .then(rows => {
            if (rows.length === 1) {
                const group = new Group(rows[0]);
                return module.exports.getGroupMembers(groupId)
                .then(members => {
                    group.members = members;
                    return module.exports.getGroupAlbums(groupId)
                    .then(albums => {
                        group.albums = albums;
                        return group;
                    })
                });
            }
            const customError = new Error("Group not found");
            customError.code = 404;
            throw customError;
        });
    },

// ----------------------------------------------------
// CREATE A GROUP
// ----------------------------------------------------
    createGroup: (groupData) => {
        const { name, description, ownerId, albumId } = groupData;
        return getUserById(ownerId).then(user => {
            if (albumId) {
                return getAlbumById(albumId);
            }
            return null;
        }).then(album => {
            return db.query('INSERT INTO `group` (grp_name, grp_description, grp_usr_id) VALUES (?, ?, ?)', [name, description, ownerId])
                .then(result => {
                    if (result.affectedRows === 1) {
                        if (albumId) {
                            module.exports.addAlbumToGroup(result.insertId, albumId);
                        }
                        return module.exports.addUserToGroup(result.insertId, ownerId);
                    }
                    throw new Error('Group could not be created');
            });
        }).catch(err => {
            if (err.code === 'ER_DUP_ENTRY') {
                const customError = new Error('A group with that name already exists');
                customError.code = 409;
                throw customError;
            }
            throw err;
        }) 
    },

// ----------------------------------------------------
// UPDATE A GROUP BY ID
// ----------------------------------------------------
    updateGroupById: (groupId, groupData) => {
        return module.exports.getGroupById(groupId).then(group => {
            const { name, description } = groupData;
            return db.query(
                'UPDATE `group` SET grp_name = ?, grp_description = ? WHERE grp_id = ?', [name, description, groupId]
            ).then(result => {
                if (result.affectedRows === 1) {
                    return module.exports.getGroupById(groupId);
                }
                throw new Error('Group could not be updated');
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// DELETE A GROUP BY ID
// ----------------------------------------------------
    deleteGroupById: (groupId) => {
        return module.exports.getGroupById(groupId).then(group => {
            return db.query(
                'DELETE FROM `group` WHERE grp_id = ?', [groupId]
            ).then(result => {
                if (result.affectedRows === 1) {
                    return;
                }
                throw new Error('Group could not be deleted');
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// GET GROUPS BY USER ID
// ----------------------------------------------------
    getGroupsByUserId: (userId) => {
        return getUserById(userId).then(user => {
            return db.query('SELECT `group`.grp_id, `group`.grp_name, `group`.grp_description FROM `group` JOIN group_user ON group_user.grp_id = `group`.grp_id WHERE group_user.usr_id = ?', [userId]
            ).then(rows => {
                const groups = rows.map(row => new Group(row));

                // Get members for all groups
                const memberPromises = groups.map(group =>
                    module.exports.getGroupMembers(group.id)
                        .then(members => {
                            group.members = members;
                            return group;
                        })
                );
                return Promise.all(memberPromises)
                .then(groups => {
                    // Get albums for all groups
                    const albumPromises = groups.map(group =>
                        module.exports.getGroupAlbums(group.id)
                            .then(albums => {
                                group.albums = albums;
                                return group;
                            })
                    );
                    return Promise.all(albumPromises);
                });
            });
        }).catch(err => {
            throw err;
        })
        
    },

// ----------------------------------------------------
// ADD A USER TO A GROUP BY THEIR IDS
// ----------------------------------------------------
    addUserToGroup: (groupId, userId) => {
        return module.exports.getGroupById(groupId).then(group => {
            return db.query(
                'INSERT INTO group_user (grp_id, usr_id) VALUES (?, ?)',
                [groupId, userId]
            ).then(result => {
                if (result.affectedRows === 1) {
                    return module.exports.getGroupById(groupId);
                }
                throw new Error('User could not be added to group');
            });
        }).catch(err => {
            if (err.code === 'ER_DUP_ENTRY') {
                const customError = new Error('User is already in group');
                customError.code = 409;
                throw customError;
            }
            throw err;
        });
    },

// ----------------------------------------------------
// REMOVE A USER FROM A GROUP BY THEIR IDS
// ----------------------------------------------------
    removeUserFromGroup: (groupId, userId) => {
        return module.exports.getGroupById(groupId).then(group => {
            // Check if this is the group owner
            if (userId == group.owner) {
                throw new Error('Cannot remove group owner');
            }
            return db.query(
                'DELETE FROM group_user WHERE grp_id = ? AND usr_id = ?',
                [groupId, userId]
            ).then(result => {
                if (result.affectedRows === 1) {
                    return;
                }
                throw new Error('User could not be deleted from group');
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// GET ALL THE USERS IN A GROUP
// ----------------------------------------------------
    getGroupMembers: (groupId) => {
        return db.query(
            'SELECT grp_id FROM `group` WHERE grp_id = ?',
            [groupId]
        ).then(rows => {
            if (rows.length === 1) {
                return db.query('SELECT user.usr_id, user.usr_username FROM user JOIN group_user ON group_user.usr_id = user.usr_id WHERE group_user.grp_id = ?', [groupId]
                ).then(rows => {
                    const members = {};
                    rows.forEach(row => {
                        members[row.usr_id] = row.usr_username;
                    });
                    return members;
                });
            } else {
                const customError = new Error("Group not found");
                customError.code = 404;
                throw customError;
                }
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// ADD AN ALBUM TO A GROUP
// ----------------------------------------------------
    addAlbumToGroup: (groupId, albumId) => {
        return module.exports.getGroupById(groupId).then(group => {
            return getAlbumById(albumId).then(album => {
                return db.query(
                    'INSERT INTO group_album (grp_id, alb_id) VALUES (?, ?)', [groupId, albumId]
                ).then(result => {
                    if (result.affectedRows === 1) {
                        return module.exports.getGroupById(groupId);
                    }
                    throw new Error('Album could not be added to group');
                });
            }).catch(err => {
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new Error('Album is already in the group');
                }
                throw err;
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// GET A GROUP'S ALBUMS
// ----------------------------------------------------
    getGroupAlbums: (groupId) => {
        return db.query('SELECT album.* FROM album JOIN group_album ON group_album.alb_id = album.alb_id WHERE group_album.grp_id = ?', [groupId]
        ).then(rows => {
            const albums = {};
            rows.forEach(row => {
                albums[row.alb_id] = row;
            });
            return albums;
        });
    },

// ----------------------------------------------------
// GET A GROUP'S MESSAGES BY ID
// ----------------------------------------------------
    getGroupMessages: (groupId) => {
        return module.exports.getGroupById(groupId).then(group => {
            return db.query('SELECT * FROM message WHERE msg_grp_id = ? ORDER BY msg_id ASC', [groupId]
            ).then(rows => {
                return rows;
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// ADD A MESSAGE TO A GROUP'S CHAT
// ----------------------------------------------------
    addGroupMessage: (groupId, messageData) => {
        console.log(groupId);
        return module.exports.getGroupById(groupId).then(group => {
            // Check group message limit before adding
            const MAX_MESSAGES = 100;
            db.query('SELECT COUNT(*) as total FROM message WHERE msg_grp_id = ?', [groupId]
            ).then(countResult => {
                const total = countResult[0].total;
                if (total >= MAX_MESSAGES) {
                // Delete the oldest message for this group
                    db.query('DELETE FROM message WHERE msg_grp_id = ? ORDER BY msg_id ASC LIMIT 1', [groupId]);
                }
            });
            console.log(messageData);
            const { message, username } = messageData;
            return db.query('INSERT INTO message (msg_grp_id, msg_content, username) VALUES (?, ?, ?)', [groupId, message, username])
                .then(result => {
                    if (result.affectedRows === 1) {
                        return module.exports.getGroupMessages(groupId);
                    }
                    throw new Error('Message could not be added');
                });
        }).catch(err => {
            throw err;
        });
    }
}