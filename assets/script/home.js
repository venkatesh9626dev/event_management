import { db } from "./config.js";
import {
  getDatabase,
  ref,
  child,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

let userCurrentLocation = await userLocation();

fetchEvents((eventDetails) => expiryCheck(eventDetails.eventDate));

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

// while clicking district filter


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

function userLocation(){
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Extract latitude and longitude
        const { latitude, longitude } =  position.coords;
        resolve({latitude,longitude}) ;
      }
    )
  })
   
}
// nearby events check

async function nearbyCheck(coords){
  const radius = 10000;
  let userCoords = userCurrentLocation;
  const distance = await geolib.getDistance(userCoords, coords);

  console.log(distance <= radius)
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

    for (let event in eventsList) {
      let eventDetails = eventsList[event].generalInfo;

      let isValidEvent = callBack(eventDetails);

      if (isValidEvent) {
        let posterImage =
          eventDetails.eventPoster === ""
            ? "https://thumbs.dreamstime.com/b/web-324671699.jpg"
            : eventDetails.eventPoster;
        let contentBox = document.createElement("div");
        contentBox.classList.add("currentEventItems");
        contentBox.setAttribute("onclick",`knowMoreClick('${eventDetails.eventId}')`)
        contentBox.innerHTML = `
        
        <div class = "imgContainer">
            <img src="${posterImage}" alt="Image description" class="eventPoster">
        </div>
        <div class = "contentArea">
        <h3 class = "eventName">${eventDetails.eventName}</h3>
        <div class = "date">
            <i class="fas fa-calendar-alt"></i>
            <div class="dateDetails">
                <span class = "eventDate">${eventDetails.eventDate}</span>
                <span class="eventTime">${eventDetails.eventTime}</span>
            </div>
        </div>
        <div class = "location">
           <i class="fa-solid fa-location-dot"></i>
           <span >${eventDetails.eventAddress}</span>
        </div>
        
        </div>
        <div class = "eventCategory">${eventDetails.category}</div>
        
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
