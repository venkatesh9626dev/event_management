import {ref,get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

import { db } from "./config.js";



let dynamicContainer = document.getElementById("nearbyEvents");

// expiry check 

function expiryCheck(eventDate) {
    let currentDate = new Date();
  
    let dateArr = eventDate.split("-");
  
    if (Number(dateArr[0]) < currentDate.getFullYear()) {
      return false;
    } else if (Number(dateArr[1]) < currentDate.getMonth() + 1) {
      return false;
    } else if (
      Number(dateArr[1]) === currentDate.getMonth() + 1 &&
      Number(dateArr[2]) < currentDate.getDate()
    ) {
      return false;
    }
  
    return true;
  }

  
async function fetchEvents(callBack) {
    try {
      dynamicContainer.innerHTML = "";
      let eventBox = document.createElement("div");
      eventBox.id = "currentEventContainer";
      eventBox.style.width = "100%";
      let dbRef = ref(db, "events");
      let eventsSnapshot = await get(dbRef);
  
      let eventsList = eventsSnapshot.val();
  
      for (let event in eventsList) {
        let eventDetails = eventsList[event].eventDetails_;
  
        let isValidEvent = callBack(eventDetails);
  
        if (isValidEvent) {
          let posterImage =
            eventDetails.poster === ""
              ? "https://thumbs.dreamstime.com/b/web-324671699.jpg"
              : eventDetails.poster;
          let contentBox = document.createElement("div");
          contentBox.classList.add("currentEventItems");
          contentBox.innerHTML = `
          
          <div class = "imgContainer">
              <img src="${posterImage}" alt="Image description" class="eventPoster">
          </div>
          <div class = "contentArea">
          <h3 class = "eventName">${eventDetails.eventName}</h3>
          <div class = "date">
              <i class="fas fa-calendar-alt"></i>
              <div class="dateDetails">
                  <span class = "eventDate">${eventDetails.date}</span>
                  <span class="eventTime">${eventDetails.startTime}</span>
              </div>
          </div>
          <div class = "location">
             <i class="fa-solid fa-location-dot"></i>
             <span >${eventDetails.venueDistrict}</span>
          </div>
          <button  onclick="knowMoreClick('${eventDetails.randomId}')" class = "knowBtn">To Know More</button>
          <button  onclick="participateClick('${eventDetails.randomId}')" class = "joinBtn">Join The Event</button>
          </div>
          <div class = "eventCategory">${eventDetails.category}</div>
          
          `;
          eventBox.appendChild(contentBox);
        }
      }
  
      dynamicContainer.appendChild(eventBox);
    } catch (error) {
      alert(`${error}`);
    }
  }
  
  fetchEvents((eventDetails) => expiryCheck(eventDetails.date));