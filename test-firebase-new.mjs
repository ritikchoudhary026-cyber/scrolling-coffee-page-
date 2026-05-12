import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBa9Ce0S7p3VYR4i0pTJuCQg2_TMXKxn0A",
  authDomain: "ritik-coffe-db.firebaseapp.com",
  projectId: "ritik-coffe-db",
  storageBucket: "ritik-coffe-db.firebasestorage.app",
  messagingSenderId: "930964077369",
  appId: "1:930964077369:web:1f2e4234c5fcb2562686e8",
  measurementId: "G-41D4F46BDB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const docRef = await addDoc(collection(db, "reviews"), {
      text: "test",
      author: "test",
      role: "test",
      createdAt: new Date().toISOString()
    });
    console.log("Success: ", docRef.id);
    process.exit(0);
  } catch (e) {
    console.error("Error: ", e.message);
    process.exit(1);
  }
}
test();
