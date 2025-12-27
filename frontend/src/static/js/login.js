import api from './APIClient.js';

const loginForm = document.querySelector('#loginForm');
const username = document.querySelector('#username');
const password = document.querySelector('#password');

loginForm.addEventListener('submit', e => {
  e.preventDefault();

  api.logIn(username.value, password.value).then(userData => {
    document.location = "./";
  }).catch((error) => {
     showError(error);
  });
});
