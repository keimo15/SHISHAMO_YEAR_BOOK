// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCV0AouYcwy438jLH3scVIoeI3t9jD44Fk",
  authDomain: "shishamo-graduate.firebaseapp.com",
  projectId: "shishamo-graduate",
  storageBucket: "shishamo-graduate.firebasestorage.app",
  messagingSenderId: "322814341289",
  appId: "1:322814341289:web:657c95b0f92a71b5aff9b8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
