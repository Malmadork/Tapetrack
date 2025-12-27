const db = require('./DBConnection');
const User = require('../models/User');
const crypto = require('crypto');

module.exports = {
// ----------------------------------------------------
// GET ALL USERS
// ----------------------------------------------------
    getUsers: () => {
        return db.query('SELECT * FROM user')
        .then(rows => rows.map(row => new User(row)));
    },

// ----------------------------------------------------
// GET A USER BY ID
// ----------------------------------------------------
    getUserById: (userId) => {
        return db.query('SELECT * FROM user WHERE usr_id = ?', [userId])
        .then(rows => {
            if (rows.length === 1) {
                return new User(rows[0]);
            } else {
                const customError = new Error("User not found");
                customError.code = 404;
                throw customError;
            }
        });
    },

// ----------------------------------------------------
// GET A USER BY THEIR USERNAME AND PASSWORD
// ----------------------------------------------------
    getUserByCredentials: (username, password) => {
        return db.query('SELECT * FROM user WHERE usr_username=?', [username]).then(rows => {
        if (rows.length === 1) { // we found our user
            const user = new User(rows[0]);
            return user.validatePassword(password)
                .then(validUser => validUser)
                .catch(err => {
                    throw new Error("Invalid credentials");
                });
        }
        // if no user with provided username
        throw new Error("Invalid credentials");
        });
    },

// ----------------------------------------------------
// CREATE A NEW USER
// ----------------------------------------------------
    createUser: (username, password) => {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16).toString('hex');
            crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                if (err) { // problem computing digest, like hash function not available
                    reject({code: 500, message: "Error hashing password " + err});
                    return;
                }
                const digest = derivedKey.toString('hex');
                db.query('INSERT INTO user (usr_username, usr_salt, usr_password) VALUES (?, ?, ?)', [username, salt, digest])
                .then(result => {
                    if (result.affectedRows === 1) {
                        return module.exports.getUsers();
                    }
                    throw new Error('User could not be created');
                }).catch(err => {
                    if (err.code === 'ER_DUP_ENTRY') {
                        throw new Error('User with username already exists');
                    }
                    throw err;
                })
                .then(newUsers => resolve(newUsers))
                .catch(err => reject(err));
            });
        });
    },

// ----------------------------------------------------
// UPDATE A USER'S PASSWORD AND/OR PUSH SETTING
// ----------------------------------------------------
    updateUserById: (userId, userData) => {
        return module.exports.getUserSettingsByID(userId).then(user => {
            return new Promise((resolve, reject) => {
                //console.log(userData)
                if(!Object.keys(userData).find(setting => setting == "push" || setting == "password" || setting == "cache" || setting == "visibility") )
                    throw new Error('User data not provided.')
                
                if(Object.keys(userData).find(setting => setting == "password")) {
                    const salt = crypto.randomBytes(16).toString('hex');
                    crypto.pbkdf2(userData.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                        if (err) { // problem computing digest, like hash function not available
                            reject({code: 500, message: "Error hashing password " + err});
                            return;
                        }
                        const digest = derivedKey.toString('hex');
                        return db.query('UPDATE user SET usr_salt = ?, usr_password = ? WHERE usr_id = ?', [salt, digest, userId])
                        .then(result => {
                            if (result.affectedRows === 1) {
                                return module.exports.getUserById(userId);
                            } else {
                                throw new Error('User could not be updated');
                            }
                        })
                        .then(user => resolve(user))
                        .catch(err => reject(err));
                    })
                }
                if(Object.keys(userData).find(setting => setting == "push")) {
                    //console.log("here")
                    return db.query('UPDATE user SET usr_push = ? WHERE usr_id = ?', [userData.push, userId])
                        .then(result => {
                            if (result.affectedRows === 1) {
                                return module.exports.getUserById(userId);
                            } else {
                                throw new Error('User could not be updated');
                            }
                        })
                        .then(user => resolve(user))
                        .catch(err => reject(err));
                }
                if(Object.keys(userData).find(setting => setting == "cache")) {
                    return db.query('UPDATE user SET usr_cache = ? WHERE usr_id = ?', [userData.cache, userId])
                        .then(result => {
                            if (result.affectedRows === 1) {
                                return module.exports.getUserById(userId);
                            } else {
                                throw new Error('User could not be updated');
                            }
                        })
                        .then(user => resolve(user))
                        .catch(err => reject(err));
                }
                if(Object.keys(userData).find(setting => setting == "visibility")) {
                    return db.query('UPDATE user SET usr_visibility = ? WHERE usr_id = ?', [userData.visibility, userId])
                        .then(result => {
                            if (result.affectedRows === 1) {
                                return module.exports.getUserById(userId);
                            } else {
                                throw new Error('User could not be updated');
                            }
                        })
                        .then(user => resolve(user))
                        .catch(err => reject(err));
                }
                 
                
                
                
            });
        }).catch(err => {
            throw err;
        });
    },

// ----------------------------------------------------
// DELETE A USER BY ID
// ----------------------------------------------------
    deleteUserById: (userId) => {
        // Handle group ownership before deleting user
        return db.query('SELECT grp_id FROM `group` WHERE grp_usr_id = ?', [userId])
        .then(groups => {
            const groupPromises = groups.map(group => {
                const groupId = group.grp_id;
                return db.query(
                    'SELECT usr_id FROM group_user WHERE grp_id = ? AND usr_id != ?',
                    [groupId, userId]
                ).then(members => {
                    if (members.length > 0) {
                        // Transfer ownership to the next group member
                        const newOwnerId = members[0].usr_id;
                        return db.query(
                            'UPDATE `group` SET grp_usr_id = ? WHERE grp_id = ?',
                            [newOwnerId, groupId]
                        );
                    } else {
                        // No members are left, delete the group
                        return db.query('DELETE FROM `group` WHERE grp_id = ?', [groupId]);
                    }
                });
            });

            return Promise.all(groupPromises);
        }).then(() => {
            return db.query(
                'DELETE FROM user WHERE usr_id = ?', [userId]
            ).then(result => {
                if (result.affectedRows === 1) {
                    return;
                }
                throw new Error('User not found');
            });
        });
    },

// ----------------------------------------------------
// GET A USER BY THEIR USERNAME
// ----------------------------------------------------
    getUserByUsername: (username) => {
        return db.query('SELECT * FROM user WHERE usr_username=?', [username])
        .then(rows => {
            if (rows.length === 1) {
                return new User(rows[0]);
            }
            return null;
        });
    },

// ----------------------------------------------------
// GET A USER'S DETAILS BY ID (internal)
// ----------------------------------------------------
    getUserSettingsByID: (id) => {
        return db.query('SELECT * FROM user WHERE usr_id=?', [id])
        .then(rows => {
            if (rows.length === 1) {
                return new User(rows[0]);
            }
            return null;
        });
    }

}
