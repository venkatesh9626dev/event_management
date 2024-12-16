import { auth,db } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
onAuthStateChanged(auth, (user) => {
  if (user) {
    setTimeout(async () => {
      let dRef = await ref(db, `users/userDetails/${user.uid}/check/roleCheck`);
      let response = await get(dRef);
      let roleStatus = await response.val();
      if (
        localStorage.getItem("isAdmin") &&
        window.location.pathname !== "/pages/admin.html"
      ) {
        window.location.replace("/pages/admin.html");
      } else if (window.location.pathname == "/pages/admin.html") {
        return;
      } else if (
        roleStatus &&
        window.location.pathname !== "/pages/dashboard.html"
      ) {
        window.location.replace("/pages/home.html");
      } else if (!roleStatus) {
        localStorage.setItem("userId", JSON.stringify(`${user.uid}`));
        window.location.replace("/pages/choose.html");
      }
    }, 0);
  } else {
    if (window.location.pathname !== "/index.html") {
      window.location.pathname = "/index.html";
    }
  }
});
