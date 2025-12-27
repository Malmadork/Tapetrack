const errorBox = document.getElementById("errorbox");

function showError(error) {
  const messageTemplate = document.getElementById("messageTemplate");
  if (!messageTemplate) {
    console.error("messageTemplate not found");
    return;
  }

  const messageInstance = messageTemplate.content.cloneNode(true);
  const messageElement = messageInstance.querySelector("#messages");

  messageElement.querySelector("#messageText").textContent = error.error || error;
  
  if (document.querySelector(".content")) {
    document.querySelector(".content").prepend(messageElement);
  } else {
    document.body.append(messageElement);
  }
  
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

const REFERRER = document.querySelectorAll(".referrer");

if(REFERRER.length > 0) {
  REFERRER.forEach(element => {
    element.addEventListener("click", e => {
      history.go(-1);
    })
  });
}

function createSimplePopup(header="", body="", buttons=0, btn1text="", btn2text="") {
  let wrapper = document.createElement('div');
  wrapper.classList.add("popup-wrapper", "popup-1-wrapper");

  let popup = document.createElement('div');
  popup.classList.add("popup", "popup-1");

  if(header.length > 0) {
    let headerElement = document.createElement("h2");
    headerElement.classList.add("popup-header");
    headerElement.textContent = header;
    popup.append(headerElement);
  }

  if(body.length > 0) {
    let bodyElement = document.createElement("p");
    bodyElement.classList.add("popup-body");
    bodyElement.textContent = body;
    popup.append(bodyElement);
  }

  if(buttons > 0) {
    let buttonsElement = document.createElement("div");
    buttonsElement.classList.add("popup-buttons");

    if(buttons == 1) {
      let btn1Element = document.createElement("a");
      btn1Element.classList.add("btn", "btn-1", "popup-btn");
      btn1Element.textContent = btn1text;
      buttonsElement.append(btn1Element);
    }
    else if(buttons == 2) {
      let btn1Element = document.createElement("a");
      btn1Element.classList.add("btn", "btn-1", "popup-btn", "popup-btn-1");
      btn1Element.textContent = btn1text;

      let btn2Element = document.createElement("a");
      btn2Element.classList.add("btn", "btn-2", "popup-btn");
      btn2Element.textContent = btn2text;

      if (btn2text == "Cancel") {
        btn2Element.addEventListener("click", () => {
          console.log("Button 2 clicked");
          wrapper.remove(); // remove popup
        });
      }
    
      buttonsElement.append(btn1Element);
      buttonsElement.append(btn2Element);
    }

    popup.append(buttonsElement);
  }


  wrapper.append(popup);


  // Prevent clicks inside the popup from closing it
  popup.addEventListener("click", e => {
    e.stopPropagation();
  });

  wrapper.addEventListener("click", (e) => {
    // Clicks outside the popup remove it
    wrapper.remove();
  });

  if(document.querySelector(".content")) {
    document.querySelector(".content").append(wrapper);
  }
  else {
    document.body.append(wrapper);
  }
}

/*********************\
* SERVICE WORKER CODE *
\*********************/

function registerServiceWorker() {
  if (!navigator.serviceWorker) { // Are SWs supported?
    return;
  }

  navigator.serviceWorker.register('/serviceWorker.js')
    .then(registration => {
      if (!navigator.serviceWorker.controller) {
        //Our page is not yet controlled by anything. It's our first SW
        return;
      }

      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed, but waiting');
        //newServiceWorkerReady(registration.waiting);
      } else if (registration.active) {
        console.log('Service worker active');
      }

      registration.addEventListener('updatefound', () => { //This is fired whenever registration.installing gets a new worker
        console.log("SW update found", registration, navigator.serviceWorker.controller);
        newServiceWorkerReady(registration.installing);
      });
    })
    .catch(error => {
      console.error(`Registration failed with error: ${error}`);
    });

  navigator.serviceWorker.addEventListener('message', event => {
    console.log('SW message', event.data);
  });

  // Ensure refresh is only called once.
  // This works around a bug in "force update on reload" in dev tools.
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if(refreshing) return;
    window.location.reload();
    refreshing = true;
  });

};

registerServiceWorker();


// //This method is used to notify the user of a new version
// function newServiceWorkerReady(worker) {
//   const popup =  document.createElement('div');
//   popup.className = "popup";
//   popup.innerHTML = '<div>New Version Available</div>';

//   const buttonOk = document.createElement('button');
//   buttonOk.innerHTML = 'Update';
//   buttonOk.addEventListener('click', e => {
//     worker.postMessage({action: 'skipWaiting'});
//   });
//   popup.appendChild(buttonOk);

//   const buttonCancel = document.createElement('button');
//   buttonCancel.innerHTML = 'Dismiss';
//   buttonCancel.addEventListener('click', e => {
//     document.body.removeChild(popup);
//   });
//   popup.appendChild(buttonCancel);

//   document.body.appendChild(popup);
// }
