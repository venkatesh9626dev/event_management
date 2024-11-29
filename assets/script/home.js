import { userInfo } from "./dashboard.js";
import {
  getDatabase,
  ref,
  child,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { auth } from "./config.js";

const db = getDatabase();

let userName = userInfo.displayName;
let displayUsername = document.getElementById("welcomeMsg");
displayUsername.textContent = `Welcome ${userName} 🥳🎉`;
let districtFilter = document.getElementById("districtFilter");
let categoryFilter = document.getElementById("categoryFilter");
let dynamicContainer = document.getElementById("dynamicContent");
let loadingContainer = document.getElementById("loadingGif");

fetch("../assets/json/district.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((element) => {
      let optionTag = document.createElement("option");
      optionTag.textContent = `${element}`;
      optionTag.value = `${element}`;
      districtFilter.appendChild(optionTag);
    });
  });

// fetching category filter

categoryFilter.addEventListener("change", () => {
  fetchEvents((eventDetails) => {
    return (
      categoryCheck(categoryFilter.value, eventDetails.category) &&
      expiryCheck(eventDetails.date) &&
      districtCheck(districtFilter.value,eventDetails.venueDistrict)
    );
  });
});

// while clicking district filter

districtFilter.addEventListener("change", () => {
    fetchEvents((eventDetails) => {
      return (
        categoryCheck(categoryFilter.value, eventDetails.category) &&
        expiryCheck(eventDetails.date) &&
        districtCheck(districtFilter.value,eventDetails.venueDistrict)
      );
    });
  });

// expiry date check

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

// category filter

function categoryCheck(selectedCategory, category) {
  if (selectedCategory === "All Category" ||selectedCategory === "") return true;
  return selectedCategory === category ? true : false;
}
// district Filter

function districtCheck(selectedDistrict,district){
  if (selectedDistrict === "All District"||selectedDistrict === "") return true;
  return selectedDistrict === district ? true : false;
}

// view more feature

window.knowMoreClick = async function (eventId){
  try{
    let dataFromEvent = await get(ref(db,`events/${eventId}/eventDetails_`));
    let eventDetails = await dataFromEvent.val();
    document.querySelector(".popDivFull").innerHTML=`
    
    <div id="viewMoreContent">
            <div id="viewMoreImgBox">
                <img src="${eventDetails.poster}" alt="">
                
            </div>
            <div class="viewMoreInfo">
              <div id="viewMoreBasicBox">
                  <h3 class="viewMoreName">${eventDetails.eventName}</h3>
                  <p class="viewMoreDesc">${eventDetails.description}</p>
                  <div class="viewMoreCategoryBox">
                      <p>Category</p>
                      <p id="viewMoreCategoryName">${eventDetails.category}</p>
                  </div>
              </div>
              <div class = "viewMoreDate">
                  <i class="fas fa-calendar-alt"></i>

                  <span>${eventDetails.date}</span>
                      
                
              </div>
              <div class="viewMoreTimeBox">
                  <i class="fa-solid fa-clock"></i>
                  <span class="eventTime">${eventDetails.startTime} to </span>
                  <span class="eventTime">${eventDetails.endTime}</span>
              </div>
              <div class = "viewMoreLocation">
                  <i class="fa-solid fa-location-dot"></i>
                  <div class="locationDetails">
                      <span >${eventDetails.venueDistrict}</span>
                  </div>
              </div>
              <div class="viewMoreAddress">
                  <i class="fa fa-address-card" aria-hidden="true"></i>
                  <p>${eventDetails.address}</p>
              </div>
            </div>
        </div>
    `
    document.querySelector("main").style.display = "none";
    document.querySelector("header").style.display = "none";
    document.querySelector(".popDivFull").style.display="block";
    document.querySelector(".popDivFull").insertAdjacentHTML("afterbegin",
      `<div class="popCloseBox">
        <button type="button" class="popUpBack">Back</button>
       </div>`
    )
    document.querySelector(".popUpBack").addEventListener("click",closePopUp);

    
    // making the height to popup container
    
  }
  catch(error){
    alert(error)
  }

}

// fetching the events from the firebase

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

// closing pop up

function closePopUp(){
  document.querySelector("main").style.display = "block";
    document.querySelector("header").style.display = "flex";
    document.querySelector(".popDivFull").style.display="none";
}

