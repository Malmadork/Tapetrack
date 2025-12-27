import api from './APIClient.js';

const albumId = document.getElementById("reviewsList").getAttribute("data-albumId");

let userData = null;

api.getCurrentUser().then(user => userData = user);

api.getAlbumById(albumId).then(album => {
  document.querySelector(".album-name").innerHTML = `Reviews for ${album.name} by <i class='album-artist'>${album.artist}</i>`
})

api.getReviewsByAlbumIdWithUsername(albumId).then(reviews => {

  if(reviews.length > 0) reviews.sort((a, b) => {return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()});

  reviews = reviews.filter(review => review.usr_visibility == true || userData.username == review.username);

  reviews.forEach(review => {
    

    const reviewsList    = document.querySelector(".section-reviews");
    const reviewTemplate = document.getElementById("review-template");
    const reviewInstance = reviewTemplate.content.cloneNode(true);
    const reviewElement  = reviewInstance.querySelector('.user-review');
    const reviewScore    = reviewElement.querySelector(".review-ranking");

    reviewElement.querySelector(".review-username").textContent = review.username;
    reviewElement.querySelector(".review-text p").textContent = review.review;
    reviewElement.setAttribute("data-datetime", review.datetime);
    reviewElement.setAttribute("data-score", review.score);

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

    reviewsList.prepend(reviewElement);


  });

  if(reviews.length > 0) document.querySelector(".section-filter").style.display = "flex";

  document.querySelectorAll(".dropdown-item").forEach(filterElement => {
    filterElement.addEventListener("click", filterReviews);
  });
});

function filterReviews(e) {
  //console.log(e.target.getAttribute("data-filter"));
  switch(e.target.getAttribute("data-filter")) {
    case "recent":
      $('.user-review').sort(function(a, b) {
        return new Date(b.getAttribute("data-datetime")).getTime() - new Date(a.getAttribute("data-datetime")).getTime();
      }).appendTo('#reviewsList');
      break;
    case "oldest":
      $('.user-review').sort(function(a, b) {
        return new Date(a.getAttribute("data-datetime")).getTime() - new Date(b.getAttribute("data-datetime")).getTime();

      }).appendTo('#reviewsList');
      break;
    case "high":
      $('.user-review').sort(function(a, b) {
        if (a.getAttribute("data-score") > b.getAttribute("data-score")) {
          return -1;
        } else {
          return 1;
        }
      }).appendTo('#reviewsList');
      break;
    case "low":
      $('.user-review').sort(function(a, b) {
        if (a.getAttribute("data-score") < b.getAttribute("data-score")) {
          return -1;
        } else {
          return 1;
        }
      }).appendTo('#reviewsList');
      break;
  }
}
