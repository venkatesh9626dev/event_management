import { db } from "./config.js";
import { categoryColors } from "./constant.js";
import {
  getDatabase,
  ref,
  child,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

let userCurrentLocation = await userLocation();
 export let eventsObj;

function userLocation(){
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Extract latitude and longitude
        const { latitude, longitude } =  position.coords;
        
       
        
        resolve({latitude,longitude}) ;
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,  // Precise but consumes more power
        timeout: Infinity,           // Wait for max 10 seconds
        maximumAge: 0             // Always fetch a fresh location
      }
    )
  })
   
}



fetchEvents((eventDetails) => expiryCheck(eventDetails.eventDate,eventDetails.eventTime));

const topPicks = document.getElementById("topPicksBox")
const nearbyEvents = document.getElementById("nearbyEvents");

// fetching category filter

// categoryFilter.addEventListener("change", () => {
//   fetchEvents((eventDetails) => {
//     return (
//       categoryCheck(categoryFilter.value, eventDetails.category) &&
//       expiryCheck(eventDetails.date) &&
//       districtCheck(districtFilter.value, eventDetails.venueDistrict)
//     );
//   });
// });

// format time


function formatTime(time) {
  
  let timeUnit = time[0] >= 12 ? "PM" : "AM";
  let hours = time[0] % 12;
  let correctTime = hours ? `${hours}` : "12";

  return `${correctTime}:${time[1]} ${timeUnit}`;
}


// expiry date check

function expiryCheck(eventDate,eventTime) {
  let currentDate = new Date();
  
  let [year,month,day] = eventDate.split("-").map(Number);
  let [hours,minutes] = eventTime.split(":").map(Number);
  let eventDateTime = new Date(year, month - 1, day, hours, minutes)
  if (eventDateTime > currentDate){
    return formatTime([hours,minutes]);
  }
  
  return false;
}

// category filter

// function categoryCheck(selectedCategory, category) {
//   if (selectedCategory === "All Category" || selectedCategory === "")
//     return true;
//   return selectedCategory === category ? true : false;
// }


// view more feature

// window.knowMoreClick = async function (eventId) {
//   try {
//     let dataFromEvent = await get(ref(db, `events/${eventId}/eventDetails_`));
//     let eventDetails = await dataFromEvent.val();
//     document.querySelector(".popDivFull").innerHTML = `
    
//     <div id="viewMoreContent">
//             <div id="viewMoreImgBox">
//                 <img src="${eventDetails.poster}" alt="">
//                  <div class = "eventCategory">${eventDetails.category}</div>
//             </div>
//             <div class="viewMoreInfo">
//               <div id="viewMoreBasicBox">
//                   <h3 class="viewMoreName">${eventDetails.eventName}</h3>
//                   <p class="viewMoreDesc">${eventDetails.description}</p>
                  
//               </div>
//               <div class = "viewMoreDate">
//                   <i class="fas fa-calendar-alt"></i>

//                   <span>${eventDetails.date}</span>
                      
                
//               </div>
//               <div class="viewMoreTimeBox">
//                   <i class="fa-solid fa-clock"></i>
//                   <span class="">${eventDetails.startTime} to </span>
//                   <span class="">${eventDetails.endTime}</span>
//               </div>
//               <div class = "location">
//                 <i class="fa-solid fa-location-dot"></i>
//                 <span >${eventDetails.venueDistrict}</span>
//               </div>
//               <div class="viewMoreAddress">
//                   <i class="fa fa-address-card" aria-hidden="true"></i>
//                   <p>${eventDetails.address}</p>
//               </div>
//             </div>
           
//         </div>
//     `;
//     document.querySelector("main").style.display = "none";
//     document.querySelector("header").style.display = "none";
//     document.querySelector(".popDivFull").style.display = "block";
//     document.querySelector(".popDivFull").insertAdjacentHTML(
//       "afterbegin",
//       `<div class="popCloseBox">
//         <button type="button" class="popUpBack">Back</button>
//        </div>`
//     );
//     document.querySelector(".popUpBack").addEventListener("click", closePopUp);

//     // making the height to popup container
//   } catch (error) {
//     console.log(error);
//   }
// };

// user Location


// nearby events check

async function nearbyCheck(coords){
  const radius = 40000;
 
  let eventCoords = {"latitude" : coords["lat"],"longitude" : coords["lng"]}
  const distance = await geolib.getDistance(userCurrentLocation, eventCoords);
  console.log([eventCoords,userCurrentLocation,distance]);
  
 return distance <= radius;
}


// fetching the events from the firebase

async function fetchEvents(callBack) {
  try {
    
   
    let nearbyEventsBox = document.createElement("div");
    nearbyEventsBox.id = "nearbyEventsBox";
    nearbyEventsBox.style.width = "100%";

    let commonEvents = document.createElement("div");
    commonEvents.id = "currentEventContainer";
    commonEvents.style.width = "100%";
    let dbRef = ref(db, "events");
    let eventsSnapshot = await get(dbRef);

    let eventsList = eventsSnapshot.val();
    eventsObj = eventsList;

    for (let event in eventsList) {
      let eventDetails = eventsList[event].generalInfo;

      let isValidEvent = callBack(eventDetails);

      if (isValidEvent) {
        let catColor = eventDetails.category === "Tech" ? categoryColors.tech 
                                                        : eventDetails.category === "Sports" ? categoryColors.Sports
                                                        : eventDetails.category === "Culturals" ? categoryColors.Culturals
                                                        :categoryColors.Education;
        
        let contentBox = document.createElement("div");
        contentBox.classList.add("currentEventItems");
        contentBox.setAttribute("onclick",`knowMoreClick('${eventDetails.eventId}')`)
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
                <span class="eventTime">${isValidEvent}</span>
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
        <button id="joinBtn" class="primaryBtn">Register Now</button>
        <button id="viewMoreBtn" class="secondaryBtn">View More</button>
        </div>
        <div class = "eventCategory" style = "background-color : ${catColor};">${eventDetails.category}</div>
        
        `;
        
        
        let toAppend = await  nearbyCheck(eventDetails.coords);
        
        if(toAppend){
          nearbyEventsBox.appendChild(contentBox)
        }
        else{
          commonEvents.appendChild(contentBox);
        }
      }
    }
    document.querySelectorAll(".skeletonBox").forEach((element)=>{
      element.remove()
    })
    nearbyEvents.appendChild(nearbyEventsBox)
    topPicks.appendChild(commonEvents);
    
  
  } catch (error) {
    console.error(error);
  }
}



// closing pop up

function closePopUp() {
  document.querySelector("main").style.display = "block";
  document.querySelector("header").style.display = "flex";
  document.querySelector(".popDivFull").style.display = "none";
}


