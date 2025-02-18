document.addEventListener('DOMContentLoaded', () => {
    const primaryFirebaseConfig = {
        apiKey: "AIzaSyAW9qr2us34hO2mxK1SKFV4HHldKtwfvTA",
        authDomain: "bleep-ng.firebaseapp.com",
        databaseURL: "https://bleep-ng-default-rtdb.firebaseio.com",
        projectId: "bleep-ng",
        storageBucket: "bleep-ng.appspot.com",
        messagingSenderId: "811422307857",
        appId: "1:811422307857:web:b50718524f93736b6e03b0",
        measurementId: "G-37EQFZPYTT"
    };

    let primaryFirebase;

    if (!firebase.apps.some(app => app.name === 'primaryfirebase')) {
        primaryFirebase = firebase.initializeApp(primaryFirebaseConfig, 'primaryfirebase');
    } else {
        primaryFirebase = firebase.app('primaryfirebase');
    }

    const db = primaryFirebase.firestore();

    // Fetch errors from Firestore
    function fetchErrors() {
        const errorList = document.querySelector('.error-list');
        errorList.innerHTML = ''; // Clear existing errors

        db.collection('errors').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const errorText = doc.data().message;
                    const errorId = doc.id;

                    const errorItem = document.createElement('span');
                    errorItem.classList.add('error-item');
                    errorItem.textContent = errorText;
                    errorItem.addEventListener('click', () => {
                        document.getElementById('sapphire-assistant').value = errorText;
                    });

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('delete-button');
                    deleteButton.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent triggering the error item click
                        deleteError(errorId);
                    });

                    const carouselCover = document.createElement('div');
                    carouselCover.classList.add('carousel-cover');
                    carouselCover.appendChild(errorItem);
                    carouselCover.appendChild(deleteButton); // Add delete button to the cover

                    const errorContainer = document.createElement('div');
                    errorContainer.classList.add('error-container');
                    errorContainer.appendChild(carouselCover);

                    errorList.appendChild(errorContainer);
                });
            })
            .catch(err => console.error('Error fetching errors:', err));
    }

    // Add new error to Firestore
    document.getElementById('addError').addEventListener('click', () => {
        const errorMessage = document.getElementById('sapphire-assistant').value.trim();

        if (errorMessage) {
            db.collection('errors').add({ message: errorMessage })
                .then(() => {
                    console.log('Error added');
                    fetchErrors(); // Refresh error list
                })
                .catch(err => console.error('Error adding error:', err));
        }
    });

    // Delete error by ID
    function deleteError(errorId) {
        db.collection('errors').doc(errorId).delete()
            .then(() => {
                console.log('Error deleted');
                fetchErrors(); // Refresh error list
            })
            .catch(err => console.error('Error deleting error:', err));
    }

    fetchErrors(); // Initial fetch on page load
});