import api from './APIClient.js';

const userId = document.querySelector(".content").getAttribute("data-userId");
const listId = document.querySelector(".content").getAttribute("data-listId");

if(userId) {
    api.getUserLists(userId).then(lists => {
            
        if(lists.length > 0) {

            lists.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

            const listCarousel = document.getElementById("listCarousel");
            lists.forEach(list => {
                const listItemTemplate = document.getElementById("listItemTemplate");
                const listItemInstance = listItemTemplate.content.cloneNode(true)
                const listItemElement = listItemInstance.querySelector('.listItem');
                listItemElement.setAttribute("data-listId", list.id);

                listItemElement.querySelector("h2").textContent = list.name;
                listCarousel.append(listItemElement);

                listItemElement.addEventListener("click", (e) => {
                    if(!listItemElement.classList.contains("selected")) renderList(listItemElement.getAttribute("data-listId"));
                })
            });

            if(listId) {
                renderList(listId);
            }
            else renderList(lists[0].id);
            // renderLists(iterableLists);


        }
    });
}

function renderList(id) {
console.log(id);
    document.querySelectorAll(`.listItem`).forEach(el => el.classList.remove("selected"));
    document.querySelector(".section-filter").style.display = "none";

    const listItem = document.querySelector(`.listItem[data-listid='${id}']`);
    listItem.classList.add("selected");

    if(history.pushState) {
        let newurl = 
        encodeURI(window.location.protocol + "//" + 
            window.location.host + window.location.pathname + '?list='
            + id);
        window.history.pushState({path:newurl},'',newurl);
    }
    // console.log(id);

    const albumList = document.getElementById("listAlbums");
    albumList.innerHTML = "";
    document.querySelector(".emptyList").style.display = "block";

    api.getListAlbums(id).then(albums => {
        if(Object.keys(albums).length > 0) {

            let albumArray = [];
            Object.keys(albums).forEach(key => {
                albumArray.push(albums[key]);
            });

            if(albumArray.length > 1) {
                document.querySelector(".section-filter").style.display = "flex";
                albumArray.sort((a, b) => {return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()});
            }
            
            
            
            //Object.keys()
            albumArray.forEach(album => {
                console.log(album);
                const albumTemplate = document.getElementById("albumTemplate");
                const albumInstance = albumTemplate.content.cloneNode(true);
                const albumElement = albumInstance.querySelector('.album-container');
                
                albumElement.setAttribute("data-albumId", album.alb_id);
                albumElement.setAttribute("data-listId", id);
                albumElement.setAttribute("data-datetime", album.datetime);
                albumElement.setAttribute("data-name", album.alb_name.split(" ").join("_"));
                albumElement.querySelector('.cover-art').src = album.alb_coverart || "/images/placeholder.png";
                albumElement.querySelector('h1').textContent = album.alb_name;

                albumList.append(albumElement);

                
            });

            document.querySelector(".emptyList").style.display = "none";

            const filter = document.querySelector(".section-filter");
            filter.querySelectorAll(".dropdown-item").forEach(filterElement => {
                filterElement.addEventListener("click", filterAlbums);
            });

            const albumElements = document.querySelectorAll('.album-container');

            albumElements.forEach(aEl => {
                aEl.querySelector(".dropdown-item[data-action='remove'").addEventListener("click", (e) => {
                    api.removeAlbumFromList(aEl.getAttribute('data-listId'), aEl.getAttribute('data-albumId')).then(() => {
                        aEl.remove();
                    });
                });
            });
        }
    });
}

function filterAlbums(e) {
  // console.log(e.target.getAttribute("data-filter"));
  switch(e.target.getAttribute("data-filter")) {
    case "recent":
      $('.album-container').sort(function(a, b) {
        return new Date(b.getAttribute("data-datetime")).getTime() - new Date(a.getAttribute("data-datetime")).getTime();
      }).appendTo('#listAlbums');
      break;
    case "oldest":
      $('.album-container').sort(function(a, b) {
        return new Date(a.getAttribute("data-datetime")).getTime() - new Date(b.getAttribute("data-datetime")).getTime();

      }).appendTo('#listAlbums');
      break;
    case "asc":
      $('.album-container').sort(function(a, b) {
        if (a.getAttribute("data-name") < b.getAttribute("data-name")) {
          return -1;
        } else {
          return 1;
        }
      }).appendTo('#listAlbums');
      break;
    case "desc":
      $('.album-container').sort(function(a, b) {
        if (a.getAttribute("data-name") > b.getAttribute("data-name")) {
          return -1;
        } else {
          return 1;
        }
      }).appendTo('#listAlbums');
      break;
  }
}

