// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyDwfCLAlvRQirDSxoIgNHVcBIyLdufq3xo",
  authDomain: "connectify-7b984.firebaseapp.com",
  projectId: "connectify-7b984",
  storageBucket: "connectify-7b984.appspot.com",
  messagingSenderId: "657069245755",
  appId: "1:657069245755:web:422fe673638a67537c631e",
  databaseURL: 'https://connectify-7b984-default-rtdb.europe-west1.firebasedatabase.app/'
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);