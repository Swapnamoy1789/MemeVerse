// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // ✅ Import Firestore
import { getStorage } from "firebase/storage";      // ✅ Import Storage (if using)

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDseIpmQdf7DsF6WggyADvLsfBWOj1bnc8",
  authDomain: "memeverse-28d4d.firebaseapp.com",
  projectId: "memeverse-28d4d",
  storageBucket: "memeverse-28d4d.firebasestorage.app",
  messagingSenderId: "272184013946",
  appId: "1:272184013946:web:43add7f06ae0141c1d37c3",
  measurementId: "G-49MXC93VTF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
