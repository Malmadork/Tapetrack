import api from './APIClient.js';
import validateRegistrationForm from './formValidation.js';

const registerForm = document.querySelector('#registerForm');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const verifyPassword = document.querySelector('#verify-password');

registerForm.addEventListener('submit', e => {
  e.preventDefault();

  if (validateRegistrationForm()) {
    api.register(username.value, password.value, verifyPassword.value)
        .then(() => api.logIn(username.value, password.value))
        .then(userData => {
            document.location = "./";
        }).catch((error) => {
          showError(error);
        });
  } else {
    registerForm.reportValidity();
  }
});
