import { categoryColors } from "./constant.js";
import { auth } from "./config.js";
import { eventsObject } from "./createEvent.js";
import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

onAuthStateChanged(auth,(user)=>{
  if(!user && window.location.pathname == "/pages/createdEvents.html"){
    window.location.replace("/index.html")
  }
})

sessionStorage.setItem("currentPage","createdEvents");


let variablesObj = {};

document.querySelectorAll("[id]").forEach((element)=>{
  variablesObj[element.id] = element
})

let authStatus = localStorage.getItem("creatorStatus");


async function authStatusCheck(authStatus){
  if(authStatus === "pending"){
    
    
    let newDiv = document.createElement("div");
    newDiv.textContent ="can only view after getting approval from the admin"
    newDiv.className="alert";
    document.getElementById("createdEventsContainer").classList.add("hidden");
    document.getElementById("dynamicContainer").appendChild(newDiv)
    
    
  }
  else if(authStatus === "empty" || authStatus === "rejected"){
    await fetchCreatorAuth();
  }
  
}

authStatusCheck(authStatus);

// style sheet fetch

function styleFetch(pageContent){
  let styleElement = document.createElement("link");
  styleElement.setAttribute("rel", "stylesheet");
  styleElement.setAttribute("href", `/assets/style/creatorAuth.css`);
  document.head.appendChild(styleElement);
  let page = document.createElement("div");
  page.innerHTML = pageContent;
  styleElement.onload = ()=>{
    document.getElementById("createdEventsContainer").classList.add("hidden");
    document.getElementById("dynamicContainer").appendChild(page)
  } 
}

// script fetch

function scriptFetch(){
  let scriptElement = document.createElement("script");
  scriptElement.setAttribute("src", `/assets/script/creatorAuth.js`);
  scriptElement.setAttribute("type", "module");
  scriptElement.setAttribute("id", `creatorAuth`);
  document.head.appendChild(scriptElement);   
}

// fetchCreatorAuth Page

async function fetchCreatorAuth(){

  let response = await fetch("/pages/creatorAuth.html");
  let page = await response.text();

  let isStyleExists = document.querySelector(
    `link[rel="stylesheet"][href="/assets/style/creatorAuth.css"]`
  );

  if(!isStyleExists){
    styleFetch();

  }
  else{
    document.getElementById("createdEventsContainer").classList.add("hidden");
    let pageContent = document.createElement("div");
    pageContent.innerHTML = page;
    document.getElementById("dynamicContainer").appendChild(pageContent);
  }

  let isScriptExists = document.querySelector(`script#creatorAuth`);

  if(!isScriptExists){
    scriptFetch();
  }
  else{
    isScriptExists.remove();
    scriptFetch()
  }
}


// fetching events

function fetchEvents(){
 for(let event in eventsObject){
  let eventDate = eventsObject[event]["generalInfo"]["eventDate"];
  let eventTime = eventsObject[event]["generalInfo"]["eventTime"];
  let notExpired = expiryCheck(eventDate,eventTime);
  let eventDetails = eventsObject[event]["generalInfo"];
  
 
  // category color
  let catColor =
            eventDetails.category === "Tech"
              ? categoryColors.tech
              : eventDetails.category === "Sports"
              ? categoryColors.Sports
              : eventDetails.category === "Culturals"
              ? categoryColors.Culturals
              : categoryColors.Education;

  // event box creation



  let contentBox = document.createElement("div");
    contentBox.classList.add("eventItems");
    contentBox.setAttribute("onclick",`fetchSubCategoryDetails("${eventDetails.eventId}")`)
    contentBox.innerHTML = `
    
    <div class = "imgContainer">
        <img src="${eventDetails.eventPoster}" alt="Image description" class="eventPoster">
    </div>
    <div class = "contentArea itemsGap" >
    <h3 class = "eventName itemsGap">${eventDetails.eventName}</h3>
    <div class = "date itemsGap">
        <i class="fas fa-calendar-alt"></i>
        <div class="dateDetails">
            <span class = "eventDate">${eventDetails.eventDate}</span>
            <span class="eventTime">${notExpired || "N/A"}</span>
        </div>
    </div>
    <div class = "location itemsGap">
       <i class="fa-solid fa-location-dot"></i>
       <span class = "eventAddress">${eventDetails.eventCity}</span>
    </div>
    <div class = "ticket itemsGap">
       <i class="fa-solid fa-ticket"></i>
       <span class = "eventTicket">${eventDetails.ticketType}</span>
    </div>
    <div class = "eventCategory" style =" color:white ;background-color:${catColor}">${eventDetails.category}</div>
    
    `;
    
  if(notExpired){
    variablesObj["upcomingEvents"].appendChild(contentBox);
    let clonedBox = contentBox.cloneNode(true);
    
    variablesObj["allEvents"].appendChild(clonedBox)

  }
  else{
    variablesObj["pastEvents"].appendChild(contentBox);
    let clonedBox = contentBox.cloneNode(true);
    
    variablesObj["allEvents"].appendChild(clonedBox)
  }
 }
 document.querySelector(".blurbackground").remove()
}

// past events check

function expiryCheck(eventDate, eventTime) {
  let currentDate = new Date();

  let [year, month, day] = eventDate.split("-").map(Number);
  let [hours, minutes] = eventTime.split(":").map(Number);
  let eventDateTime = new Date(year, month - 1, day, hours, minutes);
  if (eventDateTime > currentDate) {
    return formatTime([hours, minutes]);
  }

  return false;
}

// format time

function formatTime(time) {
  let timeUnit = time[0] >= 12 ? "PM" : "AM";
  let hours = time[0] % 12;
  let correctTime = hours ? `${hours}` : "12";

  return `${correctTime}:${time[1] || "00"} ${timeUnit}`;
}

// event listeners for filter

variablesObj["allBtn"].addEventListener("click",()=>{
  variablesObj["allEvents"].style.display = "flex";
  variablesObj["upcomingEvents"].style.display = "none";
  variablesObj["pastEvents"].style.display = "none";
  if(variablesObj["allEvents"].textContent.trim() == ""){
    variablesObj["allEvents"].textContent = "There are no events created";
  }
})

variablesObj["upcomingBtn"].addEventListener("click",()=>{
  variablesObj["allEvents"].style.display = "none";
  variablesObj["upcomingEvents"].style.display = "flex";
  variablesObj["pastEvents"].style.display = "none";
  if(variablesObj["upcomingEvents"].textContent.trim() == ""){
    variablesObj["upcomingEvents"].textContent = "There are no upcoming events";
  }
})

variablesObj["pastBtn"].addEventListener("click",()=>{
  variablesObj["allEvents"].style.display = "none";
  variablesObj["upcomingEvents"].style.display = "none";
  variablesObj["pastEvents"].style.display = "flex";

  if(variablesObj["pastEvents"].textContent.trim() == ""){
    variablesObj["pastEvents"].textContent = "There are no past events";
  }
})

// event listener for back buttons

variablesObj["subCatBtn"].addEventListener("click",()=>{
  variablesObj["createdEventHome"].style.display = "block";
  variablesObj["createdEventSub"].style.display = "none";
  variablesObj["categoryBox"].innerHTML = "";
})

variablesObj["participantDetailsBtn"].addEventListener("click",()=>{
  variablesObj["createdEventSub"].style.display = "block";
  variablesObj["createdEventDetails"].style.display = "none";
})

// participant details fetch

window.participantsDetailsFetch = (participantsArr)=>{

  


  const tableHeaders = Object.keys(participantsArr[0]);
  
  variablesObj["detailsBox"].innerHTML = `
    <table>
        <thead>
            <tr>
                ${tableHeaders.map(header => `<th>${header}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
            ${participantsArr.map(user => `
                <tr>
                    ${tableHeaders.map(key => `<td>${user[key]}</td>`).join("")}
                </tr>
            `).join("")}
        </tbody>
    </table>
`;

variablesObj["createdEventSub"].style.display = "none";
  variablesObj["createdEventDetails"].style.display = "block";
}

// category container visible function

window.fetchSubCategoryDetails = (eventId)=>{
  
  let eventObj = eventsObject[eventId]["subCategory"];
  
  console.log(eventObj);
  
  let fragment = document.createDocumentFragment()
  for(let subcategory in eventObj){
    let subCatItem = document.createElement("div");
    subCatItem.className = "subCatItems";
    
    subCatItem.innerHTML = `
      <div>
        <h3 class="smallHead">${eventObj[subcategory]["subCatDetails"]["catName"]}</h3>
        <p>Number of participants : <span>${Object.keys(eventObj[subcategory]["participantDetails"]).length} / ${eventObj[subcategory]["subCatDetails"]["catSeats"]} </span></p>
        <p>Participator Type :  <span> ${eventObj[subcategory]["subCatDetails"]["type"]}</span></p>
      </div>
      
      <button class = "secondaryBtn"  onclick='participantsDetailsFetch(${JSON.stringify(Object.values(eventObj[subcategory]["participantDetails"]))})' >View More</button>
    `
    if(eventObj[subcategory]["subCatDetails"]["type"] === "group"){
      let newPara = document.createElement("p")
      newPara.innerHTML = `Members per team : <span>${eventObj[subcategory]["subCatDetails"]["members"]}</span>`
      subCatItem.querySelector("div").appendChild(newPara)
    }
    fragment.appendChild(subCatItem);
    
  }
  variablesObj["categoryBox"].append(fragment);
  variablesObj["createdEventHome"].style.display = "none";
  variablesObj["createdEventSub"].style.display = "block";
console.log("loaded");

}




fetchEvents();


