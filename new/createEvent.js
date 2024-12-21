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
const cityElement = document.getElementById("eventCity");
const addressElement = document.getElementById("eventAddress");
const agendaElement = document.getElementById("agenda");
const ticketTypeElement = document.getElementById("ticketType");
const priceElement = document.getElementById("eventPrice")
const categoryElement = document.getElementById("category");
const defaultSelectElement = document.getElementById("defaultSelect");
let userId = JSON.parse(localStorage.getItem("userId"));
let coordsObj = receiveCoords();


// Error Varibales //

const eventNameError = document.getElementById("eventNameError");
const eventDescriptionError = document.getElementById("eventDescriptionError");
const eventDateError = document.getElementById("eventDateError");
const eventTimeError = document.getElementById("eventTimeError");
const eventCityError = document.getElementById("eventCityError");
const ticketError = document.getElementById("ticketTypeError");
const priceError = document.getElementById("priceError");
const eventAddressError = document.getElementById("eventAddressError");
const agendaError = document.getElementById("agendaError");
const categoryError = document.querySelector(".category-name-error");




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


// ticket Type check

ticketTypeElement.addEventListener("change",()=>{
  ticketError.textContent = "";
  let priceBox = document.getElementById("priceBox")
  if(ticketTypeElement.value === "Paid"){
    priceBox.classList.toggle("hidden",false)
  }
  else{
    priceBox.classList.toggle("hidden",true)
  }
})


// get coords

async function receiveCoords() {
  try {
    let dbRef = await ref(db, "coords");
    let data = await get(dbRef);

    if (!data.exists()) {
      throw new Error("no coords found");
    }
    return data.val();
  } catch (error) {
    return {};
  }
}

// generatecoords

async function generateCoords(address) {
  const url = `https://google-map-places.p.rapidapi.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&language=en&region=en`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": "9de07cb8bbmshea97d4c3fe99842p17d18fjsn3202acd43b1f",
      "x-rapidapi-host": "google-map-places.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].geometry.location; // Return latitude and longitude
    } else {
      alert("Address not found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
}

// getCoords

async function getCoords(address) {
  let searchAddress = address.replace(/[^a-zA-Z0-9]/g, "_");

  try {
    if (coordsObj[searchAddress]) {
      return coordsObj[searchAddress];
    }

    let receivedCoords = await generateCoords(address);
    if (receivedCoords === null) throw new Error("Cant get coords");
    let coordsRef = await ref(db, "coords");
    await update(coordsRef, {
      [searchAddress]: receivedCoords,
    });
    return receivedCoords;
  } catch (error) {
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

    <div class="form-group">
    
      <label>Subcategory Name <span class="caption">(Give a name to this subcategory)</span></label>
      <input type="text" class="subcategory-name" placeholder="Enter subcategory name" required>
      <span class="error-message subcategory-name-error"></span>
    </div>
    <div class="form-group">
      <label>Number of Seats <span class="caption">(Specify how many seats are available)</span></label>
      <input type="number" class="number-of-seats" placeholder="Enter number of seats" min="1" required>
      <span class="error-message number-of-seats-error"></span>
    </div>
    <div class="form-group">
      <label>Participator Type <span class="caption">(Choose individual or group participation)</span></label>
      <select class="participator-type" required>
        <option value="" disabled selected>Select type</option>
        <option value="individual">Individual</option>
        <option value="group">Group</option>
      </select>
      <span class="error-message participator-type-error"></span>
    </div>
    <div class="form-group hidden members-group">
      <label>Number of Members in a Team <span class="caption">(If group, specify team size)</span></label>
      <input type="number" class="number-of-members" placeholder="Enter number of members" min="2">
      <span class="error-message number-of-members-error"></span>
    </div>
    <button type="button" class="remove-subcategory">Remove</button>
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

// default subcategory select

defaultSelectElement.addEventListener("change", (e) => {
  const membersGroup = document
    .getElementById("defaultSub")
    .querySelector(".members-group");
  if (e.target.value === "group") {
    membersGroup.classList.remove("hidden");
    document.getElementById("defaultSub")
      .querySelector(".number-of-members")
      .setAttribute("required", "required");
  } else {
    membersGroup.classList.add("hidden");
    document.getElementById("defaultSub").querySelector(".number-of-members").removeAttribute("required");
  }
});

// format Time



// Handle Form Submission
const eventForm = document.getElementById("eventForm");

async function setEventData(data, eventId, userId) {
  try {
    let dbRef = ref(db, `events/${eventId}`);
    await update(dbRef, data);
    let userRef = ref(db, `users/userDetails/${userId}/createdEvents`);
  
   
    
    await update(userRef, {[eventId]: eventId });
    // Reset the form after submission
    eventForm.reset();
    imagePreview.innerHTML = "";

    alert("Event created successfully!");
  } catch (error) {
    console.log(error);
    alert(error);
  }
}

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Gather form data
  const eventId = crypto.randomUUID();
  const eventPoster = uploadPoster;
  const eventName = nameElement.value;
  const eventDescription = descriptionElement.value;
  const eventDate = dateElement.value;
  const eventTime = timeElement.value;
  const eventDuration = durationElement.value;
  const eventCity = cityElement.value;
  const eventAddress = addressElement.value;
  const ticketType = ticketTypeElement.value;
  const agenda = agendaElement.value;
  const category = categoryElement.value;

  // Gather subcategories
  const subcategories = {};
  const subcategoryElements = document.querySelectorAll(".subcategory");

  let isValid = true;
  document
    .querySelectorAll(".error-message")
    .forEach((error) => (error.textContent = ""));

  // event Name

  
  if (!eventName.trim()) {
    eventNameError.textContent = "Event Name is required.";
    isValid = false;
  }

  // event Description

  
  if (!eventDescription.trim()) {
    eventDescriptionError.textContent = "Event Description is required.";
    isValid = false;
  }
  //  date check

  
  if (!eventDate) {
    eventDateError.textContent = "Event Date is required.";
    isValid = false;
  }

  // time check

  if (!eventTime) {
    eventTimeError.textContent = "Event Time is required.";
    isValid = false;
  }

  // City Check

  
  if (!eventCity.trim()) {
    eventCityError.textContent = "Event Time is required.";
    isValid = false;
  }

  // ticket Type check
  if(ticketType=== ""){
    ticketError.textContent = "Select Ticket Type"
    isValid = false;
  }
  else if(ticketType === "Paid" && priceElement.value === "" ){
    priceError.textContent = "Input the price"
    isValid = false;
  }
  

  // address check

  if (!eventAddress.trim()) {
    eventAddressError.textContent = "Event Address is required.";
    isValid = false;
  }

  // agenda check

  if (!agenda.trim()) {
    agendaError.textContent = "Agenda is required.";
    isValid = false;
  }

  // category check

  if (!category.trim()) {
    categoryError.textContent = "Category is required.";
    isValid = false;
  }

  // subCategory check

  subcategoryElements.forEach((subcategory, index) => {
    const subcategoryName = subcategory.querySelector(".subcategory-name");
    const subcategoryNameError = subcategory.querySelector(
      ".subcategory-name-error"
    );
    if (!subcategoryName.value.trim()) {
      subcategoryNameError.textContent = `Subcategory Name is required (Subcategory ${index + 1
        }).`;
      isValid = false;
    }

    // Validate Number of Seats
    const numberOfSeats = subcategory.querySelector(".number-of-seats");
    const numberOfSeatsError = subcategory.querySelector(
      ".number-of-seats-error"
    );
    if (!numberOfSeats.value || parseInt(numberOfSeats.value) <= 0) {
      numberOfSeatsError.textContent = `Number of Seats must be greater than 0 (Subcategory ${index + 1
        }).`;
      isValid = false;
    }

    // Validate Participator Type
    const participatorType = subcategory.querySelector(".participator-type");
    const participatorTypeError = subcategory.querySelector(
      ".participator-type-error"
    );
    if (!participatorType.value) {
      participatorTypeError.textContent = `Participator Type is required (Subcategory ${index + 1
        }).`;
      isValid = false;
    }

    // Validate Number of Members (if "group" is selected)
    const numberOfMembers = subcategory.querySelector(".number-of-members");
    const numberOfMembersError = subcategory.querySelector(
      ".number-of-members-error"
    );
    if (
      participatorType.value === "group" &&
      (!numberOfMembers.value || parseInt(numberOfMembers.value) < 2)
    ) {
      numberOfMembersError.textContent = `Number of Members must be at least 2 for a group (Subcategory ${index + 1
        }).`;
      isValid = false;
    }
  });

  if (isValid) {
    const coords = await getCoords(eventAddress);
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
          collegeName: "VRS", //getCollegeName()
          randomId: crypto.randomUUID(),
        },
      };
    });

    let data = {
      generalInfo: {
        eventId: eventId,
        coords: coords,
        eventPoster: eventPoster,
        eventName: eventName,
        eventDescription: eventDescription,
        eventDate: eventDate,
        eventTime: eventTime,
        eventDuration: eventDuration,
        eventCity : eventCity,
        eventAddress: eventAddress,
        agenda: agenda,
        category: category,
        ticketType : ticketType
      },
      subCategory: subcategories,
    };

    setEventData(data, eventId, userId);
  }
});
