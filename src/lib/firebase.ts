import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBa9Ce0S7p3VYR4i0pTJuCQg2_TMXKxn0A",
  authDomain: "ritik-coffe-db.firebaseapp.com",
  projectId: "ritik-coffe-db",
  storageBucket: "ritik-coffe-db.firebasestorage.app",
  messagingSenderId: "930964077369",
  appId: "1:930964077369:web:1f2e4234c5fcb2562686e8",
  measurementId: "G-41D4F46BDB"
};

// Initialize Firebase only if it hasn't been initialized already (important for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };