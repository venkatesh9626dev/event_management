import {auth } from "./config.js";
import { categoryColors,expiryCheck} from "./constant.js";
import { signOut,onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";




onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname == "/pages/search.html") {
    window.location.replace("/index.html");
  }
});

// sign Out

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

let eventsObj = JSON.parse(localStorage.getItem("eventsObj"));
let eventsArr = Object.values(eventsObj);


// making variables object with id name


let variablesObj = {};

document.querySelectorAll('[id]').forEach((e)=>{
    variablesObj[e.id] = e;
})


// search bar event listener

variablesObj['searchBar'].addEventListener("input",(e)=>{
    variablesObj["searchResults"].innerHTML = "";
    searchEvents(e.target.value.toLowerCase());
})

variablesObj['searchBtn'].addEventListener("click",()=>{
    let query = variablesObj["searchBar"].value;
    variablesObj["searchResults"].innerHTML = "";
    variablesObj["searchBar"].value = "";
    searchEvents(query);
})

// set min date as todays data for date input

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Set the min attribute of the date input
variablesObj["filter-date"].setAttribute('min', today);

// search events function

function searchEvents(query){
    if(query.trim().length !== 0){
        let filterArr = [];
        eventsArr.forEach((value)=>{
            let eventName = value.generalInfo.eventName.toLowerCase();
            let eventLocation = value.generalInfo.eventAddress.toLowerCase();
            let isUpcomingEvent = expiryCheck(value.generalInfo.eventDate,value.generalInfo.eventTime);

            if((eventName.includes(query) || eventLocation.includes(query)) && isUpcomingEvent[0] === "upcoming"){
                filterArr.push(value.generalInfo.eventId)
            }
        })

        if(filterArr.length === 0) {
            variablesObj["searchResults"].innerHTML = "<p class='validDetailsWarn'>No search results found</p>"
            return;
        }
        let searchResultsFragment = document.createDocumentFragment();

        filterArr.forEach((eventId)=>{
            let eventCard = createEventCard(eventId);
            searchResultsFragment.appendChild(eventCard)
        })

        variablesObj["searchResults"].appendChild(searchResultsFragment)
    }
    else{
        variablesObj["searchResults"].innerHTML = "<p class='validDetailsWarn'>Enter valid details</p>"
    }
}



// create a card


function createEventCard(eventId){

    
    let eventDetails = eventsObj[eventId]["generalInfo"];
    
    let timeInfo = expiryCheck(eventDetails.eventDate,eventDetails.eventTime);

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
                  <span class = "eventDate">${timeInfo[1][1]}</span>
                  <span class="eventTime">${timeInfo[1][0]}</span>
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
          contentBox.addEventListener("click",()=> {
           
            window.location.href = `/pages/moreDetails.html?eventId=${encodeURIComponent(eventDetails.eventId)}&eventTime=${timeInfo[1][0]}&eventDate=${timeInfo[1][1]}`
          })
    return contentBox;
}


// ticket type listener

variablesObj["filter-ticket"].addEventListener("change",(e)=>{
    if(e.target.value === "paid"){
        variablesObj["priceRange"].classList.toggle("hidden",false)
    }
    else{
        variablesObj["priceRange"].classList.toggle("hidden",true)
    }
})

//  filter btn listener function

variablesObj["applyfilterBtn"].addEventListener("click",()=>{
    variablesObj["searchResults"].innerHTML = "";
    filterEvents()
});

function filterEvents(){
    let filteredArr = checkDate(variablesObj["filter-date"].value);
    let newFragment = document.createDocumentFragment();
    filteredArr.forEach((id)=>{
        let newCard = createEventCard(id);
        newFragment.appendChild(newCard)
    })
    if(filteredArr.length === 0){
        variablesObj["searchResults"].innerHTML = "<p class='validDetailsWarn'>No search results found</p>";
    }
    else{
        variablesObj["searchResults"].appendChild(newFragment)

    }
}


function checkDate(selectedDate){
    
    
    if(selectedDate === ""){
        let keyArr = Object.keys(eventsObj)
        
        
       return checkCategory(variablesObj["filter-categories"].value.toLowerCase(),keyArr)
    }
    else{
        let filteredArr = [];

        eventsArr.forEach((value)=>{
            let eventDate = value.generalInfo.eventDate;

            if(eventDate === selectedDate) filteredArr.push(value.generalInfo.eventId)
            
        })
        
       
        return checkCategory(variablesObj["filter-categories"].value.toLowerCase(),filteredArr)
    }
    
}

function checkCategory(selectedCategory,idArr){
    if(selectedCategory === ""){
       
       return ticketType(variablesObj["filter-ticket"].value.toLowerCase(),idArr)
    }
    else{
        let filteredArr = [];

       idArr.forEach((value)=>{
            let category = eventsObj[value].generalInfo.eventCategory.toLowerCase();

            if(category === selectedCategory) filteredArr.push(value)
            
        })
       
        
        return ticketType(variablesObj["filter-ticket"].value.toLowerCase(),filteredArr)
    }
}

function ticketType(selectedType,idArr){
    if(selectedType === ""){
       
        return idArr
     }
     else{
         let filteredArr = [];
 
        idArr.forEach((value)=>{
            
            
             let ticketType = eventsObj[value].generalInfo.ticketType.toLowerCase();
 
             if(ticketType === selectedType) filteredArr.push(value)
             
         })
         if(selectedType == "free"){
            return filteredArr
         }
         else{
            return rangeCheck(variablesObj["filter-range"].value,filteredArr)

         }
     }
}

function rangeCheck(selectedRange,idArr){
    if(selectedRange === ""){
       
        return idArr
     }
     else{
         let filteredArr = [];
 
        idArr.forEach((value)=>{
             let range = eventsObj[value].generalInfo.ticketPrice;
 
             if(Number(range) >= Number(selectedRange)) filteredArr.push(value)
                
             
         })
         return filteredArr;
     }
}