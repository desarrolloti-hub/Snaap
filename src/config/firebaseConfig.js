// src/config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjOrKIFp_Ml5RssrXduujNZW7ai1XIlRw",
  authDomain: "snaap-mx.firebaseapp.com",
  projectId: "snaap-mx",
  storageBucket: "snaap-mx.firebasestorage.app",
  messagingSenderId: "933191996234",
  appId: "1:933191996234:web:f45259cdd819f76d27e7b3",
  measurementId: "G-MTTZBGRWYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };