import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALcidtp8Xrak3vfjdqbtCyzEElimKSw-8",
  authDomain: "yourtube-7560d.firebaseapp.com",
  projectId: "yourtube-7560d",
  storageBucket: "yourtube-7560d.firebasestorage.app",
  messagingSenderId: "915490862335",
  appId: "1:915490862335:web:969848b83982568b4e88ca",
  measurementId: "G-4ZQ1JLLZVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };