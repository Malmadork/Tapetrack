import { registerServiceWorker } from './sw.js';
import { subscribeToPush } from './notifications.js';


registerServiceWorker();
import api from './APIClient.js';

let socket = null;
let myName = null;
const groupId = window.location.pathname.split('/').slice(-2, -1)[0];

const chatContainer = document.querySelector("#chatContainer");
const inputText = document.querySelector("#message");
const sendButton = document.querySelector("#send");

api.getGroupById(groupId)
    .then(group => {
        document.querySelector(".title").innerText = `Group: ${group.name}` || "Group Chat";
        document.querySelector("#left-nav h1").innerText = `Group: ${group.name}` || "Group Chat";
    })
    .catch(err => console.error("Failed to load group info:", err));

function initPage() {
    api.getCurrentUser()
        .then(user => {
            myName = user.username;

            socket = connectWebSocket();
            if (user.push) {
                subscribeToPush(user.username);
            }
            console.log(user);
            setupChatInput();
        })
        .catch(err => console.error("Initialization failed:", err));
}

function setupChatInput() {
    inputText.addEventListener('keyup', e => {
        if (e.key === "Enter") sendButton.click();
    });

    sendButton.addEventListener('click', () => {
        const text = inputText.value.trim();
        if (!text) return;

        inputText.value = "";
        inputText.focus();

        sendMessage(text);
    });
}

function connectWebSocket() {
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${scheme}://${window.location.host}/api/ws`);

    ws.addEventListener('open', () => {
        console.log('Connected to WebSocket server.');

        ws.send(JSON.stringify({
            label: 'init',
            data: { groupId }
        }));
    });

    ws.addEventListener('message', e => {
        try {
            const packet = JSON.parse(e.data);

            if (packet.label === 'init') {
                packet.data.forEach(msg => renderMessage(msg));
            } else if (packet.label === 'chat') {
                renderMessage(packet.data);
            }
        } catch (err) {
            console.error("Failed to parse WS message:", err);
        }
    });

    ws.addEventListener('close', () => { socket = null; });
    ws.addEventListener('error', () => ws.close());

    return ws;
}

function sendMessage(msgContent) {
    if (!myName) return;

    const payload = {
        label: 'chat',
        data: {
            groupId,
            message: msgContent,
            username: myName
        }
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
    }
}

function renderMessage(msg) {
    const messageDiv = document.createElement('div');
    const username = msg.username;

    messageDiv.className = `message ${username === myName ? 'me' : 'other'}`;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.innerText = username;

    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.innerText = msg.msg_content || msg.message;

    messageDiv.appendChild(nameDiv);
    messageDiv.appendChild(textDiv);

    chatContainer.appendChild(messageDiv);

    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
    // chatContainer.scrollTop = chatContainer.scrollHeight;
}

initPage();

import { } from './notifications.js';
