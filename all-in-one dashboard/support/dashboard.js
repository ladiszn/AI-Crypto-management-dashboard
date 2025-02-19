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
            var message = childSnapshot.val();
            var messageElement = document.createElement('div');
            messageElement.classList.add(
                message['customer-service'] ? 'customercare' : 'user-message'
            );

            if (message['customer-service']) {
                messageElement.innerHTML = `
                    <p class="name">Customer Service</p>
                    <div class="main-message">${message.text}</div>`;
            } else {
                messageElement.innerHTML = `
                    <p class="name">User</p>
                    <div class="main-message">${message.text}</div>`;
            }

            messagesContainer.appendChild(messageElement);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
    });
}

// Function to send message to GPT-4 API for refinement
async function refineMessage(messageText, language) {
    const url = 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '1f2ee804b8msh4324dce9730a672p140a67jsn1cbc015eea39',
            'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: `Refine the following text in ${language}: ${messageText}. If message is unreadable or a complete misspelling, corely and solely respond with "Customer service is facing some issues, we will be with you shortly"`
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
        return messageText; // Return the original message if there's an error
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
        newMessageRef
            .set({
                text: refinedMessage,
                timestamp: Date.now(),
                'customer-service': true // Mark as customer service message
            })
            .then(() => {
                console.log("Message sent to user:", selectedUserId);
                messageInput.value = ''; // Clear input
            })
            .catch((error) => {
                console.error("Error sending message:", error);
            });
    } else {
        console.log("Message text is empty.");
    }
});

// Initialize the dashboard
window.onload = function() {
    loadUsers(); // Load the user list and last messages
};