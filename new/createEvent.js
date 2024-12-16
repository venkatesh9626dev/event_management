import {
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

import { db } from "../assets/script/config.js";

// variables //

const uploadContainer = document.getElementById("uploadContainer");
const eventPosterInput = document.getElementById("eventPoster");
const imagePreview = document.getElementById("imagePreview");
const nameElement = document.getElementById("eventName");
const descriptionElement = document.getElementById("eventDescription");
const dateElement = document.getElementById("eventDate");
const timeElement = document.getElementById("eventTime");
const durationElement = document.getElementById("eventDuration");
const addressElement = document.getElementById("eventAddress");
const agendaElement = document.getElementById("agenda");
const categoryElement = document.getElementById("category");
let userId = localStorage.getItem("userId");
let coordsObj = receiveCoords();

// async function getCollegeName(userId) {
//   try {
//     let dbRef = await ref(db, `users/${userId}/profileDetails/collegeName`);
//     let data = await get(dbRef);
//     if (!data.exists()) {
//       throw new Error("User College Name not Exists");
//     }

//     return data.val();
//   } catch (error) {
//     console.log(error);
//   }
// }

// set event data in firebase

// get coords

async function receiveCoords(){
   try{
    let dbRef =  await ref(db,"coords");
    let data = await get(dbRef);

    if(!data.exists()){
        throw new Error("no coords found")
    }
    return data.val()
   }
   catch(error){
    return {};
   }
}

// generatecoords

async function generateCoords(address) {
    const url = `https://google-map-places.p.rapidapi.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=en&region=en`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '9de07cb8bbmshea97d4c3fe99842p17d18fjsn3202acd43b1f',
            'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return data.results[0].geometry.location; // Return latitude and longitude
        } else {
            alert('Address not found!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
    
}

// getCoords 

async function getCoords(address) {
    let searchAddress = address.replace(/[^a-zA-Z0-9]/g, '_');;
    
    
    
    try{
        if(coordsObj[searchAddress]){
            return coordsObj[searchAddress]
        }

        let receivedCoords = await generateCoords(address);
        if(receivedCoords === null) throw new Error("Cant get coords")
        let coordsRef = await ref(db,"coords")
        await update(coordsRef,{
          [searchAddress] : receivedCoords
        })
        return receivedCoords
    }
    catch(error){
      alert(error)
    }
}


async function setEventData(data, eventId, userId) {
  try {
    let dbRef = ref(db,`events/${eventId}`);
    await update(dbRef,data);
    let userRef = ref(db,`users/userDetails/${userId}`);
    let response = await get(userRef)
    let existingId = response?.createdEvents || {};

    let updatedId = {
        ...existingId,
        [eventId] : eventId
    }
    await update(userRef,{"createdEvents" : updatedId})
    // Reset the form after submission
    eventForm.reset();
    imagePreview.innerHTML = "";
    
    alert("Event created successfully!");
    }

   catch (error) {
    console.log(error);
    alert(error);
  }
}

// const collegeName = getCollegeName(userId);
// Handle Image Upload Preview

let uploadPoster = "";
uploadContainer.addEventListener("click", () => {
  eventPosterInput.click();
});

uploadContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadContainer.classList.add("dragover");
});

uploadContainer.addEventListener("dragleave", () => {
  uploadContainer.classList.remove("dragover");
});

uploadContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadContainer.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    eventPosterInput.files = files;
    displayImagePreview(files[0]);
  }
});

eventPosterInput.addEventListener("change", () => {
  if (eventPosterInput.files.length > 0) {
    displayImagePreview(eventPosterInput.files[0]);
  }
});

function displayImagePreview(file) {
  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.innerHTML = `<img src="${reader.result}" alt="Event Poster">`;
    uploadPoster = reader.result;
  };
  reader.readAsDataURL(file);
}

// Handle Adding Subcategories
const addSubcategoryBtn = document.getElementById("addSubcategoryBtn");
const subcategoriesContainer = document.getElementById(
  "subcategoriesContainer"
);

addSubcategoryBtn.addEventListener("click", () => {
  const subcategory = document.createElement("div");
  subcategory.classList.add("subcategory");

  subcategory.innerHTML = `
        <button type="button" class="remove-subcategory"><i class="fas fa-times"></i></button>
        <div class="form-group">
            <label>Subcategory Name <span class="caption">(Give a name to this subcategory)</span></label>
            <input type="text" class="subcategory-name" placeholder="Enter subcategory name" required>
        </div>
        <div class="form-group">
            <label>Number of Seats <span class="caption">(Specify how many seats are available)</span></label>
            <input type="number" class="number-of-seats" placeholder="Enter number of seats" min="1" required>
        </div>
        <div class="form-group">
            <label>Participator Type <span class="caption">(Choose individual or group participation)</span></label>
            <select class="participator-type" required>
                <option value="">Select type</option>
                <option value="individual">Individual</option>
                <option value="group">Group</option>
            </select>
        </div>
        <div class="form-group hidden members-group">
            <label>Number of Members in a Team <span class="caption">(If group, specify team size)</span></label>
            <input type="number" class="number-of-members" placeholder="Enter number of members" min="2">
        </div>
    `;

  subcategoriesContainer.appendChild(subcategory);

  // Add event listener for remove button
  subcategory
    .querySelector(".remove-subcategory")
    .addEventListener("click", () => {
      subcategory.remove();
    });

  // Add event listener for participator type change
  const participatorType = subcategory.querySelector(".participator-type");
  participatorType.addEventListener("change", (e) => {
    const membersGroup = subcategory.querySelector(".members-group");
    if (e.target.value === "group") {
      membersGroup.classList.remove("hidden");
      subcategory
        .querySelector(".number-of-members")
        .setAttribute("required", "required");
    } else {
      membersGroup.classList.add("hidden");
      subcategory
        .querySelector(".number-of-members")
        .removeAttribute("required");
    }
  });
});

// format Time

function formatTime(){
  let time = timeElement.value.split(":");
  let timeUnit  = time[0] >=12 ? "PM" : "AM";
  let hours = time[0] % 12 ;
  let correctTime = hours ? `${hours}` : "12";

  return `${correctTime} : ${time[1]} ${timeUnit}`;
}

// Handle Form Submission
const eventForm = document.getElementById("eventForm");

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Gather form data
  const eventId = crypto.randomUUID();
  const eventPoster = uploadPoster;
  const eventName = nameElement.value;
  const eventDescription = descriptionElement.value;
  const eventDate = dateElement.value;
  const eventTime = formatTime();
  const eventDuration = durationElement.value;
  const eventAddress = addressElement.value;
  const agenda = agendaElement.value;
  const category = categoryElement.value;
  const coords = await  getCoords(eventAddress) ;
  if(coords === null){
    return;
  }

  // Gather subcategories
  const subcategories = {};
  const subcategoryElements = document.querySelectorAll(".subcategory");
  subcategoryElements.forEach((subcat) => {
    const name = subcat.querySelector(".subcategory-name").value;
    const seats = subcat.querySelector(".number-of-seats").value;
    const type = subcat.querySelector(".participator-type").value;
    let members = null;
    if (type === "group") {
      members = subcat.querySelector(".number-of-members").value;
    }
    subcategories[`${name}`] = {
      subCatDetails: {
        catName: name,
        catSeats: seats,
        type: type,
        members: members,
      },
      participantDetails: {
        userName: "creator",
         collegeName: "VRS" , //getCollegeName()
        randomId: crypto.randomUUID(),
      },
    };
  });

  let data = {
    generalInfo: {
      eventId: eventId,
      coords : coords,
      eventPoster: eventPoster,
      eventName: eventName,
      eventDescription: eventDescription,
      eventDate: eventDate,
      eventTime: eventTime,
      eventDuration: eventDuration,
      eventAddress: eventAddress,
      agenda: agenda,
      category: category,
    },
    subCategory: subcategories,
  };

  setEventData(data, eventId, userId);
});

