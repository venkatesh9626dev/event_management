import { db, auth, mailApiKey, templateKey, serviceKey } from "./config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  ref,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname == "/pages/home.html") {
    window.location.replace("/index.html");
  }
});

let eventsObj = JSON.parse(localStorage.getItem("eventsObj"));
let mainElement = document.getElementById("mainContainer");

// extracting data from search bar

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get("eventId");
const eventTime = urlParams.get("eventTime");
const eventDate = urlParams.get("eventDate");

viewMore(eventId, eventDate, eventTime);

// Function to display the location on the map
function displayMap(coords) {
  let map = L.map("map").setView([51.505, -0.09], 13); // Default position
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  const latLng = [coords.lat, coords.lng];
  map.setView(latLng, 13); // Set map view to the location

  // Add a marker for the event location
  const marker = L.marker(latLng).addTo(map);
  marker
    .bindPopup(
      `<b>Event Location</b><br>Coordinates: ${coords.lat}, ${coords.lng}`
    )
    .openPopup();
}

function viewMore(eventId, eventDate, eventTime) {
  let eventDetails = eventsObj[eventId]["generalInfo"];

  let wrapper = document.createElement("div");
  wrapper.innerHTML = `
          
          <div id="dynamicContainer">
              <section id="img-container">
                  <img class="eventImage" id="eventPoster" src="${
                    eventDetails.eventPoster
                  }" alt="">
              </section>
              <section id="content-Container">
                  <div   id="mainInfoBox">
                      <div id="eventNameBox">
                        <h3 id="mainDate">${eventDate}</h3>
                        <h2 id="eventName">${eventDetails.eventName}</h2>
                        <p id="eventDesc">${eventDetails.eventDescription}</p>
                      </div>
                      <div  class="joinBox">
                        <button class="secondaryBtn" id="joinBtn">Join the event</button>
                      </div>
                  </div>

                  <div  id="subInfoBox">
                      <div id = "categoryBox">
                        <h3 class="detailsLabel">Sub Category</h3>
                        <div id = "categoryList"></div>
                      </div>
                      <div id="agendaBox"> 
                        <h3 class="detailsLabel">Agenda of the Event</h3>
                        <p id="eventAgenda">${eventDetails.agenda}</p>
                      </div>
                  </div>
                  
                  
                  <div id="sideBox">
                    <div class="sideItems">
                      <h3 class="detailsLabel">Date and Time</h3>
                      <p ><span id="eventTimeDate">${eventDate} | ${eventTime}</span></p>
                    </div>
                    <div class="sideItems">
                        <h3 class="detailsLabel">College Name</h3>
                        <p id="collegeName">${eventDetails.eventCollege}</p>
                    </div>
                    <div class="sideItems">
                        <h3 class="detailsLabel">Ticket Type</h3>
                        <p id="ticketType">${eventDetails.ticketType}</p>
                    </div>
                    <div class="sideItems">
                        <h3 class="detailsLabel">Ticket Price</h3>
                        <p id="ticketPrice">${
                          eventDetails.ticketPrice || "NA"
                        }</p>
                    </div>
                    <div class="sideItems">
                        <h3 class="detailsLabel">Category</h3>
                        <p id="eventCategory">${eventDetails.category}</p>
                    </div>
                    <div class="sideItems">
                        <h3 class="detailsLabel">Event Location</h3>
                        <address id="eventAddress">
                            ${eventDetails.eventAddress}
                        </address>
                    </div>
                  </div>
                  
                  
              </section>
          </div>`;
  let subCatBox = wrapper.querySelector("#categoryList");
  let listOfCat = eventsObj[eventId]["subCategory"];

  let fragment = document.createDocumentFragment();
  for (let subCat in listOfCat) {
    let newDiv = document.createElement("div");
    newDiv.innerHTML = `
              <p class="catList">Name : ${listOfCat[subCat]["subCatDetails"]["catName"]}</p>
              <p class="catList">Number of participants : ${listOfCat[subCat]["subCatDetails"]["catSeats"]}</p>
              <p class="catList subCatType">Participant Type : ${listOfCat[subCat]["subCatDetails"]["type"]}</p>
              
            `;
    if (newDiv.querySelector(".subCatType").textContent == "group") {
      let newPara = document.createElement("p");
      newPara.textContent = `Members per team : ${listOfCat[subCat]["subCatDetails"]["members"]}`;
      newDiv.appendChild(newPara);
    }
    fragment.append(newDiv);
  }

  subCatBox.append(fragment);

  mainElement.insertAdjacentElement("afterbegin", wrapper);
  displayMap(eventDetails.coords);

  loadParticipatorForm(listOfCat, eventDetails);
}

async function loadParticipatorForm(categoryList, eventDetails) {
  let fragment = document.createElement("section");

  fragment.setAttribute("id", "participatorContainer");
  fragment.innerHTML = `
      
          <form action="" class="participatorForm">
              <div style="display: flex; justify-content: space-between;">
                  <h3 class="formHead">Participator Form</h3>
                  <button type="button" id="participateBack" class="primaryBtn">Back</button>
              </div>
              <div id="generalInfo">
                  <div class="input-container">
                      <label for="collegeName">College Name*</label>
                      <input type="text" id="collegeNameInput" placeholder="Enter your college name" class="input-field" title="Please fill your college name">
                      <p id="collegeNameError" class="registerError"></p>
                  </div>
                   <div class="input-container">
                      <label for="mailAddress">Mail Address*</label>
                      <input type="email" id="mailAddressInput" placeholder="Enter your mail address" class="input-field" title="Please fill your mail address">
                      <p id="mailAddressError" class="registerError"></p>
                  </div>
                  <div class="input-container">
                      <label for="phoneNumber">Phone Number*</label>
                      <input type="tel" id="phoneNumberInput" placeholder="Enter your mobile number" class="input-field" title="Please fill your mobile number">
                      <p id="phoneNumberError" class="registerError"></p>
                  </div>
                  <div class="input-container">
                      <label for="specialBox">Special about you*</label>
                      <textarea name="specialBox" id="specialBoxInput" placeholder="Tell us something special about you...."></textarea>
                      <p id="specialBoxError" class="registerError"></p>
                  </div>
              </div>
              <div>
                  <label for="">Choose your interest</label>
                  <div id="catSelect">
                      
                  </div>
                   <p id="interestError" class="registerError"></p>
              </div>
              <div id="priceContainer" class="input-container">
                  
              </div>
              <div>
                  <button type="button" id="joinEventBtn">Join the event</button>
              </div>
          </form>
    
    `;

  let categoryCount = await categoryCountCheck(
    fragment,
    categoryList,
    eventDetails
  );

  if (eventDetails.ticketType === "Paid") {
    fragment.querySelector("#priceContainer").innerHTML = `
        <label for="">Price Details</label>
        <div id="priceBox">
            <p class="priceItems">Number of category : <span class="categoryCount">0</span> </p>
            <p class="priceItems"> Total price :  <span class="categoryCount">0</span>  x ${eventDetails.ticketPrice} = <span id="totalPrice">0</span> </p>
        </div>
      `;
    checkBoxListener(fragment, eventDetails.ticketPrice);
  }

  mainElement.appendChild(fragment);

  document.getElementById("joinBtn").addEventListener("click", () => {
    if (categoryCount != false) {
      fragment.classList.add("show");

      fragment
        .querySelector("#participateBack")
        .addEventListener("click", () => {
          fragment.classList.remove("show");
        });

      // adding event listeners for participator input filed

      fragment
        .querySelector("#collegeNameInput")
        .addEventListener("input", collegeNameValidate);
      fragment
        .querySelector("#phoneNumberInput")
        .addEventListener("input", phoneNumberValidate);
      fragment
        .querySelector("#specialBoxInput")
        .addEventListener("input", bioValidate);

      fragment.querySelector("#joinEventBtn").addEventListener("click", () => {
        let isFormValid = true;

        // Execute all validation functions
        if (!collegeNameValidate()) isFormValid = false;
        if (!phoneNumberValidate()) isFormValid = false;
        if (!bioValidate()) isFormValid = false;
        if (!checkBoxValidate()) isFormValid = false;

        if (isFormValid) {
          if (eventDetails.ticketType === "Paid") {
            const popupContainer = document.createElement("div");
            popupContainer.className = "popup-container";

            // Create the popup content
            const popup = document.createElement("div");
            popup.className = "popup";

            let amount = document.getElementById("totalPrice").textContent;
            // Add content to the popup
            popup.innerHTML = `
                  <h2>Payment Summary</h2>
                  <p>Total Amount :${amount} </p>
                  <div>
                    <button id="confirmPayment" class = "primaryBtn">
                        Confirm payment
                    </button>
                    <button id="cancelPayment" class = "secondaryBtn"> 
                        Cancel payment
                    </button>
                  </div>
          
                `;

            // Append the popup to the container
            popupContainer.appendChild(popup);

            // Append the popup container to the body
            document.body.appendChild(popupContainer);

            // Add event listener to close the popup
            const closePopupBtn = document.getElementById("cancelPayment");
            closePopupBtn.addEventListener("click", () => {
              document.body.removeChild(popupContainer);
            });

            // Add event listener to confirm payment

            const confirmPayment = document.getElementById("confirmPayment");
            confirmPayment.addEventListener("click", () => {
              //document.body.removeChild(popupContainer);
              popupContainer.innerHTML = `'<i class="fa-solid fa-spinner fa-spin" style = "font-size: 40px;"></i>'`;
              updateParticipatedEvents(
                popupContainer,
                categoryList,
                eventDetails,
                "paid"
              );
            });
          } else {
            updateParticipatedEvents(
              null,
              categoryList,
              eventDetails,
              "free"
            );
          }
        }
      });
    } else {
      let isExist = document.querySelector(".popup-message");
      if (isExist) {
        isExist.classList.add("show");

        setTimeout(() => {
          isExist.classList.remove("show");
        }, 3000);
      } else {
        let popUp = document.createElement("div");
        popUp.textContent = "You have already joined in this event";
        popUp.classList.add("popup-message", "show");
        mainElement.appendChild(popUp);
        setTimeout(() => {
          popUp.classList.remove("show");
        }, 3000);
      }
    }
  });
}

async function categoryCountCheck(fragment, categoryList, eventDetails) {
  let userId = JSON.parse(localStorage.getItem("userId"));
  let dbRef = ref(
    db,
    `users/userDetails/${userId}/participatedEvents/${eventDetails.eventId}/category`
  );
  let data = await get(dbRef);
  let participatedList = data.val() || [];

  let categoryCount = 0;
  fragment.querySelector("#catSelect").innerHTML = "";
  for (let category in categoryList) {
    if (!participatedList.includes(category)) {
      let newDiv = document.createElement("div");
      newDiv.classList.add("catItems");
      newDiv.innerHTML = `
       <input type="checkbox" id="${category}" class="checkBox" >
       <label for="${category}" class="subCatLabel">${category}</label>`;

      fragment.querySelector("#catSelect").appendChild(newDiv);
      categoryCount++;
    }
  }

  return categoryCount != 0 ? true : false;
}

// add event listener for checkbox

function checkBoxListener(fragment, ticketPrice) {
  let checkBox = fragment.querySelectorAll(".checkBox");

  checkBox.forEach((element, index, arr) => {
    element.addEventListener("change", () => {
      let count = 0;
      arr.forEach((element) => {
        if (element.checked) {
          count++;
        }
      });
      let toAddElements = fragment.querySelectorAll(".categoryCount");
      toAddElements.forEach((element) => {
        element.textContent = count;
      });
      fragment.querySelector("#totalPrice").textContent = count * ticketPrice;
      checkBoxValidate();
    });
  });
}

// participator form validate

function collegeNameValidate() {
  let collegeName = document.getElementById("collegeNameInput");

  let collegeError = document.getElementById("collegeNameError");
  if (collegeName.value.trim() === "") {
    collegeError.textContent = "Enter your college name";
    return false;
  } else if (collegeName.value.trim().length < 3) {
    collegeError.textContent = "College name should be at least 3 characters";
    return false;
  } else {
    collegeError.textContent = "";
    return true; // Clear error if valid
  }
}

function phoneNumberValidate() {
  // Validate Phone Number

  let phoneNumber = document.getElementById("phoneNumberInput");

  let phoneNumberError = document.getElementById("phoneNumberError");
  const phonePattern = /^[6-9]\d{9}$/; // Regex for 10-digit Indian phone numbers
  if (phoneNumber.value.trim() === "") {
    phoneNumberError.textContent = "Enter your mobile number";
    return false;
  } else if (!phonePattern.test(phoneNumber.value.trim())) {
    phoneNumberError.textContent = "Enter a valid 10-digit mobile number";
    return false;
  } else {
    phoneNumberError.textContent = "";
    return true; // Clear error if valid
  }
}

function bioValidate() {
  // Validate Special Box
  let specialBox = document.getElementById("specialBoxInput");
  let specialBoxError = document.getElementById("specialBoxError");
  if (specialBox.value.trim() === "") {
    specialBoxError.textContent = "Tell us something special about you";
    return false;
  } else {
    specialBoxError.textContent = "";
    return true;
  }
}

function checkBoxValidate() {
  // Validate Interests
  let interestError = document.getElementById("interestError");
  let selectedInterests = document.querySelectorAll(
    '#catSelect input[type="checkbox"]:checked'
  );
  if (selectedInterests.length === 0) {
    interestError.textContent = "Select at least one interest";
    return false;
  } else {
    interestError.textContent = "";
    return true; // Clear error if valid
  }
}

function joinedEvent(ticketState) {
  const successPopup = document.createElement("div");
  successPopup.className = "successPopup";
  if (ticketState) {
    successPopup.innerHTML = `
        <div class = "popUpItems">Payment Successful!</div>
        <div class = "popUpItems">successfully joined the event!</div>
         <div class = "popUpItems">successfully sent the email</div>

      `;
  } else {
    successPopup.innerHTML = `
        <div class = "popUpItems">successfully joined the event</div>
        <div class = "popUpItems">successfully sent the email</div>
      `;
  }
  document.getElementById("participatorContainer").classList.remove("show");
  document.body.appendChild(successPopup);
  setTimeout(() => successPopup.remove(), 3000);
}

async function updateParticipatedEvents(
  popupContainer,
  categoryList,
  eventDetails,
  state
) {
  let userId = JSON.parse(localStorage.getItem("userId"));
  let userMail = document.getElementById("mailAddressInput").value;
  let userName = localStorage.getItem("userName");
  let collegeName = document.getElementById("collegeNameInput").value;
  let participantBio = document.getElementById("specialBoxInput").value;
  let participantNumber =  document.getElementById("phoneNumberInput").value;

  try {
    let dbRef = ref(
      db,
      `users/userDetails/${userId}/participatedEvents/${eventDetails.eventId}/category`
    );
    let response = await get(dbRef);
    let existingData = response.val() || [];
    let dataArr = [...existingData];
    let checkBoxObj = {};
    

    const checkboxes = document.querySelectorAll(".checkBox");

    for (let element of checkboxes) {
      if (element.checked) {
        let eventRef = ref(
          db,
          `events/${eventDetails.eventId}/subCategory/${element.id}/participantDetails/${userId}`
        );

        let data = {
          userName: userName,
          mailId: userMail,
          collegeName: collegeName,
          bio: participantBio,
          phoneNumber: participantNumber,
          entryId:  crypto.randomUUID()          ,
        };

        await update(eventRef, data);
        dataArr.push(element.id);
        checkBoxObj[element.id] = data["entryId"];
      }
    }

    // update participants detail in events record

    let updateRef = ref(
      db,
      `users/userDetails/${userId}/participatedEvents/${eventDetails.eventId}`
    );


    await update(updateRef, { category: dataArr });

    let eventDate = document.querySelector("#eventTimeDate").textContent;
    await sendMail(
      checkBoxObj,
      eventDetails.eventName,
      eventDate,
      eventDetails.eventAddress,
      eventDetails.ticketPrice,
      userMail,
      userName
    );
    if (state === "free") {
      joinedEvent(false);
    } else {
      joinedEvent(true);
      popupContainer.remove();
    }
    document.querySelector("#participatorContainer").remove();
    await loadParticipatorForm(categoryList, eventDetails);
  } catch (error) {
    console.log(error);

    alert(error);
  }
}

// logout function

document.getElementById("logOut").addEventListener("click", () => {
  signOut(auth).then(() => {
    alert("Logged out");
    localStorage.removeItem("userId");
    localStorage.removeItem("authStatus");
    window.location.pathname = "/index.html";
  });
});

// mail function

async function sendMail(
  categoryObj,
  eventName,
  eventDate,
  eventAddress,
  ticketPrice,
  userMail,
  userName
) {
  let categoryArr = [];
  for (let key in categoryObj) {
    let str = `${key} - Unique Entry Id (${categoryObj[key]})`;
    categoryArr.push(str);
  }
  let categoryName = categoryArr.join(" | ");
  let dataObj = {
    to_name: userName,
    eventName: eventName,
    eventDate: eventDate,
    eventAddress: eventAddress,
    ticketPrice: ticketPrice,
    ticketCount: categoryArr.length,
    totalPrice: ticketPrice * categoryArr.length,
    categoryName: categoryName,
    toEmail: userMail,
  };

  await emailjs.send(serviceKey, templateKey, dataObj);
}

emailjs.init(mailApiKey);
