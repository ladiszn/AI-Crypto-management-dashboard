
let allUsers = []; // Store all users for filtering

// Function to render user list
async function fetchUsers() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = ''; // Clear existing data

    try {
        const snapshot = await firestore.collection('users').get();
        allUsers = []; // Reset users array

        snapshot.forEach(doc => {
            const userData = doc.data();
            const userId = doc.id;
            const email = userData.email;

            allUsers.push({ userId, email, userData });
        });

        displayUsers(allUsers); // Display all users initially

    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to display users based on a filtered list
function displayUsers(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = ''; // Clear existing data

    users.forEach(({ userId, email, userData }) => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        userCard.innerHTML = `
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <details>
              <summary>View Profile Details</summary>
              <div class="details" id="details-${userId}"></div>
            </details>
        `;

        usersList.appendChild(userCard);

        const detailsElement = userCard.querySelector('details');
        detailsElement.addEventListener('toggle', () => {
            if (detailsElement.open) {
                document.querySelectorAll('details[open]').forEach(openDetail => {
                    if (openDetail !== detailsElement) {
                        openDetail.removeAttribute('open');
                    }
                });
                renderUserDetails(userId, userData);
            }
        });
    });
}

// Function to render user details
function renderUserDetails(userId, userData) {
    const detailsDiv = document.getElementById(`details-${userId}`);
    detailsDiv.innerHTML = ''; // Clear existing details

    let table = '<table><tr><th>Field</th><th>Value</th></tr>';
    for (const key in userData) {
        table += `<tr><td>${key}</td><td>${userData[key]}</td></tr>`;
    }
    table += '</table>';

    detailsDiv.innerHTML = table;
}

// Event listener for search filter
document.getElementById('search-bar').addEventListener('input', function (e) {
    const query = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter(({ email, userId }) => 
        email.toLowerCase().includes(query) || userId.toLowerCase().includes(query)
    );
    displayUsers(filteredUsers);
});

// Fetch users on page load
window.addEventListener('DOMContentLoaded', fetchUsers);
