import api from './APIClient.js';

function renderAlbum(album) {
    const albumList = document.getElementById('albumList');
    const albumTemplate = document.getElementById('albumTemplate');

    const albumInstance = albumTemplate.content.cloneNode(true);
    const albumLink = albumInstance.querySelector('.albumLink');
    const albumElement = albumInstance.querySelector('.album-container');

    // Try adding album to database
    albumLink.addEventListener('click', (e) => {
        e.preventDefault();
        try {
            api.addAlbum(
                album.id,
                album.name,
                album.artist,
                album.year,
                album.genre,
                album.numTracks,
                album.runtime,
                album.cover_art,
                album.tracklist
            ).then(addedAlbum => {
                if (window.location.pathname.includes("groups/new")) {
                    // Select album
                    document.getElementById('selectedAlbumId').value = addedAlbum.id;
                    document.querySelector('.group-album').src = addedAlbum.coverart;
                    document.querySelector('.album-info h3').textContent = addedAlbum.name;
                    document.querySelector('.album-info h4').textContent = addedAlbum.artist;
                    document.querySelector('.album-info').style.display = 'block';
                    document.querySelector('.no-album').style.display = 'none';
                    // Close popup
                    const popup = document.querySelector('.popup-wrapper');
                    popup.style.display = 'none';
                } else if (window.location.pathname.includes("groups")) {
                    // Add album to group's albums
                    const groupId = window.location.pathname.split('/').pop();
                    console.log(groupId);
                    api.addAlbumToGroup(groupId, addedAlbum.id).then(album => {
                        console.log("added album to group");
                        window.location.href = `/groups/${groupId}`;
                    }).catch(err => {
                        showError(err);
                    })
                    // Close popup
                    const popup = document.querySelector('.popup-wrapper');
                    popup.style.display = 'none';
                } else {
                    // Navigate to album page
                    window.location.href = `/albums/${addedAlbum.id}`;
                }
            });
        } catch (err) {
            showError(err);
        }
      });

    if (album.cover_art) {
        albumElement.querySelector('.cover-art').src = album.cover_art;
    } else {
        albumElement.querySelector('.cover-art').src = "../images/placeholder.png";
    } 
    albumElement.querySelector('.info h1').textContent = album.name;
    albumElement.querySelector('.info h2').textContent = album.artist;

    albumList.append(albumInstance);
}

const searchButton = document.querySelectorAll('.album-search-btn');
const searchInput = document.querySelectorAll('.search');

searchButton.forEach(btn => {
    btn.addEventListener('click', () => {
        search(btn.parentElement.querySelector(".search-input"));
    });
});
searchInput.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            search(input.querySelector(".search-input"));
        }
    });
});

if (document.querySelector(".search-wrapper")) {
    var query = document.querySelector(".search-wrapper").getAttribute("data-query");
    if(query.length > 0) {
        let filtered = decodeURI(query);
        document.querySelectorAll(".search-input").forEach(input => {
            input.value = filtered;
        });

        searchButton[0].click();
    }
}


function search(input) {
    
    const query = input.value.trim();

    document.getElementById('albumList').innerHTML = '';
    if(history.pushState) {
        let newurl = 
        encodeURI(window.location.protocol + "//" + 
            window.location.host + window.location.pathname + '?album='
            + query);
        window.history.pushState({path:newurl},'',newurl);
    }

    api.searchForAlbum(query)
        .then(albums => {
            if (albums.length > 0) {
                const albumList = document.getElementById('albumList');
                albumList.classList.remove("center-no-results");
                albums.forEach(album => renderAlbum(album));
            } else {
                console.log("no results");
                const noAlbums = document.createElement('h1');
                noAlbums.innerText = "No results found";
                const albumList = document.getElementById('albumList');
                albumList.classList.add("center-no-results");
                albumList.appendChild(noAlbums);
            }  
        }).catch(err => showError(err));
}
