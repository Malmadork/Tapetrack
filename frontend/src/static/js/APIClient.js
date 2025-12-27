import HTTPClient from './HTTPClient.js';

const BASE_API_PATH = '/api';

const register = (username, password, confirmPassword) => {
  const data = {
    username: username,
    password: password,
    confirm_password: confirmPassword,
  };
  return HTTPClient.post(`${BASE_API_PATH}/users/register`, data);
  
};

const logIn = (username, password) => {
  const data = {
    username: username,
    password: password
  };
  return HTTPClient.post(`${BASE_API_PATH}/users/login`, data);
};

const logOut = () => {
  return HTTPClient.post(`${BASE_API_PATH}/users/logout`, {});
};

const updateUserById = (userId, data) => {
  return HTTPClient.put(`${BASE_API_PATH}/users/${userId}/settings`, data);
}

const deleteAccount = (userId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/users/${userId}`);
}

const getCurrentUser = () => {
  return HTTPClient.get(`${BASE_API_PATH}/users/current`);
};

const getUserById = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/users/${id}`);
};

const searchForAlbum = (query) => {
  return HTTPClient.get(`${BASE_API_PATH}/albums/search?q=${encodeURIComponent(query)}`);
};

const addAlbum = (discogs_id, name, artist, year, genre, numTracks, runtime, coverart, tracklist) => {
  const data = {
    discogs_id: discogs_id,
    name: name,
    artist: artist,
    year: year,
    genre: genre.toString(),
    numTracks: numTracks,
    runtime: runtime,
    coverart: coverart,
    tracklist: tracklist
  }
  return HTTPClient.post(`${BASE_API_PATH}/albums`, data);
};

const getAlbumById = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/albums/${id}`);
};

const getAlbums = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/albums`);
};

const getHotAlbums = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/albums/hot`);
};

const getPopularAlbums = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/albums/popular`);
};

const addGroup = (name, description, ownerId, albumId) => {
  const data = {
    name: name,
    description: description,
    ownerId: ownerId,
    albumId: albumId
  }
  return HTTPClient.post(`${BASE_API_PATH}/groups`, data);
};

const getGroups = () => {
  return HTTPClient.get(`${BASE_API_PATH}/groups`);
};

const getGroupById = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/groups/${id}`);
}

const deleteGroupById = (id) => {
  return HTTPClient.delete(`${BASE_API_PATH}/groups/${id}`);
}

const getGroupsByUserId = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/users/${id}/groups`);
}

const addUserToGroup = (groupId, userId) => {
  return HTTPClient.post(`${BASE_API_PATH}/groups/${groupId}/users/${userId}`);
}

const removeUserFromGroup = (groupId, userId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/groups/${groupId}/users/${userId}`);
}

const addAlbumToGroup = (groupId, albumId) => {
  return HTTPClient.post(`${BASE_API_PATH}/groups/${groupId}/albums/${albumId}`);
}

const getReviewsByAlbumId = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/albums/${id}/reviews`);
}
const getReviewsByAlbumIdWithUsername = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/albums/${id}/reviews?username=true`);
}

const getReviewsByUserId = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/users/${id}/reviews`);
}

const getReviewsByUserIdWithAlbum = (id) => {
  return HTTPClient.get(`${BASE_API_PATH}/users/${id}/reviews?album=true`);
}

const getAlbumTrackById = (albumId, trackId) => {
  return HTTPClient.get(`${BASE_API_PATH}/albums/${albumId}/tracks/${trackId}`);
}

const addReview = (userId, albumId, score, review, trackId) => {
  const data = {
    score: score,
    review: review,
    trackId: trackId
  }
  return HTTPClient.post(`${BASE_API_PATH}/users/${userId}/reviews/${albumId}`, data);
};

const updateReview = (userId, albumId, score, review, trackId) => {
  const data = {
    score: score,
    review: review,   
    trackId: trackId
  }
  
  return HTTPClient.put(`${BASE_API_PATH}/users/${userId}/reviews/${albumId}`, data);
};

const deleteReview = (userId, albumId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/users/${userId}/reviews/${albumId}`);
};

const createList = (userId, list_name) => {
  const data = {
    userId: userId,
    list_name: list_name
  }
  return HTTPClient.post(`${BASE_API_PATH}/lists`, data);
};

const updateList = (listId, list_name) => {
  const data = {
    list_name: list_name
  }
  return HTTPClient.put(`${BASE_API_PATH}/lists/${listId}`, data);
};

const deleteList = (listId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/lists/${listId}`);
};

const getListById = (listId) => {
  return HTTPClient.get(`${BASE_API_PATH}/lists/${listId}`);
};

const getListAlbums = (listId) => {
  return HTTPClient.get(`${BASE_API_PATH}/lists/${listId}/albums`);
};

const addAlbumToList = (listId, albumId) => {
  return HTTPClient.post(`${BASE_API_PATH}/lists/${listId}/albums/${albumId}`);
};

const removeAlbumFromList = (listId, albumId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/lists/${listId}/albums/${albumId}`);
};

const getUserLists = (userId) => {
  return HTTPClient.get(`${BASE_API_PATH}/users/${userId}/lists`);
};

const getGroupMessages = (groupId) => {
  return HTTPClient.get(`${BASE_API_PATH}/groups/${groupId}/messages`);
};

const addGroupMessage = (groupId, message, username) => {
  console.log(groupId);
  const data = {
    message: message,
    username: username
  };
  return HTTPClient.post(`${BASE_API_PATH}/groups/${groupId}/messages`, data);
}


export default {
  register,
  logIn,
  logOut,
  updateUserById,
  deleteAccount,
  getCurrentUser,
  getUserById,
  searchForAlbum,
  addAlbum,
  getAlbumById,
  getAlbums,
  getHotAlbums,
  getPopularAlbums,
  addGroup,
  getGroups,
  getGroupById,
  deleteGroupById,
  getGroupsByUserId,
  addUserToGroup,
  removeUserFromGroup,
  addAlbumToGroup,
  getReviewsByAlbumId,
  getReviewsByAlbumIdWithUsername,
  getReviewsByUserId,
  getReviewsByUserIdWithAlbum,
  getAlbumTrackById,
  addReview,
  updateReview,
  deleteReview,
  createList,
  updateList,
  deleteList,
  getListById,
  getListAlbums,
  addAlbumToList,
  removeAlbumFromList,
  getUserLists,
  getGroupMessages,
  addGroupMessage
};
