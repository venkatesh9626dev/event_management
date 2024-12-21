import { db } from "./config.js";
import {
  ref,
  child,
  set,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

let userid = JSON.parse(localStorage.getItem("userId"));

const form = document.getElementById("creatorForm");
const collegeName = document.getElementById("collegeName");
const collegeID = document.getElementById("collegeID");
const uploadID = document.getElementById("uploadID");
const skipBtn = document.querySelector(".skip-btn");

function validateCollegeName() {
  const name = collegeName.value.trim();
  const minLength = 3;
  const maxLength = 100;
  const specialCharRegex = /[^a-zA-Z\s]/; // Matches special characters other than letters and spaces

  if (name === "") {
    setError(collegeName, "Please enter your College Name.");
    return false;
  }

  if (specialCharRegex.test(name)) {
    setError(
      collegeName,
      "College Name should not contain special characters."
    );
    return false;
  }

  if (/\d/.test(name)) {
    // Checks for numeric characters
    setError(collegeName, "College Name should not contain numbers.");
    return false;
  }

  if (name.length < minLength) {
    setError(
      collegeName,
      `College Name must be at least ${minLength} characters long.`
    );
    return false;
  }

  if (name.length > maxLength) {
    setError(
      collegeName,
      `College Name must not exceed ${maxLength} characters.`
    );
    return false;
  }

  clearFieldError(collegeName);
  return true;
}

function validateCollegeID(value) {
  const maxLength = 10;
  const minLength = 5;
  const numericRegex = /^[0-9]+$/;

  if (value === "") {
    setError(collegeID, "College ID is required.");
    return false;
  }

  if (!numericRegex.test(value)) {
    setError(collegeID, "College ID must be numeric.");
    return false;
  }

  if (value.length < minLength) {
    setError(
      collegeID,
      `College ID must be at least ${minLength} characters long.`
    );
    return false;
  }

  if (value.length > maxLength) {
    setError(collegeID, `College ID must not exceed ${maxLength} characters.`);
    return false;
  }

  clearFieldError(collegeID);
  return true;
}

function validateUploadID() {
  const file = uploadID.files[0];
  if (!file) {
    setError(uploadID, "Please upload your ID card.");
    return false;
  }

  if (!["image/png", "image/jpeg"].includes(file.type)) {
    setError(uploadID, "Please upload a valid image file (PNG or JPEG).");
    return false;
  }

  clearFieldError(uploadID);
  return true;
}

function setError(element, message) {
  const parent = element.closest(".form-group");
  let error = parent.querySelector(".error-message");

  if (!error) {
    error = document.createElement("p");
    error.className = "error-message";
    parent.appendChild(error);
  }

  error.textContent = message;
}

function clearFieldError(element) {
  const parent = element.closest(".form-group");
  const error = parent.querySelector(".error-message");
  if (error) {
    error.remove();
  }
}

function clearErrors() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((msg) => msg.remove());
}

// Real-time validation
collegeName.addEventListener("input", () => {
  validateCollegeName();
});

collegeID.addEventListener("input", () => {
  validateCollegeID(collegeID.value.trim());
});

uploadID.addEventListener("change", () => {
  validateUploadID();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default form submission

  // Clear all errors before submission
  clearErrors();

  let isValid = true;

  // Validate all fields
  if (!validateCollegeName()) isValid = false;
  if (!validateCollegeID(collegeID.value.trim())) isValid = false;
  if (!validateUploadID()) isValid = false;

  if (isValid) {
    try {
      localStorage.setItem("loginStatus", JSON.stringify(true));
      let file = uploadID.files[0];

      // Convert file to Base64
      const base64String = await base64(file);

      // Update admin's pending request
      let dRef = ref(db, `admin/pendingRequest/${userid}`);
      let data = {
        creatorId: userid,
        collegeName: collegeName.value,
        CollegeId: collegeID.value,
        collegeIdPhoto: base64String,
      };
      await update(dRef, data);

      // Update role status
      let userId = JSON.parse(localStorage.getItem("userId"));
      let roleRef = ref(db, `users/userDetails/${userId}/check/roleCheck`);
      await update(roleRef, { roleStatus: true });

      // Update creator check
      let creatorRef = ref(db, `users/userDetails/${userId}/check/creatorCheck`);
      await update(creatorRef, { checkStatus: "pending" });

      // Redirect to dashboard
      window.location.replace("/pages/home.html");
    } catch (error) {
      alert(`Error: ${error.message || error}`);
    }
  }
});

skipBtn.addEventListener("click", () => {
  let userId = JSON.parse(localStorage.getItem("userId"));
  let dRef = ref(db, `users/userDetails/${userId}/check/roleCheck`);
  update(dRef, { roleStatus: true })
  .then(()=>{
    let userRef = ref(db, `users/userDetails/${userId}/check/creatorCheck`);
    update(userRef,{"checkStatus" : "empty"})
  })
  window.location.replace("/pages/home.html");
});

function base64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
