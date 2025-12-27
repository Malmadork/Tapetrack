const GroupDAO = require('../db/dao/GroupDAO');
const UserDAO = require('../db/dao/UserDAO');
const express = require('express');
const websocketRouter = express.Router();
const clients = new Set();


// In memory message store per group
const groupMessages = {};

function sendPacket(ws, label, data) {
    if (ws.readyState === 1) {
        ws.send(JSON.stringify({ label, data }));
    }
}

websocketRouter.ws('/ws', (ws, req) => {
    console.log('New client connected.');
    clients.add(ws);

    ws.on('message', msg => {
        let packet;
        try {
            packet = JSON.parse(msg);
        } catch (err) {
            console.error('Invalid JSON message:', err);
            return;
        }

        switch (packet.label) {
            case 'init': {
                const groupId = packet.data.groupId;
                if (!groupId) return;

                if (groupMessages[groupId]) {
                    sendPacket(ws, 'init', groupMessages[groupId]);
                } else {
                    // Load messages from DB
                    GroupDAO.getGroupMessages(groupId)
                        .then(messagesFromDB => {
                            groupMessages[groupId] = messagesFromDB || [];
                            sendPacket(ws, 'init', groupMessages[groupId]);
                        })
                        .catch(err => console.error('Failed to load messages:', err));
                }
                break;
            }

            case 'chat': {
                const { groupId: groupId, message, username } = packet.data;
                if (!groupId || !message || !username) return;

                // Sends push notification
                sendPush(packet.data.username, packet.data.message);


                // Save to DB
                GroupDAO.addGroupMessage(groupId, { message, username })
                    .then(savedMessages => {
                        const newMsg = savedMessages[savedMessages.length - 1];

                        if (!groupMessages[groupId]) groupMessages[groupId] = [];
                        groupMessages[groupId].push(newMsg);

                        clients.forEach(client => {
                            sendPacket(client, 'chat', newMsg);
                        });
                    })
                    .catch(err => console.error('Failed to save message:', err));
                break;
            }

            default:
                console.warn('Unknown packet label:', packet.label);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected.');
    });
});

const webpush = require('web-push');

// Generate VAPID keys
/* const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys); */
// Remove, generated and stored in env

const vapidKeys = {
    publicKey: process.env.PUSH_PUBLIC_KEY,
    privateKey: process.env.PUSH_PRIVATE_KEY
};

webpush.setVapidDetails(process.env.PUSH_SERVER_ID, vapidKeys.publicKey, vapidKeys.privateKey);

const pushSubscriptions = {};

websocketRouter.post('/subscribe', (req, res) => {
    pushSubscriptions[req.body.username] = req.body.subscription;
    console.log("POST HERE");
    console.log(req.body);
    res.json(req.body.subscription);
});

function sendPush(username, message) {
    for (const subscribedName in pushSubscriptions) {
        if (subscribedName === null || subscribedName === username) {
            continue;
        }
        else {
            const subscription = pushSubscriptions[subscribedName];
            webpush.sendNotification(subscription, JSON.stringify({
                title: username, 
                body: message 
            }));
            console.log("test");
        }
    } 
}

module.exports = websocketRouter;
