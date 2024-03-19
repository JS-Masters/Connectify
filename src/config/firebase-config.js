// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyCOqhpAMGjIobubeBhhh6yogat8PKQ6A0w",
  authDomain: "connectify-416322.firebaseapp.com",
  projectId: "connectify-416322",
  storageBucket: "connectify-416322.appspot.com",
  messagingSenderId: "64193715475",
  appId: "1:64193715475:web:1674a7058d1c1dfac28ee6",
 databaseURL: 'https://connectify-416322-default-rtdb.europe-west1.firebasedatabase.app/'
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);


