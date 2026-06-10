import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

import {
  getFirestore
} from "firebase/firestore";

const firebaseConfig = {

   apiKey: "AIzaSyANraHSa2NeXQl1OSj54I20GCbbzNhPlTw",
  authDomain: "wealth-94e33.firebaseapp.com",
  projectId: "wealth-94e33",
  storageBucket: "wealth-94e33.firebasestorage.app",
  messagingSenderId: "327428605801",
  appId: "1:327428605801:web:c844606960ee618b619ff8",
  measurementId: "G-G6PQK832BS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

export const db = getFirestore(app);