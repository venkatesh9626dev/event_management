import { db, auth } from "./config.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  ref,
  update,
  get,
  set
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

let variablesObj = {};
let requestObj = {};
let usersObj = {};

document.querySelectorAll("[id]").forEach((element) => {
  variablesObj[element.id] = element;
});

//  signOut listener

variablesObj["logOut"].addEventListener("click", () => {
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

// nav listeners

variablesObj["homeBtn"].addEventListener("click", () => {
  variablesObj["mainContainer"].style.display = "block";
  variablesObj["pendingApproval"].style.display = "none";
  variablesObj["approvedUsers"].style.display = "none";
  variablesObj["rejectedUsers"].style.display = "none";
});

variablesObj["pendingApprovalBtn"].addEventListener("click", () => {
  variablesObj["mainContainer"].style.display = "none";
  variablesObj["pendingApproval"].style.display = "block";
  variablesObj["approvedUsers"].style.display = "none";
  variablesObj["rejectedUsers"].style.display = "none";
});

variablesObj["approvedUsersBtn"].addEventListener("click", () => {
  variablesObj["mainContainer"].style.display = "none";
  variablesObj["pendingApproval"].style.display = "none";
  variablesObj["approvedUsers"].style.display = "block";
  variablesObj["rejectedUsers"].style.display = "none";
});

variablesObj["rejectedUsersBtn"].addEventListener("click", () => {
  variablesObj["mainContainer"].style.display = "none";
  variablesObj["pendingApproval"].style.display = "none";
  variablesObj["approvedUsers"].style.display = "none";
  variablesObj["rejectedUsers"].style.display = "block";
});

function loader() {
  let loader = document.createElement("div");
  loader.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin" style = "font-size: 40px;"></i>';
  loader.classList.add("blurbackground");
  variablesObj["dynamicContainer"].appendChild(loader);
}

// getting data from firebase

async function getFireBaseData() {
  let requestRef = ref(db, "admin/request");

  let requestData = await get(requestRef);

  requestObj = requestData.val();

  renderUi(requestObj);
}

// make elements to render

function renderUi(requestObj) {
  // reset box
  variablesObj["pendingBox"].textContent = "";
  variablesObj["approvedBox"].textContent = "";
  variablesObj["rejectedBox"].textContent = "";

  let userDataObj = {
    totalUsers: 0,
    totalCreators: 0,
    totalRequest: 0,
    approvedRequest: 0,
    pendingRequest: 0,
    rejectedRequest: 0,
  };

  for (let userId in requestObj) {
    let userStatus = requestObj[userId]["status"];

    if (userStatus === "pending") {
      let newDiv = document.createElement("div");
      newDiv.classList.add("smallBox");
      newDiv.textContent = requestObj[userId]["collegeName"];
      variablesObj["pendingBox"].appendChild(newDiv);
      userDataObj["pendingRequest"]++;
      userDataObj["totalRequest"]++;

      newDiv.addEventListener("click", () => viewMore(userId, "pending"));
    } else if (userStatus === "approved") {
      let newDiv = document.createElement("div");
      newDiv.classList.add("smallBox");
      newDiv.textContent = requestObj[userId]["collegeName"];
      variablesObj["approvedBox"].appendChild(newDiv);
      userDataObj["approvedRequest"]++;
      userDataObj["totalCreators"]++;
      userDataObj["totalRequest"]++;
      newDiv.addEventListener("click", () => viewMore(userId, "approved"));
    } else if (userStatus === "rejected") {
      let newDiv = document.createElement("div");
      newDiv.classList.add("smallBox");
      newDiv.textContent = requestObj[userId]["collegeName"];
      variablesObj["rejectedBox"].appendChild(newDiv);
      userDataObj["rejectedRequest"]++;
      userDataObj["totalRequest"]++;
      newDiv.addEventListener("click", () => viewMore(userId, "rejected"));
    }
  }
  variablesObj[
    "totalUsers"
  ].textContent = `Number of users : ${userDataObj["totalUsers"]}`;
  variablesObj[
    "totalCreators"
  ].textContent = `Number of creators :${userDataObj["totalCreators"]}`;
  variablesObj[
    "totalRequest"
  ].textContent = `Number of approval request : ${userDataObj["totalRequest"]}`;
  variablesObj[
    "approvedRequest"
  ].textContent = `Number of approved creators : ${userDataObj["approvedRequest"]}`;
  variablesObj[
    "pendingRequest"
  ].textContent = `Number of pending request ${userDataObj["pendingRequest"]}`;
  variablesObj[
    "rejectedRequest"
  ].textContent = `Number of rejected request : ${userDataObj["rejectedRequest"]}`;

  document.querySelector(".blurbackground").remove();
}

function viewMore(userId, state) {
  let collegeName = requestObj[userId]["collegeName"];
  let collegeId = requestObj[userId]["CollegeId"];
  let idPhoto = requestObj[userId]["collegeIdPhoto"];
  generatePopUp(userId, collegeName, collegeId, idPhoto, state);
}

function generatePopUp(userId, collegeName, collegeId, idPhoto, state) {
  if (state === "pending") {
    variablesObj["idPhoto"].src = idPhoto;
    variablesObj["collegeName"].textContent = `College Name : ${collegeName}`;
    variablesObj["collegeId"].textContent = `College Id : ${collegeId}`;

    let confirmBtnExists = document.querySelector("button#confirm");
    let rejectBtnExist = document.querySelector("button#reject");
    if (confirmBtnExists && rejectBtnExist) {
      confirmBtnExists.remove();
      rejectBtnExist.remove();
      let confirmBtn = document.createElement("button");
      confirmBtn.className = "primaryBtn";
      confirmBtn.textContent = "Confirm Approval";
      confirmBtn.addEventListener("click", () =>
        updateApproval(userId, "approved")
      );

      let rejectBtn = document.createElement("button");
      rejectBtn.className = "secondaryBtn";
      rejectBtn.textContent = "Reject Approval";
      rejectBtn.addEventListener("click", () =>
        updateApproval(userId, "rejected")
      );

      variablesObj["contentBox"].appendChild(confirmBtn);
      variablesObj["contentBox"].appendChild(rejectBtn);
    }
    else{
        let confirmBtn = document.createElement("button");
      confirmBtn.className = "primaryBtn";
      confirmBtn.id = "confirmBtn"
      confirmBtn.textContent = "Confirm Approval";
      confirmBtn.addEventListener("click", () =>
        updateApproval(userId, "approved",collegeName)
      );

      let rejectBtn = document.createElement("button");
      rejectBtn.className = "secondaryBtn";
      rejectBtn.id = "rejectBtn"

      rejectBtn.textContent = "Reject Approval";
      rejectBtn.addEventListener("click", () =>
        updateApproval(userId, "rejected",collegeName)
      );

      variablesObj["contentBox"].appendChild(confirmBtn);
      variablesObj["contentBox"].appendChild(rejectBtn);
    }

    variablesObj["detailsPopUp"].className = "show";
    console.log(variablesObj["detailsPopUp"]);
  } else {
    variablesObj["idPhoto"].src = idPhoto;
    variablesObj["collegeName"].textContent = `College Name : ${collegeName}`;
    variablesObj["collegeId"].textContent = `College Id : ${collegeId}`;
    variablesObj["detailsPopUp"].className = "show";
  }
}

async function updateApproval(userId, state,collegeName) {
  loader();
  let userDbRef = ref(db, `users/userDetails/${userId}/check/creatorCheck`);
  let userdata = state ==="approved" ? { checkStatus: state,collegeName : collegeName } : { checkStatus: state};
  let requestRef = ref(db, `admin/request/${userId}`);
  let requestData = { status: state };
  await set(userDbRef, userdata);
  await update(requestRef, requestData);
  await getFireBaseData();
  variablesObj["successPopUp"].classList.add("successShow");

  setTimeout(() => {
    variablesObj["successPopUp"].classList.remove("successShow");
    popUpRemove();
  }, 2000);
}

let popUpRemove = () =>{
  variablesObj["detailsPopUp"].classList.remove("show");
  document.getElementById("confirmBtn").remove();
  document.getElementById("rejectBtn").remove();

};

variablesObj["backBtn"].addEventListener("click", popUpRemove);

loader();

getFireBaseData();
