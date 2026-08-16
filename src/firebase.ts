import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5aT7gGWCIQLptFfBIM5hKVXkSlZhTYXU",
  authDomain: "dr-agri-b8362.firebaseapp.com",
  projectId: "dr-agri-b8362",
  storageBucket: "dr-agri-b8362.firebasestorage.app",
  messagingSenderId: "503361488714",
  appId: "1:503361488714:web:14a7d5d67f318a0e2ba3b3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
