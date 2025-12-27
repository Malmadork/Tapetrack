import api from './APIClient.js';

const title = document.querySelector(".header .title");

const updatePasswordTemplate = document.getElementById("updatePasswordTemplate");
const changeAvatarTemplate = document.getElementById("changeAvatarTemplate");
const pushNotificationsTemplate = document.getElementById("pushNotificationsTemplate");
const accountVisibilityTemplate = document.getElementById("accountVisibilityTemplate");
const cacheSettingsTemplate = document.getElementById("cacheSettingsTemplate");

const contentBody = document.getElementById("contentBody");

function renderChangePassword() {
    title.textContent = "Change Password";
    const updatePasswordInstance = updatePasswordTemplate.content.cloneNode(true);
    const updatePasswordElement  = updatePasswordInstance.querySelector(".update-password");

    updatePasswordElement.querySelector("button[type='submit']").addEventListener("click", (e) => {
        e.preventDefault();

        const password = updatePasswordElement.querySelector("input[name='password']").value;
        const verify = updatePasswordElement.querySelector("input[name='verify-password']").value;

        if(password.localeCompare(verify) != 0) {
            showError({error: "Passwords do not match"});
        }
        else {
            updatePasswordElement.querySelector("button[type='submit']").setAttribute("disabled", true);
            api.getCurrentUser().then(user => {
                api.updateUserById(user.id, {password}).then(user => {
                    showMessage("success", "Password updated!")
                    console.log(user)
                }).catch(error => showError({error}))
            })
            updatePasswordElement.querySelector("button[type='submit']").setAttribute("disabled", false);
        }

        // api.getCurrentUser().then(user => {
        //     // api.updateUserById(user.id)
        // })
    })

    contentBody.append(updatePasswordElement);
}

// function renderChangeAvatar() {
//     title.textContent = "Change Avatar";
//     const changeAvatarInstance = changeAvatarTemplate.cloneNode();

//     contentBody.append(changeAvatarInstance);
// }

// function renderPushNotification() {
//     title.textContent = "Push Notifications";
//     const pushNotificationsInstance = pushNotificationsTemplate.cloneNode();

//     contentBody.append(pushNotificationsInstance);
// }

// function renderAccountVisibility() {
//     title.textContent = "Account Visibility";
//     const accountVisibilityInstance = accountVisibilityTemplate.cloneNode();

//     contentBody.append(accountVisibilityInstance);
// }

// function renderCacheSettings() {
//     title.textContent = "Cache Settings";
//     const cacheSettingsInstance = cacheSettingsTemplate.cloneNode();

//     contentBody.append(cacheSettingsInstance);
// }

const setting = document.querySelector(".content").getAttribute("data-setting");

if(setting == "password") {
    renderChangePassword();
}
else {
    document.location = "/settings";
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
        document.querySelector(".content").prepend(messageElement);
    } else {
        // desktop
        document.body.append(messageElement);
    }

    setTimeout(() => {
        messageElement.remove()
    }, 5000);
}