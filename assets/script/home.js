import { db, auth } from "./config.js";
import { categoryColors, radius,expiryCheck,formatTime } from "./constant.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname == "/pages/home.html") {
    window.location.replace("/index.html");
  }
});

let mainElement = document.getElementById("mainContainer");
let userId = JSON.parse(localStorage.getItem("userId"));


const topPicks = document.getElementById("topPicksBox");
const nearbyEvents = document.getElementById("nearbyEvents");


let mainDetails = await Promise.all([
  userLocation(),
  checkCreatorStatus(userId),
  setUserName(userId),
  fetchEventsData(),
]);

let [userCurrentLocation,creatorStatus,userName,eventDetails] = mainDetails;




fetchEvents((eventDetails) =>{
  return expiryCheck(eventDetails.eventDate, eventDetails.eventTime)
},eventDetails
);

let localDataObj = {
  "userName" : userName,
  "creatorStatus" : creatorStatus,

}
setLocalStorage(localDataObj)

async function userLocation() {
  try {
    let location = await getLocation();
    return location;
  } catch (error) {
    if (error.code === error.PERMISSION_DENIED) {
      document.getElementById("nearbyEvents").innerHTML =
        "Give access to make nearby events visible";
    }
    return Promise.reject("Cant get coords")
  }
}

document.getElementById("logOut").addEventListener("click", () => {
  signOut(auth).then(() => {
    alert("Logged out");
    localStorage.removeItem("userId");
    localStorage.removeItem("userMail");
    localStorage.removeItem("authStatus");
    localStorage.removeItem("roleCheck");
    localStorage.removeItem("creatorStatus");
    localStorage.removeItem("eventsObj");
    localStorage.removeItem("userName");
    localStorage.removeItem("myEventsObj");
    localStorage.removeItem("createdEventsObj");
    sessionStorage.removeItem("currentPage");
    window.location.pathname = "/index.html";
  });
});

// get location of the user
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Extract latitude and longitude
        const { latitude, longitude } = position.coords;

        resolve({ latitude, longitude });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true, // Precise but consumes more power
        timeout: Infinity, // Wait for max 10 seconds
        maximumAge: 0, // Always fetch a fresh location
      }
    );
  });
}


// nearby events check

function nearbyCheck(coords) {
  let eventCoords = { latitude: coords["lat"], longitude: coords["lng"] };
  const distance = geolib.getDistance(userCurrentLocation, eventCoords);

  return distance <= radius;
}

// get event details from the firebase

async function fetchEventsData() {
  let dbRef = ref(db, "events");
  let eventsSnapshot = await get(dbRef);

  let eventsList = eventsSnapshot.val();

  localStorage.setItem("eventsObj", JSON.stringify(eventsList));

  return eventsList;
}

// fetching the events from the firebase

function fetchEvents(callBack,eventsList) {
 
    let nearbyEventsBox = document.createElement("div");
    nearbyEventsBox.id = "nearbyEventsBox";
    nearbyEventsBox.style.width = "100%";

    let commonEvents = document.createElement("div");
    commonEvents.id = "currentEventContainer";
    commonEvents.style.width = "100%";

    let nearByCount = 0;
    for (let event in eventsList) {
      let eventDetails = eventsList[event].generalInfo;

      let isValidEvent = callBack(eventDetails);


      if (isValidEvent[0] === "upcoming") {
        let catColor =
          eventDetails.category === "Tech"
            ? categoryColors.tech
            : eventDetails.category === "Sports"
            ? categoryColors.Sports
            : eventDetails.category === "Culturals"
            ? categoryColors.Culturals
            : categoryColors.Education;

        let contentBox = document.createElement("div");
        contentBox.classList.add("currentEventItems");

        contentBox.innerHTML = `
        
        <div class = "imgContainer">
            <img src="${eventDetails.eventPoster}" alt="Image description" class="eventPoster">
        </div>
        <div class = "contentArea itemsGap" >
        <h3 class = "eventName itemsGap">${eventDetails.eventName}</h3>
        <div class = "date itemsGap">
            <i class="fas fa-calendar-alt"></i>
            <div class="dateDetails">
                <span class = "eventDate">${isValidEvent[1]}</span>
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
        contentBox.addEventListener("click", () => {
          window.location.href = `/pages/moreDetails.html?eventId=${encodeURIComponent(
            eventDetails.eventId
          )}&eventTime=${isValidEvent[0]}&eventDate=${isValidEvent[1]}`;
        });
        let toAppend = null;
        if (userCurrentLocation) {
          toAppend =  nearbyCheck(eventDetails.coords);
        }

        if (toAppend) {
          nearbyEventsBox.appendChild(contentBox);
          nearByCount++;
        } else {
          commonEvents.appendChild(contentBox);
        }
      }
    }
    document.querySelectorAll(".skeletonBox").forEach((element) => {
      element.remove();
    });
    if (userCurrentLocation && nearByCount !== 0) {
      nearbyEvents.innerHTML = "";
      nearbyEvents.appendChild(nearbyEventsBox);
    } else if (userCurrentLocation && nearByCount === 0) {
      document.getElementById("nearbyEvents").innerHTML =
        "There are no nearby events!";
    }

    topPicks.appendChild(commonEvents);
  
}

async function checkCreatorStatus(userId) {
  let dbRef = ref(db, `users/userDetails/${userId}/check/creatorCheck`);
  let response = await get(dbRef);
  let status = response.val()["checkStatus"];

  return status;
 
}

async function setUserName(userId) {
  let dbRef = ref(db, `users/userDetails/${userId}/profileDetails/userName`);
  let response = await get(dbRef);
  let userName = response.val();

  return userName;
}


function setLocalStorage(dataObj){
  for(let key in dataObj){
    let data = JSON.stringify(dataObj[key])
    localStorage.setItem(key,data);
  }
}