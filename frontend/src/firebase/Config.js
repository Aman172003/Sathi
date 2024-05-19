// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDh0DyD2nFVU1gQ9odb15T6F0LwQMKOVK4",
  authDomain: "sathi-845dd.firebaseapp.com",
  databaseURL: "https://sathi-845dd-default-rtdb.firebaseio.com",
  projectId: "sathi-845dd",
  storageBucket: "sathi-845dd.appspot.com",
  messagingSenderId: "384743641928",
  appId: "1:384743641928:web:a0ebc1e370898ed14f597d",
  measurementId: "G-CNY41DS4KQ",
};
const app = initializeApp(firebaseConfig);
const db =  getFirestore(app);

export {db}

