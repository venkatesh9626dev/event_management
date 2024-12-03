import { getDatabase, ref,child, set , get} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { userInfo } from "./dashboard.js";


let db = getDatabase();

// variables

let dynamicContainer = document.getElementById("eventsContainer")

// fetching events from database

async function fetchEvents() {
    try {
      dynamicContainer.innerHTML = "";
      let eventBox = document.createElement("div");
      eventBox.id = "currentEventContainer";
      eventBox.style.width = "100%";
      let dbRef = ref(db, `users/userDetails/${userInfo.uid}/createdEvents`);
      let eventsId = await get(dbRef);
      
      let eventsList = eventsId.val();
      
      for (let event in eventsList) {
        let eventRef = await ref(db, `events/${event}/eventDetails_`);
        let eventResponse = await get(eventRef);
        let eventDetails = eventResponse.val();
        let posterImage = eventDetails.poster === "" ? "https://thumbs.dreamstime.com/b/web-324671699.jpg" : eventDetails.poster;
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
                <span >${eventDetails.date}</span>
                <span class="eventTime">${eventDetails.startTime}</span>
            </div>
        </div>
        <div class = "location">
        <i class="fa-solid fa-location-dot"></i>
        <div class="locationDetails">
            <span >${eventDetails.venueDistrict}</span>
        </div>
        </div>
        <button  onclick="knowMoreClick('${eventDetails.randomId}')" class = "knowBtn">To Know More</button>
        <button  onclick="viewRecord('${eventDetails.randomId}')" class = "joinBtn">View Record</button>
        </div>
        <div class = "eventCategory">${eventDetails.category}</div>
        
        `;
        eventBox.appendChild(contentBox);
    }
    dynamicContainer.appendChild(eventBox);
    
    
    } 
    catch (error) {
        console.log(error)
      alert(`${error}`);
    }
  
}
fetchEvents();