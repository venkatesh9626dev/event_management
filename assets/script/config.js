import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import{createUserWithEmailAndPassword,onAuthStateChanged, signInWithEmailAndPassword , updateProfile} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
    getDatabase,
    ref,
    child,
    set,
    get,
  } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";      
const firebaseConfig = {
    apiKey: "AIzaSyDGn4Y0X3vjIcryoC1mL_m0CHkmWE1WR40",
    authDomain: "https://campusconnect0.netlify.app",
    databaseURL: "https://event-management-system-8f9cc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "event-management-system-8f9cc",
    storageBucket: "event-management-system-8f9cc.firebasestorage.app",
    messagingSenderId: "568755922602",
    appId: "1:568755922602:web:b40416ff2f13c2f7cfd2d3",
    measurementId: "G-CJV25ZFZV2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export let db = getDatabase()
// window current status

export let mailApiKey = "zkYPANFFIvAj9nsGD";
export let serviceKey = "service_70x8kng";
export let templateKey = "template_j8uxvdf"


