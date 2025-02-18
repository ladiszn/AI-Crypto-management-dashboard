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

    const auth = primaryFirebase.auth();
    const db = primaryFirebase.firestore();

 // Disable all elements when not signed in
function disableUI() {
    const allElements = document.querySelectorAll('body *');
    allElements.forEach(el => {
        // Check if the element does not have the 'auth' class and is not the sign-in button
        if (!el.classList.contains('auth') && el.id !== 'signInWithGoogle') {
            el.style.pointerEvents = 'none';
            el.classList.add('disabled');
        }
    });
}

    // Enable all elements when signed in
    function enableUI() {
        const allElements = document.querySelectorAll('body *');
        allElements.forEach(el => {
            el.style.pointerEvents = '';
            el.classList.remove('disabled');
        });
    }

    auth.onAuthStateChanged(user => {
        if (!user) {
            // User is not signed in, display the sign-in button and disable UI
            const authDiv = document.createElement('div');
            authDiv.classList.add('auth');
            authDiv.innerHTML = '<button style="cursor: pointer;" id="signInWithGoogle">Authenticate entry</button>';
            document.body.appendChild(authDiv);
            disableUI();

            document.getElementById('signInWithGoogle').addEventListener('click', () => {
                const provider = new firebase.auth.GoogleAuthProvider();
                auth.signInWithPopup(provider)
                    .then(result => {
                        console.log('Signed in with Google:', result.user);
                        authDiv.remove();
                        enableUI();
                        fetchErrors(); // Fetch errors after signing in
                    })
                    .catch(err => console.error('Google Sign-In Error:', err));
            });
        } else {
            console.log('User  logged in:', user);
            enableUI();
            fetchErrors(); // Fetch errors if already signed in
        }
    });

    // Fetch errors from Firestore and display them
    function fetchErrors() {
        const errorList = document.querySelector('.error-list');
        errorList.innerHTML = ''; // Clear existing errors

        // Create a single error container and carousel cover
        const errorContainer = document.createElement('div');
        errorContainer.classList.add('error-container');

        const carouselCover = document.createElement('div');
        carouselCover.classList.add('carousel-cover');

        db.collection('errors').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const errorText = doc.data().message;
                    const errorItem = document.createElement('span');
                    errorItem.classList.add('error-item');
                    errorItem.textContent = errorText;
                    errorItem.addEventListener('click', () => {
                        // When an error item is clicked, put the error text in the input
                        document.getElementById('sapphire-assistant').value = errorText;
                    });

                    // Append each error item to the carousel cover
                    carouselCover.appendChild(errorItem);
                });

                // Append the carousel cover to the error container
                errorContainer.appendChild(carouselCover);
                // Finally, append the error container to the error list
                errorList.appendChild(errorContainer);
            })
            .catch(err => console.error('Error fetching errors:', err));
    }

    const signOutButton = document.getElementById('signOut');
    if (signOutButton) {
        signOutButton.addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    console.log('User  signed out');
                    disableUI();  // Disable UI again after sign out
                })
                .catch(err => console.error('Sign Out Error:', err));
        });
    }
});