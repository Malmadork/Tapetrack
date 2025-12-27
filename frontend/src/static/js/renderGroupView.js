import api from './APIClient.js'

// const NAVICON = document.getElementById("mobileNavGroups");
// NAVICON.classList.add("active-tab");
// document.getElementById("mobileNavSearch").classList.remove("active-tab");

const groupId = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
api.getGroupById(groupId)
.then(group => {
    document.querySelector("#left-nav h1").textContent = "Group: " + group.name;

    document.querySelector(".mobile-header .title").textContent = "Group: " + group.name;

    const members = Object.keys(group.members);
    const albums = Object.keys(group.albums);

    const groupElement = document.getElementById('group');
    const groupTemplate = document.getElementById('groupTemplate');

    const groupInstance = groupTemplate.content.cloneNode(true);
    const groupInstanceElement = groupInstance.querySelector(".group-wrapper");

    groupInstance.querySelector("#group-title").textContent = group.name;
    groupInstance.querySelector("#group-desc").textContent = group.description;

    const photo = groupInstance.querySelector('.group-view-photo');
    if (group.albums && Object.keys(group.albums).length > 0) {
        const firstId = Object.keys(group.albums)[0];
        photo.src = group.albums[firstId].alb_coverart;
    } else {
        photo.src = "/images/placeholder.png";
    }

    groupInstance.querySelector(".groupName").textContent = group.name;
    
    members != 1 ? groupInstance.querySelector(".groupMembers").textContent = members.length + " members" : groupInstance.querySelector(".groupMembers").textContent = members.length + " member";

    const albumCarousel = groupInstance.querySelector(".group-album-carousel");
    
    if (albums.length > 0) {
        albums.forEach(albumId => {
            api.getAlbumById(albumId)
            .then(album => {
                const imageWrapperInstance = document.createElement('div');
                imageWrapperInstance.className = 'group-album-image';
                const imageInstance = document.createElement('img');
                imageInstance.src = album.coverart;
                imageInstance.alt = "Album photo for " + album.name;

                imageWrapperInstance.appendChild(imageInstance);
                albumCarousel.appendChild(imageWrapperInstance);
            })
            .catch(err => {
                showError(err);
            });
        });
    } else {
        const noAlbums = document.createElement('p');
        noAlbums.innerText = "There are no albums in this group";
        albumCarousel.appendChild(noAlbums);
    }

    const chatButton = groupInstance.querySelector(".group-chat");
    chatButton.href = `/groups/${groupId}/chat`;

    const joinButton = groupInstanceElement.querySelector(".group-action");
    const groupActions = groupInstanceElement.querySelector(".group-actions");
    function setJoinButtonState(isMember) {
        if (isMember) {
            joinButton.textContent = 'Leave Group';
            groupActions.style.display = 'block';
            joinButton.classList.remove("btn-1");
            joinButton.classList.add("btn-2");

        } else {
            joinButton.textContent = 'Join Group';
            groupActions.style.display = 'none';
            joinButton.classList.remove("btn-2");
            joinButton.classList.add("btn-1");
        }
    }

    const deleteGroupButton = groupInstance.querySelector(".group-delete");
    deleteGroupButton.addEventListener('click', e => {
        createSimplePopup("Are you sure you want to delete this group?", "This is an irreversible action.", 2, "Yes, I'm sure.", "Cancel");
        document.querySelector(".popup-btn-1").addEventListener('click', e => {
            api.deleteGroupById(groupId).then(() => {
                window.location.href = `/groups`;
            }).catch(err => {
                showError(err);
            });
        });
        
    });

    api.getCurrentUser().then(user => {
        if (user.id == group.owner) {
            deleteGroupButton.style.display = 'block';
        }

        const isMember = Object.keys(group.members).filter(member => member == user.id);
        if (isMember.length == 0) {
          setJoinButtonState(false);
        } else {
          setJoinButtonState(true);
        }

        joinButton.addEventListener('click', e => {
            e.preventDefault();
            if (joinButton.textContent == "Join Group") {
                api.addUserToGroup(group.id, user.id).then(() => {
                    setJoinButtonState(true);
                }).catch((error) => {
                    showError(error);
                });
            } else if (joinButton.textContent == "Leave Group") {
                api.removeUserFromGroup(group.id, user.id).then(() => {
                    setJoinButtonState(false);
                }).catch((error) => {
                    showError(error);
                });
            }
        });
    }).catch(error => {
        showError(error);
    });

    // Popup
    const popup = document.querySelector('.popup-wrapper');
    const addAlbumButton = groupInstanceElement.querySelector('#addAlbum');
    addAlbumButton.addEventListener('click', (e) => {
        popup.style.display = 'block';
    });

    const closeButton = document.querySelector('.bi-x');
    closeButton.addEventListener('click', (e) => {
        popup.style.display = 'none';
    });

    groupElement.prepend(groupInstance);
})
.catch(err => {
    const groupError = document.getElementById('groupError');
    const groupErrorTemplate = document.getElementById('groupErrorTemplate');

    const groupErrorInstance = groupErrorTemplate.content.cloneNode(true);
    groupError.prepend(groupErrorInstance);
});
