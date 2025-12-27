import api from "./APIClient.js";

const pushSettings = document.getElementById("pushSettings");
// const cacheSettings = document.getElementById("cacheSettings");
const visibilitySettings = document.getElementById("visibilitySettings");
const deleteAccount = document.getElementById("deleteAccount");
// const deleteCache = document.getElementById("deleteCache");

api.getCurrentUser().then(user => {
    let userSettings = {
        push: user.push,
        cache: user.cache,
        visibility: user.visibility
    }

    pushSettings.addEventListener("click", () => {
        let bodyString = "Push settings are currently ";
        bodyString += userSettings.push ? "enabled." : "disabled.";
        let buttonString = userSettings.push ? "Disable" : "Enable";
        buttonString += " push notifications";
        createSimplePopup("Update push settings", bodyString, 2, buttonString, "Cancel");
        const popup = document.querySelector(".popup-1-wrapper");
        popup.querySelector(".popup-btn-1").addEventListener("click", (e) => {
            api.getCurrentUser().then(user => {
                console.log(user);
                api.updateUserById(user.id, {push: !userSettings.push}).then(user => {
                    
                    showMessage("success", "Push settings updated!");
                    userSettings.push = !userSettings.push;
                    popup.remove();
                }).catch(error => showError({error}))
            })
        });
    });

    // cacheSettings.addEventListener("click", () => {
    //     let bodyString = "Cache settings are currently ";
    //     bodyString += userSettings.cache ? "enabled." : "disabled.";
    //     let buttonString = userSettings.cache ? "Disable" : "Enable";
    //     buttonString += " cache storage";
    //     createSimplePopup("Update cache settings", bodyString, 2, buttonString, "Cancel");
    //     const popup = document.querySelector(".popup-1-wrapper");
    //     popup.querySelector(".popup-btn-1").addEventListener("click", (e) => {
    //         api.getCurrentUser().then(user => {
    //             console.log(user);
    //             api.updateUserById(user.id, {cache: !userSettings.cache}).then(user => {
                    
    //                 showMessage("success", "Cache settings updated!");
    //                 userSettings.cache = !userSettings.cache;
    //                 popup.remove();
    //             }).catch(error => showError({error}))
    //         })
    //     });
    // });

    visibilitySettings.addEventListener("click", () => {
        let bodyString = "Visibility settings are currently ";
        bodyString += userSettings.visibility ? "enabled.  (Other users can see your reviews)" : "disabled.  (Other users cannot see your reviews)";
        let buttonString = userSettings.visibility ? "Disable" : "Enable";
        buttonString += " account visibility";
        createSimplePopup("Update visibility settings", bodyString, 2, buttonString, "Cancel");
        const popup = document.querySelector(".popup-1-wrapper");
        popup.querySelector(".popup-btn-1").addEventListener("click", (e) => {
            api.getCurrentUser().then(user => {
                console.log(user);
                api.updateUserById(user.id, {visibility: !userSettings.visibility}).then(user => {
                    
                    showMessage("success", "Visibility settings updated!");
                    userSettings.visibility = !userSettings.visibility;
                    popup.remove();
                }).catch(error => showError({error}))
            })
        });
    });

    deleteAccount.addEventListener("click", () => {
        createSimplePopup("Are you sure you want to delete your account?", "This is an irreversible action.", 2, "Yes, I'm sure.", "Cancel");
        const popup = document.querySelector(".popup-1-wrapper");
        popup.querySelector(".popup-body").classList.add("volatile");
        popup.querySelector(".popup-btn-1").addEventListener("click", (e) => {
            api.getCurrentUser().then(user => {
                api.deleteAccount(user.id).then(() => {
                    window.location = "/";
                }).catch(error => {
                    showError(error);
                })
            })
        });
    });

    // deleteCache.addEventListener("click", () => {
    //     createSimplePopup("Delete cache?", "This removes locally saved albums/rankings/reviews.", 2, "Yes", "Cancel");
    // });


});

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
        document.querySelector(".content").prepend(messageElement);
    } else {
        // desktop
        document.body.append(messageElement);
    }

    setTimeout(() => {
        messageElement.remove()
    }, 5000);
}
