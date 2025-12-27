import api from './APIClient.js';

const albumList = document.getElementById('albumList');

const previouslyReviewed = false;

let userid = null;
let reviews = {};

api.getCurrentUser().then(user => {
    userid = user.id;
    api.getReviewsByUserId(userid).then(r => {
        r.forEach(review => {
            reviews[review.albumId] = review;
        });
    }).catch(error => {
        showError(error);
    });

    const selectedAlbumWrapper = document.getElementById("selectedAlbumWrapper");
    if(selectedAlbumWrapper.getAttribute("data-preloadId")) {
        api.getAlbumById(selectedAlbumWrapper.getAttribute("data-preloadId")).then(album => {
            selectAlbum(album);
            
            

        }).catch(error => {
            showError(error);
            window.location = "/search"
        });
    }
}).catch(error => {
    showError(error);
})

function selectTrack(e) {

    const currentTrackHeart = e.target.classList.contains("bi") ? 
        e.target : e.target.querySelector("i.bi");
    const currentTrack = currentTrackHeart.parentElement.parentElement;
    if(currentTrackHeart.classList.contains("bi-heart-fill")) {
        console.log('removing')
        currentTrackHeart.classList.remove("bi-heart-fill");
        currentTrackHeart.classList.add("bi-heart");
        currentTrack.classList.remove("selected-track");
    }
    else {
        if(document.querySelectorAll(".selected-track").length > 0) {
            const tracks = document.querySelectorAll('.track');
            tracks.forEach(track => {
                if(track.classList.contains("selected-track")) {
                    let heart = track.querySelector('.bi-heart-fill');
                    heart.classList.remove("bi-heart-fill");
                    heart.classList.add("bi-heart");
                    track.classList.remove('selected-track');
                }
            });
        }

        currentTrackHeart.classList.remove("bi-heart");
        currentTrackHeart.classList.add("bi-heart-fill");
        currentTrack.classList.add("selected-track");


    }

    


}

function renderAlbum(album) {
    const albumList = document.getElementById('albumList');
    const albumTemplate = document.getElementById('albumTemplate');

    const albumInstance = albumTemplate.content.cloneNode(true);
    const albumLink = albumInstance.querySelector('.albumLink');
    const albumElement = albumInstance.querySelector('.album-container');

    // Try adding album to database
    albumLink.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log(`adding album to db`);
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
                selectAlbum(addedAlbum);
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

function selectAlbum(album) {

  if (album) {
    const selectedAlbumWrapper = document.getElementById("selectedAlbumWrapper");
    selectedAlbumWrapper.style.display = "flex";
    const selectedAlbum = document.getElementById("selectedAlbum");
    const selectedAlbumTemplate = document.getElementById("selectedAlbumTemplate");
    const selectAlbumInstance = selectedAlbumTemplate.content.cloneNode(true);
    const selectAlbumElement = selectAlbumInstance.querySelector(".album-container");

    selectAlbumElement.querySelector(".cover-art").src = album.coverart;
    selectAlbumElement.querySelector('.info h1').textContent = album.name;
    selectAlbumElement.querySelector('.info h2').textContent = album.artist;

    selectedAlbum.append(selectAlbumElement);

    searchInput.value = "";
    document.getElementById("albumList").classList.add("list-hidden");
    document.getElementById('albumList').innerHTML = '';
    document.getElementById('albumList').style.margin = '0px';

    //console.log(album);

    api.getAlbumById(album.id).then(albumDetailed => {
        const albumReview = document.getElementById("albumReviewWrapper");
        const albumReviewTemplate = document.getElementById("reviewTemplate");
        const albumReviewInstance = albumReviewTemplate.content.cloneNode(true);
        const albumReviewElement = albumReviewInstance.querySelector("#selectedAlbumReview");

        albumReviewElement.setAttribute("data-id", `${album.id}`);

       // console.log(albumDetailed)

        if(albumDetailed.tracks.length > 0) {
            const trackList = albumReviewElement.querySelector(".trackList");

            const trackTemplate = document.getElementById("trackTemplate");
            
            albumDetailed.tracks.forEach(track => {
                const trackInstance = trackTemplate.content.cloneNode(true);
                const trackElement = trackInstance.querySelector(".track");
                trackElement.setAttribute("data-track-id", track.trk_id);

                if(reviews[album.id] && track.trk_id == reviews[album.id].trackId) {
                    trackElement.querySelector('.heart-icon i').classList.remove("bi-heart");
                    trackElement.querySelector('.heart-icon i').classList.add("bi-heart-fill");
                    trackElement.classList.add("selected-track");
                }

                trackElement.querySelector(".track-name").textContent = track.trk_name;
                trackList.append(trackElement);

                trackElement.addEventListener("click", selectTrack);

                

            });

            albumReviewElement.querySelector("#trackHeader").addEventListener("click", e => {
                if(document.querySelector('.dropdown-icon').classList.contains("closed")) {
                    document.querySelector('.dropdown-icon').classList.remove("closed");
                    document.querySelector('.dropdown-icon').classList.add("open");
                    document.querySelector('.dropdown-icon i').classList.remove("bi-caret-right-fill");
                    document.querySelector('.dropdown-icon i').classList.add("bi-caret-down-fill");
                    document.querySelector('.trackList').style.display = "flex";
                }
                else {
                    document.querySelector('.dropdown-icon').classList.add("closed");
                    document.querySelector('.dropdown-icon').classList.remove("open");
                    document.querySelector('.dropdown-icon i').classList.remove("bi-caret-down-fill");
                    document.querySelector('.dropdown-icon i').classList.add("bi-caret-right-fill");
                    document.querySelector('.trackList').style.display = "none";
                }
            });


        }
        else {
            albumReviewElement.querySelector("#trackHeader").style.display = "none";

        }

        const reviewRanking = albumReviewElement.querySelector(".review-ranking");

        reviewRanking.addEventListener("click", e => {
            // switch(e.target.att) {
            //     case ""
            // }
            if(e.target.attributes["data-star"]) {
                
                let star = e.target.attributes["data-star"].value;

                // console.log(e.target.classList);
                // console.log(star);
                if(e.target.classList.contains("bi-star") ||
                    e.target.classList.contains("bi-star-half")) {

                    reviewRanking.setAttribute("data-rank", star);

                    for(let i=0;i<star;i++) {
                        reviewRanking.children[i].classList.remove("bi-star");
                        reviewRanking.children[i].classList.remove("bi-star-half");
                        reviewRanking.children[i].classList.add("bi-star-fill");
                    }
                }
                else {
                    //if(star)
                    if(star == 5) {
                        if(e.target.classList.contains("bi-star-fill")) {
                                e.target.classList.remove("bi-star-fill");
                                e.target.classList.add("bi-star-half");

                                reviewRanking.setAttribute("data-rank", "4.5");
                            }
                            else {
                                e.target.classList.remove("bi-star-half");
                                e.target.classList.add("bi-star-fill");

                                reviewRanking.setAttribute("data-rank", "5");
                            }
                    }
                    else {
                        if(reviewRanking.children[star].classList.contains("bi-star-fill") || 
                            reviewRanking.children[star].classList.contains("bi-star-half")) {
                            for(let i=star;i<5;i++) {
                                reviewRanking.children[i].classList.remove("bi-star-fill");
                                reviewRanking.children[i].classList.remove("bi-star-half");
                                reviewRanking.children[i].classList.add("bi-star");
                            }

                            reviewRanking.setAttribute("data-rank", star);
                        }
                        else {
                            if(e.target.classList.contains("bi-star-fill")) {
                                e.target.classList.remove("bi-star-fill");
                                e.target.classList.add("bi-star-half");

                                reviewRanking.setAttribute("data-rank", `${star-.5}`);
                            }
                            else {
                                e.target.classList.remove("bi-star-half");
                                e.target.classList.add("bi-star-fill");

                                reviewRanking.setAttribute("data-rank", star);
                            }
                        }
                    }
                }

            }
        });

        if(reviews[album.id]) {
            console.log(reviews);
            reviewRanking.setAttribute("data-rank", reviews[album.id].score);
            albumReviewElement.querySelector(".write-review").value = reviews[album.id].review;
            albumReviewElement.querySelector(".deleteReview").style.display = "block";
            albumReviewElement.querySelector(".deleteReview").addEventListener("click", deleteReview);

            if(Number.isInteger(reviews[album.id].score)) {
                reviewRanking.children[reviews[album.id].score - 1].click();
            }
            else {
                let score = Math.ceil(reviews[album.id].score);
                reviewRanking.children[score - 1].click();
                reviewRanking.children[score - 1].click();
            }
        }

        albumReviewElement.querySelector(".submitReview").addEventListener("click", submitReview);


        albumReview.append(albumReviewElement);

    }).catch(error => {
        showError(error);
    });
  }
}

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

var query = document.querySelector(".search-wrapper").getAttribute("data-query");
if(query.length > 0) {
    let filtered = query.replaceAll("%20", " ");
    document.querySelectorAll(".search-input").forEach(input => {
        input.value = filtered;
    });

    searchButton[0].click();
}


function showMessage(status, message) {
    const messageTemplate = document.getElementById("messageTemplate");
    const messageInstance = messageTemplate.content.cloneNode(true);
    const messageElement = messageInstance.querySelector("#messages");

    if(status == "success") {
        messageElement.style.backgroundColor = "rgba(20, 200, 20, .5)";
    }
    else {
        messageElement.style.backgroundColor = "rgba(200, 20, 20, .5)";
    }
    
    messageElement.querySelector("#messageText").textContent = message;

    if (window.innerWidth < 825) {
        // mobile
        document.querySelector(".header-search-wrapper").append(messageElement);
    } else {
        // desktop
        document.body.append(messageElement);
    }

    setTimeout(() => {
        messageElement.remove()
    }, 5000);
}

function submitReview(e) {

    e.preventDefault();

    const reviewRanking = document.querySelector('.review-ranking');
    const writeReview = document.getElementById("write-review");
    const track = document.querySelectorAll('.selected-track');
    const selectedAlbumReview = document.getElementById('selectedAlbumReview');

    if(reviewRanking.getAttribute('data-rank') == "0" || writeReview.value == "") {
            // display error on page
            showMessage("error", "Please include a review!");
    }
    else {
        if(reviews[selectedAlbumReview.getAttribute('data-id')]) {

            // put
            api.updateReview(userid,
                selectedAlbumReview.getAttribute('data-id'),
                reviewRanking.getAttribute('data-rank'),
                writeReview.value,
                track[0] ? track[0].getAttribute("data-track-id") : null)
            .then(review => {

                const reviewToStore = Array.isArray(review) 
                ? review.find(r => r.albumId == selectedAlbumReview.getAttribute('data-id'))
                : review;
                
                reviews[selectedAlbumReview.getAttribute('data-id')] = reviewToStore;
              
                document.getElementById("selectedAlbum").innerHTML = '';
                document.getElementById("albumReviewWrapper").innerHTML = '';

                showMessage("success", "Successfully Updated!");


            }).catch(error => showError(error));

        }
        else {
            api.addReview(userid,
                selectedAlbumReview.getAttribute('data-id'), 
                reviewRanking.getAttribute('data-rank'), 
                writeReview.value, 
                track[0] ? track[0].getAttribute("data-track-id") : null)
            .then(review => {
                //window.location.reload();
                //reviews[selectedAlbumReview.getAttribute('data-id')] = review.filter(r => r.albumId == selectedAlbumReview.getAttribute('data-id'))[0];
                const reviewToStore = Array.isArray(review) 
                ? review.find(r => r.albumId == selectedAlbumReview.getAttribute('data-id'))
                : review;
                
                reviews[selectedAlbumReview.getAttribute('data-id')] = reviewToStore;
              
                document.getElementById("selectedAlbum").innerHTML = '';
                document.getElementById("albumReviewWrapper").innerHTML = '';

                showMessage("success", "Successfully added!");

            }).catch(error => showError(error));

        }
    }
}

function deleteReview(e) {
    e.preventDefault();

    let albumId = document.getElementById("selectedAlbumReview").getAttribute("data-id");

    api.deleteReview(userid, albumId).then(res => {
        document.getElementById("selectedAlbum").innerHTML = '';
        document.getElementById("albumReviewWrapper").innerHTML = '';

        showMessage("success", "Your review was deleted!");
        delete reviews[albumId];
    })
}

function search(input) {
    const selectedAlbumWrapper = document.getElementById("selectedAlbumWrapper");
    selectedAlbumWrapper.style.display = "none";

    const query = input.value.trim();

    document.getElementById('albumList').innerHTML = '';
    if (albumList.classList.contains("list-hidden")) {
        if (window.innerWidth < 825) {
        // mobile
        albumList.style.margin = '150px 0px 100px 0px';
        } else {
        // desktop
        albumList.style.margin = '85px 0px 35px 0px';
        }
    }
    document.getElementById("selectedAlbum").innerHTML = '';
    document.getElementById("albumReviewWrapper").innerHTML = '';

    api.searchForAlbum(query)
        .then(albums => {
            if (albums.length > 0) {
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
        })
        .catch(err => {
            showError(err);
        });
}
