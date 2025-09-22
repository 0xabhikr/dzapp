// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCkVCiAA-7xpi2RcKszGIUJblfiXgkU-Q",
  authDomain: "dzapp-35b48.firebaseapp.com",
  projectId: "dzapp-35b48",
  storageBucket: "dzapp-35b48.appspot.com",
  messagingSenderId: "1049824158827",
  appId: "1:1049824158827:web:c5c5a01e57b1745e4abd2e",
  measurementId: "G-7N6ENZQ9CX",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const firestore = getFirestore(app);

export { auth, googleProvider, firestore };
