import { auth,db} from "./config.js";

import { onAuthStateChanged ,signOut} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  ref, get,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname == "/pages/dashboard.html") {
    window.location.replace("/index.html");
  }
});

// setting flag for fetching events from the firebase

sessionStorage.setItem("currentPage","createEvent");


let variablesObj = {} // all variable names with id

document.querySelectorAll("[id]").forEach((element)=>{
  variablesObj[element.id] = element
})



// create event page  fetch  listener

variablesObj["createEventBtn"].addEventListener("click",()=> fetchPages("createEvent") );
variablesObj["createdBtn"].addEventListener("click",()=> fetchPages("createdEvents"));
variablesObj["myEventsBtn"].addEventListener("click",()=> fetchPages("myEvents"));
// loader function

function loader(){
  let loader = document.createElement("div");
  loader.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style = "font-size: 40px;"></i>';
  loader.classList.add("blurbackground");
  document.querySelector("#mainContainer").appendChild(loader);
}


// create event page  fetch function

 async function fetchPages(pageName) {

  loader();
  
  try {
    // Fetch the HTML content
    let page = await  fetch(`/pages/${pageName}.html`);
    let pageContent =  await page.text();

    let isStyleExists = document.querySelector(
      `link[rel="stylesheet"][href="/assets/style/${pageName}.css"]`
    );

    // Add CSS dynamically

    if (!isStyleExists) {
      let styleElement = document.createElement("link");
      styleElement.setAttribute("rel", "stylesheet");
      styleElement.setAttribute("href", `/assets/style/${pageName}.css`);
      document.head.appendChild(styleElement);
      styleElement.onload = ()=> variablesObj["dynamicContainer"].innerHTML = pageContent;
    }
    else{
      variablesObj["dynamicContainer"].innerHTML = pageContent;
    }

    

    let isScriptExists = document.querySelector(`script#${pageName}`);

    // Add JS dynamically

    if (!isScriptExists) {
      let scriptElement = document.createElement("script");
      scriptElement.setAttribute("src", `/assets/script/${pageName}.js`);
      scriptElement.setAttribute("type", "module");
      scriptElement.setAttribute("id", `${pageName}`);
      document.head.appendChild(scriptElement);      
    }
    else{
      isScriptExists.remove();
      let scriptElement = document.createElement("script");
      scriptElement.setAttribute("src", `/assets/script/${pageName}.js?timestamp=${Date.now()}`);
      scriptElement.setAttribute("type", "module");
      scriptElement.setAttribute("id", `${pageName}`);
      document.head.appendChild(scriptElement);
    }
    
  } catch (error) {
    console.error("Error loading the page or assets:", error);
  }
};


// sidebar functions

variablesObj["btn"].addEventListener("click", () => {
  variablesObj["sidebar"].classList.toggle("open");
  menuBtnChange();
})

function menuBtnChange() {
  if (variablesObj["sidebar"].classList.contains("open")) {
    variablesObj["btn"].classList.replace("bx-menu", "bx-menu-alt-right");
  } else {
    variablesObj["btn"].classList.replace("bx-menu-alt-right", "bx-menu");
  }
}

 // fetch create page (default page)


 

// fetch creator status 



 fetchPages("createEvent");

 document.getElementById("logOut").addEventListener("click", () => {
  signOut(auth).then(() => {
    alert("Logged out");
    localStorage.removeItem("userId");
    localStorage.removeItem("authStatus");
    localStorage.removeItem("roleCheck");
    localStorage.removeItem("creatorStatus");
    localStorage.removeItem("eventsObj");
    window.location.pathname = "/index.html";
  });
});