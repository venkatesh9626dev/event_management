import { categoryColors } from "./constant.js";
import { auth } from "./config.js";

import { formatTime,expiryCheck } from "./constant.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname == "/pages/myEvents.html") {
    window.location.replace("/index.html");
  }
});

let eventsObject = JSON.parse(localStorage.getItem("eventsObject"));
let myEventsObj = JSON.parse(localStorage.getItem("myEventsObj"));

sessionStorage.setItem("currentPage", "createdEvents");

let variablesObj = {};

document.querySelectorAll("[id]").forEach((element) => {
  variablesObj[element.id] = element;
});

//fetching events

function fetchEvents() {
  let eventCount = 0;
  for (let event in myEventsObj) {
    let eventDate = eventsObject[event]["generalInfo"]["eventDate"];
    let eventTime = eventsObject[event]["generalInfo"]["eventTime"];
    let notExpired = expiryCheck(eventDate, eventTime);
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
    const category = myEventsObj[event]["category"];
    const categoryDetails = eventsObject[event]["subCategory"];
    
    contentBox.innerHTML = `
    
    <div class = "imgContainer">
        <img src="${
          eventDetails.eventPoster
        }" alt="Image description" class="eventPoster">
    </div>
    <div class = "contentArea itemsGap" >
    <h3 class = "eventName itemsGap">${eventDetails.eventName}</h3>
    <div class = "date itemsGap">
        <i class="fas fa-calendar-alt"></i>
        <div class="dateDetails">
            <span class = "eventDate">${notExpired[1][1]}</span>
            <span class="eventTime">${notExpired[1][0] || "N/A"}</span>
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
    <div class = "buttons itemsGap">
       
      <a id="viewMoreBtn" class="primaryBtn topBtn" href ="/pages/moreDetails.html?eventId=${encodeURIComponent(eventDetails.eventId)}&eventTime=${notExpired[1][0]}&eventDate=${notExpired[1][1]}"  class="secondaryBtn">View event details</a>
      <button class="secondaryBtn topBtn" onclick='fetchSubCategoryDetails(${JSON.stringify(category)},${JSON.stringify(categoryDetails)})'>View my details</button>
      <button class="messageBtn" onclick = 'fetchMessages(${JSON.stringify(event)})'>View Message</button>
    </div>
    <div class = "eventCategory" style =" color:white ;background-color:${catColor}">${
      eventDetails.category
    }</div>
    
    `;

    if (notExpired[0] === "upcoming") {
      variablesObj["upcomingEvents"].appendChild(contentBox);
      let clonedBox = contentBox.cloneNode(true);

      variablesObj["allEvents"].appendChild(clonedBox);
      eventCount++;

    } else {
      variablesObj["pastEvents"].appendChild(contentBox);
      let clonedBox = contentBox.cloneNode(true);

      variablesObj["allEvents"].appendChild(clonedBox);
      eventCount++;
    }
  }
  if(eventCount === 0) variablesObj["allEvents"].textContent = "There are no events created";
  document.querySelector(".blurbackground").remove()
}

// past events check



// event listeners for filter

variablesObj["allBtn"].addEventListener("click", () => {
  variablesObj["allEvents"].style.display = "flex";
  variablesObj["upcomingEvents"].style.display = "none";
  variablesObj["pastEvents"].style.display = "none";
  if (variablesObj["allEvents"].textContent.trim() == "") {
    variablesObj["allEvents"].textContent = "There are no events created";
  }
});

variablesObj["upcomingBtn"].addEventListener("click", () => {
  variablesObj["allEvents"].style.display = "none";
  variablesObj["upcomingEvents"].style.display = "flex";
  variablesObj["pastEvents"].style.display = "none";
  if (variablesObj["upcomingEvents"].textContent.trim() == "") {
    variablesObj["upcomingEvents"].textContent = "There are no upcoming events";
  }
});

variablesObj["pastBtn"].addEventListener("click", () => {
  variablesObj["allEvents"].style.display = "none";
  variablesObj["upcomingEvents"].style.display = "none";
  variablesObj["pastEvents"].style.display = "flex";

  if (variablesObj["pastEvents"].textContent.trim() == "") {
    variablesObj["pastEvents"].textContent = "There are no past events";
  }
});

// event listener for back buttons

variablesObj["subCatBtn"].addEventListener("click", () => {
  variablesObj["myEventHome"].style.display = "block";
  variablesObj["createdEventSub"].style.display = "none";
  variablesObj["categoryBox"].innerHTML = "";
});

// category container visible function

window.fetchSubCategoryDetails = (myEventsArr, subCatObj) => {
  let fragment = document.createDocumentFragment();
  for (let subcategory of myEventsArr) {
    let subCatItem = document.createElement("div");
    subCatItem.className = "subCatItems";

    subCatItem.innerHTML = `
      <div>
        <h3 class="smallHead">${
          subCatObj[subcategory]["subCatDetails"]["catName"]
        }</h3>
        <p>Number of participants : <span>${
          Object.keys(subCatObj[subcategory]["participantDetails"]).length
        } / ${subCatObj[subcategory]["subCatDetails"]["catSeats"]} </span></p>
        <p>Participator Type :  <span> ${
          subCatObj[subcategory]["subCatDetails"]["type"]
        }</span></p>
      </div>
    `;
    if (subCatObj[subcategory]["subCatDetails"]["type"] === "group") {
      let newPara = document.createElement("p");
      newPara.innerHTML = `Members per team : <span>${subCatObj[subcategory]["subCatDetails"]["members"]}</span>`;
      subCatItem.querySelector("div").appendChild(newPara);
    }
    fragment.appendChild(subCatItem);
  }
  variablesObj["categoryBox"].append(fragment);
  variablesObj["myEventHome"].style.display = "none";
  variablesObj["createdEventSub"].style.display = "block";
};

fetchEvents();
