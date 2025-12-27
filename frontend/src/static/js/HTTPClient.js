function processJSONResponse(res) {
  return res.json()
    .catch(() => ({}))
    .then(data => {
      if (!res.ok) {
        const message = data.error || `This request was not successful: ${res.statusText} (${res.status})`;
        const error = new Error(message);
        error.status = res.status;
        throw error;
      }
      return data;
    });
};

function handleError(err) {
  console.error('Error in fetch', err);
  throw err;
};

export default {
  get: (url) => {
    return fetch(url)
      .then(processJSONResponse)
      .catch(handleError);
  },

  post: (url, data) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(processJSONResponse)
    .catch(handleError);
  },
  
  put: (url, data) => {
    return fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(processJSONResponse)
    .catch(handleError);

  },

  delete: (url) => {
    return fetch(url, {
      method: 'DELETE',
      headers: {
      }
    })
  .then(processJSONResponse)
  .catch(handleError);
  },

};