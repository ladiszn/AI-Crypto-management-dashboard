// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjNxHJYkePfye9joh3BhEo-JS96j_aonI",
    authDomain: "brand-able.firebaseapp.com",
    databaseURL: "https://brand-able-default-rtdb.firebaseio.com",
    projectId: "brand-able",
    storageBucket: "brand-able.appspot.com",
    messagingSenderId: "54285905156",
    appId: "1:54285905156:web:a28971a836b12d09a0b451",
    measurementId: "G-3RNG3NZQ0G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to services
const database = firebase.database();
const firestore = firebase.firestore();
const storage = firebase.storage();

// Function to fetch data from Realtime Database
function fetchDataFromRealtimeDB(path) {
    return database.ref(path).once('value')
        .then(snapshot => snapshot.val())
        .catch(error => {
            console.error("Error fetching data from Realtime Database:", error);
        });
}

// Function to fetch data from Firestore
function fetchDataFromFirestore(collection) {
    return firestore.collection(collection).get()
        .then(snapshot => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return data;
        })
        .catch(error => {
            console.error("Error fetching data from Firestore:", error);
        });
}

// Function to fetch a file from Storage
function fetchFileFromStorage(filePath) {
    const fileRef = storage.ref(filePath);
    return fileRef.getDownloadURL()
        .then(url => url)
        .catch(error => {
            console.error("Error fetching file from Storage:", error);
        });
}

// Example usage
// Uncomment to use
// fetchDataFromRealtimeDB('your/path/here').then(data => console.log(data));
// fetchDataFromFirestore('your-collection-name').then(data => console.log(data));
// fetchFileFromStorage('your/file/path/here').then(url => console.log(url));