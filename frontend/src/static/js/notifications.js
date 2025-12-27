import api from './APIClient.js';

api.getCurrentUser().then(user => {
    const currentUser = user;
});

/*const notifyButton = document.querySelector("#notify");
notifyButton.addEventListener("click", () => {/
    if (Notification.permission === "granted") {
        testNotification("Test Chat Notification", "This is a test notification. We already have permission to show these.");
        return;
    }
    else if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                testNotification("Example Chat Notification", "This is what a notification will look like.");
            }
        });
    }
});

const btnSubscribe = document.querySelector("#subscribe");
btnSubscribe.addEventListener('click', (event) => {
    subscribeToPush(currentUser.username);
});

function testNotification(titleText, bodyText) {
    const options = {
        body: bodyText,
        icon: "/images/icon/favicon-16x16.png"
    };
    const notification = new Notification(titleText, options); 
}*/

// Push notifications

const PUSH_PUBLIC_KEY = 'BA-GgI4NeaFcdyLpcBHp60P_Uq--xYwBlRR8KZSSTufy2NJCpvM2zLDbrlN_cHRYb-zA_QU6teGDuLBisUDryXY';

export function subscribeToPush(username) {
    // Check if service worker is supported
    try {
        navigator.serviceWorker.register('/serviceWorker.js');
    }
    catch {
        console.log("Service workers not supported");
        return;
    }
    navigator.serviceWorker.ready.then(registration => {
        return registration.pushManager.getSubscription().then(existingSubscription => {
            if (existingSubscription) {
                return existingSubscription;
            }
            return registration.pushManager.subscribe({
                userVisibleOnly: true, // 
                applicationServerKey: PUSH_PUBLIC_KEY
            });
        });
    }).then(subscription => {
            api.getCurrentUser().then(user => {
                // console.log(user);
                fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-type' : 'application/json'},
                body: JSON.stringify({
                    username: user.username,
                    subscription: subscription
                })
            });
            });
        }).catch(error => {
            console.log('Error:', error);
        })
};