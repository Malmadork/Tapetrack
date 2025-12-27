import api from './APIClient.js'

// const arrowIcon = document.querySelector('.arrow-icon');
// arrowIcon.classList.remove('disabled');
// const arrowIconRef = document.querySelector('.referrer');
// arrowIconRef.href = '/search';

// const REVIEW_LINK = document.querySelector("#moreReviews a");
// REVIEW_LINK.href = "/album/" + REVIEW_LINK.getAttribute("data-id") + "/reviews";



// Get album ID from url
const pathParts = window.location.pathname.split('/');
const albumId = pathParts[pathParts.length - 1];
// console.log(albumId);

let userLists = [];

let authUser = false;
let userData = null;

api.getCurrentUser().then(user => {
    authUser = true;
    userData = user;
    api.getUserLists(user.id).then(lists => {

        // console.log(lists)
    //    
    lists.sort((a, b) => a.id - b.id);
    
    lists.forEach(list => {
        api.getListAlbums(list.id).then(albums => {
            const albumInList = albums[albumId] ? true : false;
            addExistingListElement(list, albumInList);
            if(document.querySelector(".popup-wrapper .no-lists")) document.querySelector(".popup-wrapper .no-lists").remove();
        });
    });


        
    });
});

api.getAlbumById(albumId).then(album => {
    // console.log(album);
    const albumTemplate   = document.getElementById("album-template");
    const content         = document.querySelector(".content");

    const albumInstance   = albumTemplate.content.cloneNode(true);
    const albumElement    = albumInstance.querySelector(".album-page");

    const albumName       = albumInstance.querySelector('.album-name');
    const albumArtist     = albumInstance.querySelector('.album-artist');
    const albumArt        = albumInstance.querySelector('.cover-art');
    const trackList       = albumInstance.getElementById('trackList');
    

    albumName.innerText   = album.name;
    albumArtist.innerText = album.artist;
    albumArt.src          = album.coverart;

    trackList.innerHTML   = '';

    if(!authUser) albumElement.querySelector(".save-lists").remove();
    if(!authUser) albumElement.querySelector(".album-reviews").remove();
    
    content.prepend(albumElement);
    

    album.tracks.forEach(track => renderTrack(track));

    api.getReviewsByAlbumIdWithUsername(album.id).then(reviews => {
        
        if(reviews.length == 0) {
            const reviewsLink = document.querySelector('.more-reviews');
            if(reviewsLink) reviewsLink.querySelector('h3').textContent = "Be the first to review";
            if(reviewsLink)  reviewsLink.querySelector('a').href = "/reviews/add/" + reviewsLink.querySelector('a').getAttribute("data-id")
        }
        else {

            reviews = reviews.filter(review => review.usr_visibility == true || userData.username == review.username );
            
            reviews.sort((a, b) => {return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()});
            const userReviewsList = document.getElementById("userReviewsList");

            let maxReviews = reviews.length >= 3 ? 3 : reviews.length;
            console.log(maxReviews);

            for(let i = 0; i < maxReviews; i++) {
                let review = reviews[i];
                const reviewTemplate = document.getElementById("review-template");
                const reviewInstance = reviewTemplate.content.cloneNode(true);
                const reviewElement  = reviewInstance.querySelector('.user-review');
                const reviewScore    = reviewElement.querySelector(".review-ranking");

                reviewElement.querySelector(".review-username").textContent = review.username;
                reviewElement.querySelector(".review-text p").textContent = review.review;
                reviewScore.setAttribute("data-score", review.score);

                if(review.score == 0) {
                    reviewScore.style.visibility = "hidden";
                }
                else {
                    if(Number.isInteger(review.score)) {
                        for(let i=0; i < review.score; i++) {
                            reviewScore.children[i].classList.remove("bi-star");
                            reviewScore.children[i].classList.add("bi-star-fill");
                        }
                    }
                    else {
                        let floorScore = Math.floor(review.score);
                        for(let i=0; i < floorScore; i++) {
                            reviewScore.children[i].classList.remove("bi-star");
                            reviewScore.children[i].classList.add("bi-star-fill");
                        }
                        reviewScore.children[floorScore].classList.remove("bi-star");
                        reviewScore.children[floorScore].classList.add("bi-star-half");
                    }
                }

                userReviewsList.append(reviewElement);
            }
            // reviews.forEach(review => {
                

            // });

            if(reviews.length <= 3) {
                if(document.getElementById("moreReviews")) document.getElementById("moreReviews").remove();
            }
            else {
                const reviewsLink = document.querySelector('.more-reviews');
                if(reviewsLink)  reviewsLink.querySelector('a').href = `/albums/${reviewsLink.querySelector('a').getAttribute("data-id")}/reviews`;
            }
             
            
            api.getCurrentUser().then(user => {
                if(!reviews.some(r => r.userId === user.id)) {
                    const reviewsLink = document.querySelector('.your-review');
                    if(reviewsLink) {
                        reviewsLink.querySelector('a').href = "/reviews/add/" + reviewsLink.querySelector('a').getAttribute("data-id");
                        reviewsLink.style.display = "flex";
                        
                    }
                }
                else {
                    if(reviews.length <= 3) {
                        userReviewsList.children[userReviewsList.children.length - 1].style.marginBottom = "100px"
                    }
                    else {
                        document.querySelector(".more-reviews").style.marginBottom = "50px";
                    }
                }

                
                
            }).catch(error => showError(error));
        }
    });

    api.getCurrentUser().then(user => {
        const saveToList = document.querySelector(".save-lists");
        saveToList.addEventListener("click", e => {
            renderSaveToList(album, user);
        });
    });
    
}).catch(err => {
    const albumError = document.getElementById('albumError');
    const albumErrorTemplate = document.getElementById('albumErrorTemplate');

    const albumErrorInstance = albumErrorTemplate.content.cloneNode(true);
    albumError.prepend(albumErrorInstance);
})

function renderSaveToList(album, user) {
    const popup = document.querySelector('.popup-wrapper');
    
    popup.style.display = 'block';

    if(userLists.length == 0) {
        if(popup.querySelector(".no-lists")) popup.querySelector(".no-lists").remove();
    }
    else {
        userLists.forEach(userList => {
            console.log(userList);
        });
    }

    const newListButton = document.querySelector('.new-list');
    newListButton.addEventListener('click', addNewListElement);
   
    const closeButton = document.querySelector('.close-list');
    closeButton.addEventListener('click', (e) => {
        popup.style.display = 'none';
        document.querySelectorAll(".user-list").forEach(userList => {
            if(userList.classList.contains("existing-user-list")) {
               if(!userList.classList.contains("user-list-nosave") &&
                userList.classList.contains("user-list-selected")) {
                    api.addAlbumToList(userList.getAttribute("data-listId"), album.id).then(() => {
                        userList.classList.add("user-list-nosave");
                    });
                }
                else if(!userList.classList.contains("user-list-nosave")) {
                    api.removeAlbumFromList(userList.getAttribute("data-listId"), album.id).then(() => {
                        userList.classList.add("user-list-nosave");
                    });
                }
            }
            else if(userList.classList.contains("new-user-list") && 
                !userList.classList.contains("user-list-nosave")) {
                console.log(user.id);
                console.log(userList.querySelector("input.list-name").value);
                api.createList(user.id, userList.querySelector("input.list-name").value).then(list => {
                    console.log(list);
                    if(userList.classList.contains("user-list-selected"))
                        api.addAlbumToList(list.id, album.id).then(() => {
                        userList.classList.add("user-list-nosave");
                    });
                })
            }
        });
    });
}

function addExistingListElement(list, albumInList) {
    if(document.querySelector(".popup-wrapper .no-lists")) document.querySelector(".no-lists").remove();
    const listList = document.getElementById("listList");
    const listTemplate = document.getElementById("existingListTemplate");
    const listInstance = listTemplate.content.cloneNode(true);
    const listElement  = listInstance.querySelector('.user-list');

    const listName = listElement.querySelector(".list-name");
    listName.textContent = list.name;
    listElement.setAttribute("data-listId", list.id);

    const listCheckbox = listElement.querySelector(".list-checkbox");

    if(albumInList) {
        listCheckbox.setAttribute("selected", true);
        listCheckbox.querySelector("i").classList.remove("bi-square");
        listCheckbox.querySelector("i").classList.add("bi-check-square-fill");
        listElement.classList.add("user-list-selected");
    }

    
    listCheckbox.addEventListener("click", (e) => {
        
        
        if(listCheckbox.getAttribute("selected")) {
            listCheckbox.removeAttribute("selected");
            listCheckbox.querySelector("i").classList.remove("bi-check-square-fill");
            listCheckbox.querySelector("i").classList.add("bi-square");
            listElement.classList.remove("user-list-selected");

            listElement.classList.toggle("user-list-nosave");

        }
        else {
            listCheckbox.setAttribute("selected", true);
            listCheckbox.querySelector("i").classList.remove("bi-square");
            listCheckbox.querySelector("i").classList.add("bi-check-square-fill");
            listElement.classList.add("user-list-selected");

            listElement.classList.toggle("user-list-nosave");
        }
    });

    listList.append(listElement);
}

function addNewListElement(e) {
    if(document.querySelector(".popup-wrapper .no-lists")) document.querySelector(".no-lists").remove();

    const listList = document.getElementById("listList");
    const listTemplate = document.getElementById("newListTemplate");
    const listInstance = listTemplate.content.cloneNode(true);
    const listElement  = listInstance.querySelector('.user-list');

    

    listList.append(listElement);

    const listName = listElement.querySelector(".list-name");
    listName.addEventListener("input", (e) => {
        listName.classList.remove("list-name-default");
        if(listName.value.trim() == "") {
            if(!listElement.classList.contains("user-list-nosave"))
                listElement.classList.add("user-list-nosave");
        }
        else {
            if(listElement.classList.contains("user-list-nosave"))
                listElement.classList.remove("user-list-nosave");
        }
    });

    const listCheckbox = listElement.querySelector(".list-checkbox");
    listCheckbox.addEventListener("click", (e) => {
        
        
        if(listCheckbox.getAttribute("selected")) {
            listCheckbox.removeAttribute("selected");
            listCheckbox.querySelector("i").classList.remove("bi-check-square-fill");
            listCheckbox.querySelector("i").classList.add("bi-square");
            listElement.classList.remove("user-list-selected");

            if(listName.classList.contains("list-name-default")) {
                if(!listElement.classList.contains("user-list-nosave"))
                    listElement.classList.add("user-list-nosave");
            }

        }
        else {
            listCheckbox.setAttribute("selected", true);
            listCheckbox.querySelector("i").classList.remove("bi-square");
            listCheckbox.querySelector("i").classList.add("bi-check-square-fill");
            listElement.classList.add("user-list-selected");

             if(listName.value.trim() == "") {
                if(!listElement.classList.contains("user-list-nosave"))
                    listElement.classList.add("user-list-nosave");
            }
            else {
                if(listElement.classList.contains("user-list-nosave"))
                    listElement.classList.remove("user-list-nosave");
            }
        }
    });
    
}

function renderTrack(track) {
    const trackList = document.getElementById('trackList');
    const trackTemplate = document.getElementById('track-template');

    const trackInstance = trackTemplate.content.cloneNode(true);
    const trackElement = trackInstance.querySelector('.track');
    trackElement.querySelector('.track-name').innerText = track.trk_name;
    if (track.trk_duration != '0:00') {
        trackElement.querySelector('.track-duration').innerText = track.trk_duration;
    } else {
        trackElement.querySelector('.track-duration').innerText = '';
    }
    trackList.append(trackElement);
}

