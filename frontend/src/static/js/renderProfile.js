import api from './APIClient.js';

api.getCurrentUser().then(user => {
    document.querySelector(".desktop-header h1").textContent = `${user.username}`;

    document.querySelector(".reviews-link").addEventListener("click", () => {
        window.location = `/users/${user.id}/reviews`
    });

    document.querySelector(".lists-link").addEventListener("click", () => {
        window.location = `/users/${user.id}/lists`;
    })

    api.getReviewsByUserIdWithAlbum(user.id).then(reviews => {
        if(reviews.length > 0) {
            
            reviews.sort((a, b) => {return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()});
            console.log(reviews);
            
            document.querySelector(".section-recents").style.display = "block";
            const albumList = document.getElementById('recentReview');
            const albumTemplate = document.getElementById('reviewTemplate');

            const albumInstance = albumTemplate.content.cloneNode(true);
            const albumLink = albumInstance.querySelector('.reviewLink');
            const albumElement = albumInstance.querySelector('.review-container-detailed');
            const albumScore   = albumInstance.querySelector(".review-ranking");

            albumElement.setAttribute("data-albumId", reviews[0].albumId);
            
            albumElement.querySelector('.cover-art').src = reviews[0].album.coverart || "../images/placeholder.png";
            albumElement.querySelector('.review-album-name').textContent = reviews[0].album.name || "N/A";
            

            let reviewContent = reviews[0].review;
            if(reviewContent.length > 110) {
                reviewContent = reviewContent.substring(0, 110);
                reviewContent += "... <a class='readmore'>Read More</a>";
            }
            albumElement.querySelector('.review-text p').innerHTML = reviewContent || "";

            if(reviews[0].score == 0) {
                albumScore.style.visibility = "hidden";
            }
            else {
                if(Number.isInteger(reviews[0].score)) {
                    for(let i=0; i < reviews[0].score; i++) {
                        albumScore.children[i].classList.remove("bi-star");
                        albumScore.children[i].classList.add("bi-star-fill");
                    }
                }
                else {
                    let floorScore = Math.floor(reviews[0].score);
                    for(let i=0; i < floorScore; i++) {
                        albumScore.children[i].classList.remove("bi-star");
                        albumScore.children[i].classList.add("bi-star-fill");
                    }
                    albumScore.children[floorScore].classList.remove("bi-star");
                    albumScore.children[floorScore].classList.add("bi-star-half");
                }
            }
        
            albumList.prepend(albumElement);

            albumElement.addEventListener("click", (e) => {
                window.location = `/reviews/add/${albumElement.getAttribute("data-albumId")}`
            });
           
        }
        else {
            document.querySelector(".section-recents").remove();
        }
        
        
    });

    

    api.getUserLists(user.id).then(lists => {
        
        if(lists.length > 0) {

            // FIX THIS TO RENDER THEM IN ORDER
            // WE REALLY SHOULD HAVE A TIMESTAMP FOR LIST UPDATES

            lists.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
            let iterableLists = lists;
            //console.log(iterableLists);
            renderLists(iterableLists, user);
        }
    });

    
});

function renderLists(lists, user) {

    api.getListAlbums(lists[0].id).then(albums => {
        
        const listCarousel = document.getElementById("listCarousel");

        let single = lists[0].albums > 1;
        const listTemplate = single ?
             document.getElementById('quadlistTemplate') :
             document.getElementById('listTemplate');

        const listInstance = listTemplate.content.cloneNode(true);
        const listLink = listInstance.querySelector('.listLink');
        const listElement = listInstance.querySelector('.list-container');

        listElement.setAttribute("data-listId", lists[0].id);
        // for(let i = 0; i < (lists.length > 3 ? 3 : lists.length); i++ ) {
        //     console.log(lists[i]);
        // }
        // for(let i = 0; i < lists.length > 2 ? 3 : lists.length; i++) {
        //     //console.log(lists);
        // }
            
        //album.cover_art ||
        //listElement.querySelector('.cover-art').src =  "../images/placeholder.png";
        if(lists[0].albums == 1) {
            let album = albums[Object.keys(albums)[0]];
            console.log(album);
            listElement.querySelector('.cover-art').src = album.alb_coverart || "../images/placeholder.png";
        }
        else if(lists[0].albums == 0) {
            // listElement.querySelector('.cover-art').removeAttribute('src');
             listElement.querySelector('.cover-art').src = "../images/placeholder.png";
        }
        else {

            //THIS JUST SORTS IT BY ALB_ID, CHANGE THIS LATER
            //IF WE WANT THEM SORTED BY TIMESTAMPS OR ARRANGABLE LISTS

            let recentAlbums = [];
            Object.keys(albums).forEach(key => recentAlbums.push(key));
            recentAlbums.sort((a, b) => b - a);
            if(recentAlbums.length > 4) recentAlbums.length == 4;

            if(recentAlbums.length > 2 ) {
                for(let i = 0; i < 4; i++) {
                    if(recentAlbums[i]) {
                        //console.log(listElement.querySelector('.cover-art'))
                        let newImg = document.createElement("img");
                        newImg.src = albums[recentAlbums[i]].alb_coverart || "../images/placeholder.png";
                        newImg.classList.add("cover-art-single");
                        newImg.alt = "album cover art";
                        listElement.querySelector('.cover-art').append(newImg);
                    }
                    else {
                        // let dummy = document.createElement("div");
                        // dummy.classList.add("cover-art-single-dummy");
                        // listElement.querySelector('.cover-art').append(dummy);
                    }
                }
            }
            else {
                let newImg1 = document.createElement("img");
                newImg1.src = albums[recentAlbums[0]].alb_coverart || "../images/placeholder.png";
                newImg1.classList.add("cover-art-single");
                newImg1.alt = "album cover art";
                listElement.querySelector('.cover-art').append(newImg1);
                let dummy1 = document.createElement("div");
                dummy1.classList.add("cover-art-single-dummy");
                listElement.querySelector('.cover-art').append(dummy1);
                let dummy2 = document.createElement("div");
                dummy2.classList.add("cover-art-single-dummy");
                listElement.querySelector('.cover-art').append(dummy2);

                let newImg2 = document.createElement("img");
                newImg2.src = albums[recentAlbums[1]].alb_coverart || "../images/placeholder.png";
                newImg2.classList.add("cover-art-single");
                newImg2.alt = "album cover art";
                listElement.querySelector('.cover-art').append(newImg2);
                
            }


            

            
            
        }

        listElement.querySelector('h1').textContent = lists[0].name;
    
        listCarousel.append(listElement);

        listElement.addEventListener("click", (e) => {
            window.location = `/users/${user.id}/lists?list=${listElement.getAttribute("data-listId")}`;
        });

        lists.shift();
        if(lists[0]) renderLists(lists, user)
    })
}
