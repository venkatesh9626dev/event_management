import { auth} from "./config.js";
import { userInfo } from "./dashboard.js";
import {
  getDatabase,
  ref,
  child,
  set,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

const db = getDatabase();

// inserting option tags

let selectTag = document.getElementById("eventDistrict");

fetch("../assets/json/district.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((element) => {
      let optionTag = document.createElement("option");
      optionTag.textContent = `${element}`;
      optionTag.value = `${element}`;
      selectTag.appendChild(optionTag);
    });
  });

// rough functions without any error check on input fields

// create event input field variables

let createForm = document.getElementById("createEventForm")
let eventNameInput = document.getElementById("eventName");
let eventOrganizerInput = document.getElementById("eventOrganizer");
let eventCategoryInput = document.getElementById("createCategory");
let eventPosterInput = document.getElementById("fileUpload");
let eventDateInput = document.getElementById("eventDate");
let eventStartInput = document.getElementById("startTime");
let eventEndInput = document.getElementById("endTime");
let eventDistrictInput = document.getElementById("eventDistrict");
let eventVenueInput = document.getElementById("eventVenue");
let eventAddressInput = document.getElementById("eventAddress");
let eventDescriptionInput = document.getElementById("eventDesc");
let createEventBtn = document.getElementById("createEventBtn");






createEventBtn.addEventListener("click", async () => {
  try{
    let randomId = crypto.randomUUID();
  
    let userRef = ref(db, `events/${randomId}`);
    let data = {
      eventDetails_: {
        date: eventDateInput.value,
        randomId: randomId,
        eventName: eventNameInput.value,
        organizer: eventOrganizerInput.value,
        category: eventCategoryInput.value,
        poster: eventPosterInput.value,
        description: eventDescriptionInput.value,
        startTime: eventStartInput.value,
        endTime: eventEndInput.value,
        venueName: eventVenueInput.value,
        venueDistrict: eventDistrictInput.value,
        address: eventAddressInput.value,
      }
  };
  await update(userRef,data)
  alert("event created successfully");
  createForm.reset();
  let userDbRef = ref(db,`users/userDetails/${userInfo.uid}/createdEvents`);
  let IdData = {
    [randomId] : randomId
  }  
  await update(userDbRef,IdData)
}
catch(error){
  alert(error)
}
  
});
