import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZjfLw54ZyJMgducr90RWIbfu1duRVGbI",
  authDomain: "math-run-game.firebaseapp.com",
  projectId: "math-run-game",
  storageBucket: "math-run-game.firebasestorage.app",
  messagingSenderId: "440731526732",
  appId: "1:440731526732:web:8f480cb78b4a8137a0b6e9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;