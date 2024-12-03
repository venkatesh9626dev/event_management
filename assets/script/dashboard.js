
import { auth } from "./config.js"

import {onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// curent page detect variables


let localTokens = ["home","createEvent","createdEvent","participated","userProfile"]
let contentArea = document.getElementById("contentArea");
export let userInfo;

// fetch current page

onAuthStateChanged(auth,(user)=>{
if(user){
    let currentPage = JSON.parse(localStorage.getItem("currentPage"));
    
    fetch(`./${currentPage}.html`)
        .then((response)=> response.text())
        .then((page)=>{
            contentArea.innerHTML = `${page}`;
            let scriptElement = document.createElement("script");
            scriptElement.setAttribute("src", `../assets/script/${currentPage}.js?timestamp=${Date.now()}`); // This should be correct if `script` is one level up.
            scriptElement.setAttribute("type","module");
            scriptElement.setAttribute("defer",true)
            scriptElement.setAttribute("id",`${currentPage}Script`);
            document.body.appendChild(scriptElement)
            let activeNav = document.getElementById(`${currentPage}`);
            activeNav.classList.add("navActive")
        })  
    userInfo = user;

}

else{
    window.location.href = "../index.html"
}
})

// fetch page according to nav click

function fetchPage(pageName){
    fetch(`./${pageName}.html`)
    .then((response)=> response.text())
    .then((page)=>{
        contentArea.innerHTML = `${page}`;
        let scriptElement = document.createElement("script");
        scriptElement.setAttribute("src",`../assets/script/${pageName}.js?timestamp=${Date.now()}`);
        scriptElement.setAttribute("type","module");
        scriptElement.setAttribute("id",`${pageName}Script`)
        let isExistScript = document.getElementById(`${pageName}Script`);
        if(isExistScript){
            isExistScript.remove();
        }
            document.body.appendChild(scriptElement);
     
        let currentPage = JSON.stringify(`${pageName}`);
        localStorage.setItem("currentPage",currentPage);
    })
}


// nav variables

let homeBtn = document.getElementById("home");
let createBtn = document.getElementById("createEvent");
let createdBtn = document.getElementById("createdEvent");
let participatedBtn = document.getElementById("participatedEvent");
let profileBtn = document.getElementById("userProfile");
let logOutBtn = document.getElementById("logoutBtn");

let fetchBtnArr = document.querySelectorAll(".navItems");

// nav click listener
fetchBtnArr.forEach((element)=>{
    element.addEventListener("click",(event)=>{
        let elementId = event.currentTarget.id;
        fetchBtnArr.forEach((navBtn)=>{
            navBtn.classList.remove("navActive")
        })
        element.classList.add("navActive")
        fetchPage(elementId);
    })
})


logOutBtn.addEventListener("click",()=>{
    alert("Logged Out");
    localStorage.removeItem("signedUp");
    localStorage.removeItem("loginStatus");
    localStorage.removeItem("currentPage");
    signOut(auth);
})