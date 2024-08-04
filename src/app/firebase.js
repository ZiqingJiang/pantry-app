// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOJBBMx2k12sHDhzkLykq0zVYEIWC8wHE",
  authDomain: "pantry-99934.firebaseapp.com",
  projectId: "pantry-99934",
  storageBucket: "pantry-99934.appspot.com",
  messagingSenderId: "18855442271",
  appId: "1:18855442271:web:6a6ed59513ebf252f128ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export { firestore };
//export {app, firestore};