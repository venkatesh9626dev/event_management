
import { auth } from "./config.js"

import {onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

let displayUsername = document.getElementById("userName")
let logOutBtn = document.getElementById("logoutBtn");

    
    onAuthStateChanged(auth,(user)=>{
        if(user){
            displayUsername.innerHTML= ` Hello ${user.displayName}`
        }
        else{
            
            window.location.href = "../index.html"

        }
    })


logOutBtn.addEventListener("click",()=>{
    alert("Logged Out");
    localStorage.removeItem("signedup")
    signOut(auth)
})