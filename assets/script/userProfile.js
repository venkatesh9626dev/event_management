import { auth } from "./config.js";


import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

onAuthStateChanged(auth,(user)=>{
  if(!user && window.location.pathname == "/pages/creatorAuth.html"){
    window.location.replace("/index.html")
  }
})