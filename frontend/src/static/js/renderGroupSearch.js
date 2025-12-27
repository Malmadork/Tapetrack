import api from './APIClient.js'

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

function search() {
    const query = searchInput.value.trim();

    // Get all groups
    api.getGroups()
    .then(groups => {
        // Filter groups by the search string
        const filteredGroups = groups.filter(group => 
            group.name.toLowerCase().includes(query.toLowerCase()));
        
        // Clear any existing group renderings
        document.getElementById('groupList').innerHTML = '';

        // Render the filtered groups
        filteredGroups.forEach(group => renderGroup(group));
    })
    .catch(err => showError(err));
}

const NAVICON = document.getElementById("mobileNavGroups");
NAVICON.classList.add("active-tab");

const arrowIcon = document.querySelector('.arrow-icon');
arrowIcon.classList.remove('disabled');
const arrowIconRef = document.querySelector('.referrer');
arrowIconRef.href = '/groups';

const searchButton = document.getElementById('group-search-btn');
const searchInput = document.getElementById('group-search');

api.getGroups().then(groups => {
    groups.forEach(group => renderGroup(group));
});

searchButton.addEventListener('click', () => {
    search();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        search();
    }
});