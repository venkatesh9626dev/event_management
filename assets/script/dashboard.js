import { auth,db} from "./config.js";

import { onAuthStateChanged ,signOut} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  ref, push, onChildAdded, query, orderByChild,off
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

let userId = JSON.parse(localStorage.getItem("userId"));
let userName = localStorage.getItem("userName");

const messageList = document.getElementById("messageList");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.querySelector(".sendButton");
const messageBackBtn = document.querySelector("#messageBackBtn");

// create event page  fetch  listener

variablesObj["createEventBtn"].addEventListener("click",()=>{
  fetchPages("createEvent");
  let newListener = new Event("click");
  messageBackBtn.dispatchEvent(newListener)

});
variablesObj["createdBtn"].addEventListener("click",()=>{
  fetchPages("createdEvents");
  let newListener = new Event("click");
  messageBackBtn.dispatchEvent(newListener)
  
} )
variablesObj["myEventsBtn"].addEventListener("click",()=> {
  fetchPages("myEvents");
  let newListener = new Event("click");
  messageBackBtn.dispatchEvent(newListener);
});
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
      styleElement.onload = ()=> {
        variablesObj["dynamicContainer"].innerHTML = pageContent;
        addScript(pageName)
      }
    }
    else{
      variablesObj["dynamicContainer"].innerHTML = pageContent;
      addScript(pageName);

    }

    

    
  } catch (error) {
    console.error("Error loading the page or assets:", error);
  }
};


// script adding function

function addScript(pageName){
  let isScriptExists = document.querySelector(`script#${pageName}`);

    // Add JS dynamically

    if (!isScriptExists) {
      let scriptElement = document.createElement("script");
      scriptElement.setAttribute("src", `/assets/script/${pageName}.js?timestamp=${Date.now()}`);
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
    
}

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
    localStorage.removeItem("userName");
    sessionStorage.removeItem("currentPage");
    window.location.pathname = "/index.html";
  });
});


// message feature functions


// Add new message to the UI
async function addMessage(content,eventId) {

  
if (content.trim() === "") return; // Ignore empty messages

sendMessageBtn.innerHTML = `<i class="fa fa-spinner fa-spin"></i>`

let dbRef = ref(db,`messages/${eventId}`)
let dataObj = {content : content,messagerId : userId,messagerName : userName,timestamp : Date.now()}
await push(dbRef,dataObj)
sendMessageBtn.textContent = "Send message";
// Clear the input field
messageInput.value = "";
}

sendMessageBtn.addEventListener("click", (e) => {
addMessage(messageInput.value,e.target.id);
});

// Allow pressing "Enter" to send the message
messageInput.addEventListener("keypress", (e) => {
if (e.key === "Enter") {
    addMessage(messageInput.value,sendMessageBtn.id);
}
});


// this function called globally for created and participated events
 window.fetchMessages = function (eventId){

  
  sendMessageBtn.id= eventId;
  let dbRef = ref(db,`messages/${eventId}`);
  let queryRef = query(dbRef, orderByChild("timestamp"));


  onChildAdded(queryRef, (snapshot) => {
    const message = snapshot.val();
    renderMessage(message);
  });

  variablesObj["dynamicContainer"].style.display = "none";
  variablesObj["chatContainer"].style.display = "flex"

  // adding back button listener

  messageBackBtn.addEventListener("click",(e)=>{
    variablesObj["dynamicContainer"].style.display = "block";
    variablesObj["chatContainer"].style.display = "none"
    variablesObj["messageList"].innerHTML = "";
    sendMessageBtn.id = "";
    off(queryRef); 
  })
}

function renderMessage(messageObj){
  let {content,messagerId,messagerName,timestamp} = messageObj;

  let options = { weekday: 'long', day: 'numeric', month: 'long',hour: '2-digit',minute: '2-digit',second: '2-digit', hour12: true };
  let dateObj = new Date(timestamp)
  let formatDate = new Intl.DateTimeFormat('en-US', options).format(dateObj);


  const messageDiv = document.createElement("div");
  messageDiv.innerHTML =`
    <p>User Name : <span class = "messageContent"> ${messagerName}</span></p>
    <p>Message : <span class = "messageContent"> ${content}</span></p>
    <p>Date & Time : <span class = "messageContent"> ${formatDate}</span></p>
  `
  if(messagerId === userId) messageDiv.classList.add("myMessage")
  messageList.appendChild(messageDiv);

  // Scroll to the bottom when a new message is added
  messageList.scrollTop = messageList.scrollHeight;

}

