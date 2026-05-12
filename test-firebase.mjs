import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBr3owXP2z0HAR5LdffZ3Q9xM1yxiHSTek",
  authDomain: "reviews-7bd4e.firebaseapp.com",
  projectId: "reviews-7bd4e",
  storageBucket: "reviews-7bd4e.firebasestorage.app",
  messagingSenderId: "323083521390",
  appId: "1:323083521390:web:d6ffa58328994e4233457f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Adding document...");
    const docRef = await addDoc(collection(db, "reviews"), {
      text: "This is a test review from the developer console.",
      author: "System Test",
      role: "Bot",
      createdAt: new Date().toISOString()
    });
    console.log("Document written with ID: ", docRef.id);
    
    console.log("Fetching documents...");
    const snapshot = await getDocs(collection(db, "reviews"));
    snapshot.forEach(doc => {
      console.log(doc.id, "=>", doc.data());
    });
    process.exit(0);
  } catch (e) {
    console.error("Error: ", e);
    process.exit(1);
  }
}

test();
