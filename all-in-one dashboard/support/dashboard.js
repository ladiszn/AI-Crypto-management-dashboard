// Firebase configuration (unchanged)
var firebaseConfig = {
    apiKey: "AIzaSyDjNxHJYkePfye9joh3BhEo-JS96j_aonI",
    authDomain: "brand-able.firebaseapp.com",
    projectId: "brand-able",
    storageBucket: "brand-able.appspot.com",
    messagingSenderId: "54285905156",
    appId: "1:54285905156:web:a28971a836b12d09a0b451",
    measurementId: "G-3RNG3NZQ0G"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// References
var supportsRef = firebase.database().ref('supports');
var vaultRef = firebase.database().ref('vault'); // Secret folder
// DOM elements
var userListElement = document.getElementById('users');
var chatWithElement = document.getElementById('chatWith');
var messagesContainer = document.getElementById('messages');
var messageInput = document.getElementById('messageInput');
var sendButton = document.getElementById('sendButton');
var languageSelect = document.getElementById('languageSelect');

let selectedUserId = null; // Track the selected user

// Load users and their last messages
function loadUsers() {
    supportsRef.on('value', function(snapshot) {
        userListElement.innerHTML = ''; // Clear the user list
        let users = [];

        snapshot.forEach(function(childSnapshot) {
            var userId = childSnapshot.key; // User ID
            var messages = childSnapshot.val().messages; // All messages for the user
            var lastMessage = null;

            // Retrieve the last message
            for (var messageKey in messages) {
                if (!lastMessage || messages[messageKey].timestamp > lastMessage.timestamp) {
                    lastMessage = messages[messageKey];
                }
            }

            // Add user with last message to the array
            if (lastMessage) {
                users.push({
                    userId: userId,
                    lastMessage: lastMessage
                });
            }
        });

        // Sort users by the timestamp of their last message
        users.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

        // Display sorted users
        users.forEach(user => {
            var userElement = document.createElement('li');
            userElement.classList.add('user-item');

            // Add a red border if the last message is not from customer service
            if (!user.lastMessage['customer-service']) {
                userElement.classList.add('unread-message');
            }

            userElement.innerHTML = `
                <div>
                    <p><strong>${user.userId.substr(0, 12)}</strong></p>
                    <p>${user.lastMessage.text}</p>
                </div>`;
            userElement.addEventListener('click', function() {
                loadChat(user.userId); // Load chat for the selected user
            });
            userListElement.appendChild(userElement);
        });
    });
}

// Load chat for the selected user
function loadChat(userId) {
    selectedUserId = userId;
    chatWithElement.textContent = `Chat with ${userId.substr(0, 12)}`;
    var userMessagesRef = supportsRef.child(userId).child('messages');
    userMessagesRef.on('value', function(snapshot) {
        messagesContainer.innerHTML = ''; // Clear chat
        snapshot.forEach(function(childSnapshot) {
            var messageId = childSnapshot.key;
            var message = childSnapshot.val();
            var messageElement = document.createElement('div');
            messageElement.classList.add(
                message['customer-service'] ? 'customercare' : 'user-message'
            );

            messageElement.innerHTML = `
                <p class="name">${message['customer-service'] ? 'Customer Service' : 'User'}</p>
                <div class="main-message">${message.text}</div>
                <button onclick="editMessage('${userId}', '${messageId}', '${message.text}')">Edit</button>
                <button onclick="deleteMessage('${userId}', '${messageId}')">Delete</button>
            `;

            messagesContainer.appendChild(messageElement);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// Function to edit a message
function editMessage(userId, messageId, oldText) {
    var newText = prompt("Edit your message:", oldText);
    if (newText && newText.trim() !== "") {
        supportsRef.child(userId).child('messages').child(messageId).update({
            text: newText
        }).then(() => {
            console.log("Message updated successfully");
        }).catch(error => {
            console.error("Error updating message:", error);
        });
    }
}

// Function to delete a message
function deleteMessage(userId, messageId) {
    if (confirm("Are you sure you want to delete this message?")) {
        supportsRef.child(userId).child('messages').child(messageId).remove()
        .then(() => {
            console.log("Message deleted successfully");
        })
        .catch(error => {
            console.error("Error deleting message:", error);
        });
    }
}

// Function to send message to GPT-4 API for refinement
async function refineMessage(messageText, language) {
    const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': 'YOUR_API_KEY_HERE',
            'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: `Refine the following text in ${language}: ${messageText}.`
                }
            ],
            model: 'gpt-4o',
            max_tokens: 100,
            temperature: 0.9
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        console.error(error);
        return messageText;
    }
}

// Send a message to the selected user's folder
sendButton.addEventListener('click', async function() {
    if (!selectedUserId) {
        console.log("No user selected.");
        return;
    }

    var messageText = messageInput.value.trim();
    if (messageText) {
        var selectedLanguage = languageSelect.value;
        var refinedMessage = await refineMessage(messageText, selectedLanguage);

        var userMessagesRef = supportsRef.child(selectedUserId).child('messages');
        var newMessageRef = userMessagesRef.push();
        var messageData = {
            text: refinedMessage,
            timestamp: Date.now(),
            'customer-service': true
        };

        newMessageRef.set(messageData)
            .then(() => {
                console.log("Message sent to user:", selectedUserId);
                messageInput.value = '';
            })
            .catch((error) => {
                console.error("Error sending message:", error);
            });

        // Also save a copy in the secret vault
        var vaultMessageRef = vaultRef.child(selectedUserId).push();
        vaultMessageRef.set(messageData)
            .then(() => {
                console.log("Message secretly saved in vault.");
            })
            .catch((error) => {
                console.error("Error saving message to vault:", error);
            });
    } else {
        console.log("Message text is empty.");
    }
});

// Initialize the dashboard
window.onload = function() {
    loadUsers();
};
