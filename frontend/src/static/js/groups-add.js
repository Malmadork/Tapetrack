import api from './APIClient.js'

const arrowIcon = document.querySelector('.arrow-icon');
arrowIcon.classList.remove('disabled');
const arrowIconRef = document.querySelector('.referrer');
arrowIconRef.href = '/groups';

const addGroupForm = document.getElementById('add-group-form');
const groupName = document.getElementById('group-name');
const groupDesc = document.getElementById('group-desc');

const albumId = document.getElementById("selectedAlbumId");

addGroupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    api.getCurrentUser().then(user => {
        api.addGroup(groupName.value, groupDesc.value, user.id, albumId.value)
        .then(group => {
            console.log('successfully added group');
            // Navigate to group page
            window.location.href = `/groups/${group.id}`;
        }).catch(err => {
             showError(err);
        })
    })
    
})

// Popup
const popup = document.querySelector('.popup-wrapper');
const findAlbumButton = document.getElementById('findAlbum');
findAlbumButton.addEventListener('click', (e) => {
    popup.style.display = 'block';
});

const closeButton = document.querySelector('.bi-x');
closeButton.addEventListener('click', (e) => {
    popup.style.display = 'none';
});
