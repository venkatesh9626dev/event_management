import { db ,auth} from "./config.js";
import {
  ref,
  child,
  set,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

onAuthStateChanged(auth,(user)=>{
  if(!user && window.location.pathname == "/pages/choose.html"){
    window.location.replace("/index.html")
  }
  else{
    let check = JSON.parse(localStorage.getItem("roleCheck"))
    if(check){
      window.location.replace("/pages/home.html")
    }
  }
})

function showCreatorAuthenticationPage() {
  // Select the container to apply the blur effect
  const container = document.querySelector(".container");
  container.classList.add("blurred-background");

  // Fetch the Creator Authentication HTML dynamically
  fetch("/pages/creatorAuth.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load creator authentication page.");
      }
      return response.text();
    })
    .then((html) => {
      // Create a popup container to hold the fetched HTML
      const popup = document.createElement("div");
      popup.classList.add("popup");
      popup.innerHTML = html;

      // Append the popup to the body
      document.body.appendChild(popup);

      // Dynamically load the Creator Authentication CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/assets/style/creatorAuth.css";
      document.head.appendChild(link);
      popup.style.display = "block";

      // Dynamically load the Creator Authentication JavaScript
     
        const script = document.createElement("script");
        script.type = "module";
        script.dataset.dynamic = "true";
        script.src = "../assets/script/creatorAuth.js";

        document.head.appendChild(script);

      
        
      // Display the popup
      

      // Optional: Close the popup on clicking outside
      popup.addEventListener("click", (event) => {
        if (event.target === popup) {
          document.body.removeChild(popup);
          container.classList.remove("blurred-background");
        }
      });
    })
    .catch((err) => {
      console.error("Error loading creator authentication page:", err);
    });
}

// Event Listeners for Creator and Participator Cards
document.getElementById("experience-card").addEventListener("click", () => {
  handleSelection("participator");
});

document.getElementById("organize-card").addEventListener("click", () => {
  handleSelection("creator");
});

function handleSelection(userType) {
  // Dummy authentication simulation

  if (userType === "creator") {
    showCreatorAuthenticationPage();
  } else if (userType === "participator") {
    let userId = JSON.parse(localStorage.getItem("userId"))
    let dRef = ref(db,`users/userDetails/${userId}/check/roleCheck`)
    update(dRef,{"roleStatus" : true})
    .then(()=>{
        
        let userRef = ref(db, `users/userDetails/${userId}/check/creatorCheck`);
        update(userRef,{"checkStatus" : "empty"})
        .then(()=> window.location.href = "/pages/home.html")
        
      })
    
  }
}
