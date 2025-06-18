// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyYourApiKeyHere",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// تهيئة التطبيق
firebase.initializeApp(firebaseConfig);

// تصدير الخدمات التي سنستخدمها
const database = firebase.database();
const auth = firebase.auth();

export { database, auth };
