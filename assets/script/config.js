import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import{createUserWithEmailAndPassword,onAuthStateChanged, signInWithEmailAndPassword , updateProfile} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
          
const firebaseConfig = {
    apiKey: "AIzaSyDGn4Y0X3vjIcryoC1mL_m0CHkmWE1WR40",
    authDomain: "event-management-system-8f9cc.firebaseapp.com",
    databaseURL: "https://event-management-system-8f9cc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "event-management-system-8f9cc",
    storageBucket: "event-management-system-8f9cc.firebasestorage.app",
    messagingSenderId: "568755922602",
    appId: "1:568755922602:web:b40416ff2f13c2f7cfd2d3",
    measurementId: "G-CJV25ZFZV2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);


// window current status


onAuthStateChanged(auth,(user)=>{
    
        if(user){
            setTimeout(()=>{
                if( localStorage.getItem("loginStatus") && window.location.pathname !== "/pages/dashboard.html" ){
                window.location.replace("/pages/dashboard.html");
                }
            },500)
         }
         else{
             if(window.location.pathname !== "/index.html"){
                 window.location.pathname = "/index.html";
             }
         }
    
})