import api from '../APIClient.js';

const NAVICON = document.getElementById("mobileNavGroups");
NAVICON.classList.add("active-tab");
document.getElementById("mobileNavSearch").classList.remove("active-tab");
NAVICON.classList.remove("bi-chat-left");
NAVICON.classList.add("bi-chat-left-fill");

const noGroups = document.getElementById("no-groups-header");

api.getCurrentUser().then(user => {
    api.getGroupsByUserId(user.id).then(groups => {
        if (noGroups && groups.length > 0) {
            noGroups.style.display = 'none';
            groups.forEach(group => renderGroup(group));
        }
    });
});

function renderGroup(group) {
    const groupList = document.getElementById('groupList');
    const groupTemplate = document.getElementById('groupTemplate');

    const groupInstance = groupTemplate.content.cloneNode(true);

    const link = groupInstance.querySelector('.groupLink');
    link.href = `/groups/${group.id}`;

    const groupElement = groupInstance.querySelector('.group-container');

    const photo = groupInstance.querySelector('.group-photo');
    if (group.albums && Object.keys(group.albums).length > 0) {
        const firstId = Object.keys(group.albums)[0];
        photo.src = group.albums[firstId].alb_coverart;
    } else {
        photo.src = "/images/placeholder.png";
    }
    groupElement.querySelector('.info h1').textContent = group.name;

    groupList.prepend(groupInstance);
}

