import api from './APIClient.js';

api.getCurrentUser().then(user => {
  api.getReviewsByUserIdWithAlbum(user.id).then(reviews => {
    if(reviews.length > 0) reviews.sort((a, b) => {return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()});


    
    reviews.forEach(review => {
      
      const reviewsList    = document.querySelector(".section-reviews");
      const reviewTemplate = document.getElementById("reviewTemplate");
      const reviewInstance = reviewTemplate.content.cloneNode(true);
      const reviewElement  = reviewInstance.querySelector(".review-container-detailed");
      const albumScore     = reviewInstance.querySelector(".review-ranking");

      reviewElement.querySelector('.cover-art').src = review.album.coverart || "../images/placeholder.png";
      reviewElement.querySelector('.review-album-name').textContent = review.album.name || "N/A";
      reviewElement.setAttribute("data-albumId", review.albumId);
      reviewElement.setAttribute("data-name", review.album.name.split(" ").join("_"));
      reviewElement.setAttribute("data-datetime", review.datetime);
      reviewElement.setAttribute("data-score", review.score);
        
      let reviewContent = review.review;
      if(reviewContent.length > 110) {
          reviewContent = reviewContent.substring(0, 110);
          reviewContent += "... <a class='readmore'>Read More</a>";
      }
      reviewElement.querySelector('.review-text p').innerHTML = reviewContent || "";

      if(review.score == 0) {
          albumScore.style.visibility = "hidden";
      }
      else {
          if(Number.isInteger(review.score)) {
              for(let i=0; i < review.score; i++) {
                  albumScore.children[i].classList.remove("bi-star");
                  albumScore.children[i].classList.add("bi-star-fill");
              }
          }
          else {
              let floorScore = Math.floor(review.score);
              for(let i=0; i < floorScore; i++) {
                  albumScore.children[i].classList.remove("bi-star");
                  albumScore.children[i].classList.add("bi-star-fill");
              }
              albumScore.children[floorScore].classList.remove("bi-star");
              albumScore.children[floorScore].classList.add("bi-star-half");
          }
      }

      

      reviewsList.prepend(reviewElement);
      
      
    });

    document.querySelectorAll(".review-container-detailed").forEach(reviewElement => {
        //console.log(reviewElement)
        reviewElement.addEventListener("click", (e) => {
            window.location = `/reviews/add/${reviewElement.getAttribute("data-albumId")}`
        });
    });

    if(reviews.length > 0) document.querySelector(".section-filter").style.display = "flex";

    document.querySelectorAll(".dropdown-item").forEach(filterElement => {
      filterElement.addEventListener("click", filterReviews);
    });
  });
}).catch(() => window.location = "/");

function filterReviews(e) {
  // console.log(e.target.getAttribute("data-filter"));
  switch(e.target.getAttribute("data-filter")) {
    case "recent":
      $('.review-container-detailed').sort(function(a, b) {
        return new Date(b.getAttribute("data-datetime")).getTime() - new Date(a.getAttribute("data-datetime")).getTime();
      }).appendTo('#reviewsList');
      break;
    case "oldest":
      $('.review-container-detailed').sort(function(a, b) {
        return new Date(a.getAttribute("data-datetime")).getTime() - new Date(b.getAttribute("data-datetime")).getTime();

      }).appendTo('#reviewsList');
      break;
    case "asc":
      $('.review-container-detailed').sort(function(a, b) {
        if (a.getAttribute("data-name") < b.getAttribute("data-name")) {
          return -1;
        } else {
          return 1;
        }
      }).appendTo('#reviewsList');
      break;
    case "desc":
      $('.review-container-detailed').sort(function(a, b) {
        if (a.getAttribute("data-name") > b.getAttribute("data-name")) {
          return -1;
        } else {
          return 1;
        }
      }).appendTo('#reviewsList');
      break;
    case "high":
      $('.review-container-detailed').sort(function(a, b) {
        if (a.getAttribute("data-score") > b.getAttribute("data-score")) {
          return -1;
        } else {
          return 1;
        }
      }).appendTo('#reviewsList');
      break;
    case "low":
      $('.review-container-detailed').sort(function(a, b) {
        if (a.getAttribute("data-score") < b.getAttribute("data-score")) {
          return -1;
        } else {
          return 1;
        }
      }).appendTo('#reviewsList');
      break;
  }
}
