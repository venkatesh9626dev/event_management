import {
  getDatabase,
  ref,
  child,
  set,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { auth,db } from "./config.js";



//   Dom Reference Variables //

// pages reference

export let signupPage = document.getElementById("signUpPage");
export let loginPage = document.getElementById("signInPage");

// form reference

let upForm = document.getElementById("signupForm");
let inForm = document.getElementById("signinForm");

// signup elements reference//

let userNameSignup = document.getElementById("userNameSignUp");
let userMailSignup = document.getElementById("userMailSignUp");
let userPassSignup = document.getElementById("userPasswordSignUp");
let confirmPassSignup = document.getElementById("confirmPassSignUp");
let userSignupBtn = document.getElementById("signupBtn");

// login variables

let signinMail = document.getElementById("userMaillogin");
let signinPass = document.getElementById("userPasswordLogin");
let signinBtn = document.getElementById("loginBtn");
let role = document.querySelectorAll(".role");

// login error

let inMailError = document.getElementById("UserMailErrorSignin");
let inPassError = document.getElementById("UserPassErrorSignin");
let commonError = document.getElementById("commonErrorSignin");
let termsError = document.getElementById("termsCheckboxInError");
let errorPartIn = [inMailError, inPassError, commonError, termsError];
let roleError = document.getElementById("roleErrorIn");
// signup errs variables

let userNameSignUpError = document.getElementById("UserNameError");
let UserMailErrorSignUp = document.getElementById("UserMailErrorSignUp");
let UserPassErrorSignUp = document.getElementById("UserPassErrorSignUp");
let UserConfirmPassErrorSignUp = document.getElementById(
  "UserConfirmPassErrorSignUp"
);
let termsErrorUp = document.getElementById("termsCheckboxUpError");
let errorPart = [
  userNameSignUpError,
  UserMailErrorSignUp,
  UserPassErrorSignUp,
  UserConfirmPassErrorSignUp,
  termsErrorUp,
];

// redirect variables

let toLogin = document.getElementById("loginRedirect");
let toSignup = document.getElementById("signUpRedirect");

// inserting district options by fetch

toLogin.addEventListener("click", () => {
  errorPart.forEach((element) => {
    element.textContent = "";
  });
  upForm.reset();
  localStorage.setItem("signedup", JSON.stringify(true)); // to trace current page
  signupPage.style.display = "none";
  loginPage.style.display = "block";
});
toSignup.addEventListener("click", () => {
  errorPartIn.forEach((element) => {
    element.textContent = "";
  });
  inForm.reset();
  userSignupBtn.innerHTML = "Create your Account";
  userSignupBtn.style.color = "white";
  localStorage.removeItem("signedup");
  signupPage.style.display = "block";
  loginPage.style.display = "none";
});

// userName Error Check

// userName function

async function userNameErrorCheck() {
  userNameSignUpError.textContent = "";
  userNameSignUpError.style.color = "red";
  let enteredValue = userNameSignup.value;
  let valueLen = enteredValue.length;

  if (valueLen === 0) {
    userNameSignUpError.textContent = "Enter Your Username";
    return 1;
  } else if (/^[0-9]/.test(enteredValue)) {
    userNameSignUpError.textContent =
      "The username should not start with numbers";
    return 1;
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(enteredValue)) {
    userNameSignUpError.textContent =
      "The username only contains alphabets, numbers, and (_) underscore";
    return 1;
  } else if (valueLen < 3) {
    userNameSignUpError.textContent = "Enter minimum 3 characters";
    return 1;
  } else {
    const userNameDbRef = ref(db, `users/usernames/${enteredValue}`);
    try {
      let snapshot = await get(userNameDbRef);

      if (snapshot.exists()) {
        userNameSignUpError.textContent = "The username already exists";
        return 1;
      } else {
        userNameSignUpError.style.color = "green";
        userNameSignUpError.textContent = "Good Username";
        return 0;
      }
    } catch (error) {
      userNameSignUpError.textContent = `${error}`;
      return 1;
    }
  }
}
// Email function

function emailErrorCheck(email) {
  // Regular expression for basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ac\.in|edu)$/;

  if (/^[._%+\-!@#$^&*(){}"'?<>,|/]/.test(email)) {
    UserMailErrorSignUp.textContent = "no special characters in start of email";
    UserMailErrorSignUp.style.color = "red";
    return 1;
  } else if (emailRegex.test(email)) {
    UserMailErrorSignUp.textContent = "valid email format";
    UserMailErrorSignUp.style.color = "green";
    return 0; // No error
  } else {
    UserMailErrorSignUp.textContent = "Invalid email format";
    UserMailErrorSignUp.style.color = "red";
    return 1; // Error found
  }
}

// password check function

function passErrorCheck() {
  let value = userPassSignup.value;
  UserPassErrorSignUp.style.color = "red";
  let caps = 0;
  let special = 0;
  let number = 0;

  if (value === "") {
    UserPassErrorSignUp.textContent = "Enter your password";
  } else {
    for (let i = 0; i < value.length; i++) {
      if (value.charCodeAt(i) >= 65 && value.charCodeAt(i) <= 90) {
        caps = 1;
      } else if (
        (value.charCodeAt(i) >= 33 && value.charCodeAt(i) <= 47) ||
        (value.charCodeAt(i) >= 58 && value.charCodeAt(i) <= 64) ||
        (value.charCodeAt(i) >= 91 && value.charCodeAt(i) <= 96) ||
        (value.charCodeAt(i) >= 123 && value.charCodeAt(i) <= 125)
      ) {
        special = 1;
      } else if (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) {
        number = 1;
      } else if (value.charCodeAt(i) === 32) {
        UserPassErrorSignUp.textContent = "Space is a invalid character";
        return 1;
      }
    }
    let count = caps === 1 && special === 1 && number === 1;
    if (count && value.length >= 8) {
      UserPassErrorSignUp.textContent = "Password is Good";
      UserPassErrorSignUp.style.color = "green";
      return 0;
    } else if (count && value.length < 8) {
      UserPassErrorSignUp.textContent = "Password should contain 8 characters";
      return 1;
    } else if (count === false) {
      UserPassErrorSignUp.textContent = "Password is Poor";
      return 1;
    }
  }
}

// Confirm password error check

function confirmPassErrorCheck() {
  UserConfirmPassErrorSignUp.textContent = "";
  UserConfirmPassErrorSignUp.style.color = "red";
  let passValue = userPassSignup.value;
  let inputValue = confirmPassSignup.value;

  if (passValue === "") {
    UserConfirmPassErrorSignUp.textContent = "First enter your Password";
    return 1;
  } else if (passValue === inputValue) {
    UserConfirmPassErrorSignUp.textContent = "Password matched";
    UserConfirmPassErrorSignUp.style.color = "green";
    return 0;
  } else if (inputValue.length > passValue.length) {
    UserConfirmPassErrorSignUp.textContent = "Password is too length";
    return 1;
  } else {
    UserConfirmPassErrorSignUp.textContent = "Password Mismatch";
    return 1;
  }
}

userNameSignup.addEventListener("input", userNameErrorCheck);

userMailSignup.addEventListener("focus", () => {
  if (userNameSignup.value === "") {
    userNameSignUpError.textContent = "Enter your username";
  }
});

userMailSignup.addEventListener("input", () => {
  emailErrorCheck(userMailSignup.value);
});

// Password Test cases
userPassSignup.addEventListener("focus", () => {
  UserConfirmPassErrorSignUp.textContent = "";
  if (userMailSignup.value === "") {
    UserMailErrorSignUp.textContent = "Enter your email address";
  }
});
userPassSignup.addEventListener("input", passErrorCheck);

// Confirm Password

confirmPassSignup.addEventListener("focus", () => {
  if (userPassSignup.value === "") {
    UserConfirmPassErrorSignUp.style.color = "red";
    UserPassErrorSignUp.style.color = "red";
    UserPassErrorSignUp.textContent = "First enter your password";
    UserConfirmPassErrorSignUp.textContent = "First enter your password";
  } else if (userPassSignup.value === confirmPassSignup.value) {
    UserConfirmPassErrorSignUp.style.color = "green";
    UserConfirmPassErrorSignUp.textContent = "Password match";
  }
});

confirmPassSignup.addEventListener("input", confirmPassErrorCheck);

// interest

// terms and conditions check

function termsCheck(checkboxId) {
  const termsCheckbox = document.getElementById(checkboxId);

  const termsError = document.getElementById(`${checkboxId}Error`);

  if (!termsCheckbox.checked) {
    termsError.textContent =
      "You must agree to the terms and conditions to sign up.";
    return 1;
  } else {
    termsError.textContent = "";
    return 0;
  }
}

// signup functions

userSignupBtn.addEventListener("click", async () => {
  let errorPart = [
    userNameSignUpError,
    UserMailErrorSignUp,
    UserPassErrorSignUp,
    UserConfirmPassErrorSignUp,
  ];
  for (let i = 0; i < errorPart.length; i++) {
    errorPart[i].textContent = "";
  }

  let countError = 0;

  let userNameValue = userNameSignup.value;
  let userMailValue = userMailSignup.value;
  let passwordValue = userPassSignup.value;
  let confirmValue = confirmPassSignup.value;

  let errorName = ["Username", "email address", "Password", "Confirm Password"];
  let checkValue = [
    userNameValue,
    userMailValue,
    passwordValue,
    confirmValue,
    "termsCheckboxUp",
  ];
  let respectiveFtn = [
    userNameErrorCheck,
    emailErrorCheck,
    passErrorCheck,
    confirmPassErrorCheck,
    termsCheck,
  ];
  for (let i = 0; i < checkValue.length; i++) {
    if (checkValue[i] === "") {
      errorPart[i].textContent = `Please fill ${errorName[i]} field`;
      countError++;
    } else {
      countError += await respectiveFtn[i](checkValue[i]);
    }
  }

  if (countError === 0) {
    signUpAuth(userNameValue, userMailValue, passwordValue);
  }
});

async function signUpAuth(userNameValue, userMailValue, passwordValue) {
  userSignupBtn.innerHTML =
    'Signing up <i class="fa fa-spinner fa-spin" "></i>';
        try {
          // Create user with email and password
          const userCredential = await createUserWithEmailAndPassword(auth, userMailValue, passwordValue);
          const user = userCredential.user;
          
          
          const usernameRef = ref(db, `users/usernames/`);
          await update(usernameRef, { [userNameValue]: userNameValue });
         
          const roleCheckRef = ref(db, `users/userDetails/${user.uid}/check/roleCheck`);
          await update(roleCheckRef, { roleStatus: false });
          localStorage.setItem("userId", JSON.stringify(`${user.uid}`));
          // UI feedback for success
          userSignupBtn.innerHTML = "Signup Successful";
          
        } catch (error) {
          // Handle specific Firebase errors
          if (error.code === "auth/email-already-in-use") {
            UserMailErrorSignUp.style.color = "red";
            UserMailErrorSignUp.textContent = "Email already exists";
          } else {
            alert(`Error: ${error.message}`);
          }
          userSignupBtn.innerHTML = "Create your account";
        
      }
}
      
function redirectToLogin() {
  upForm.reset();
  errorPart.forEach((element) => {
    element.textContent = "";
    element.style.color = "red";
  });
  userSignupBtn.innerHTML = "Create your account";

  signupPage.style.display = "none";
  loginPage.style.display = "block";
}

// signnin Fucntions

function roleCheck() {
  document.getElementById("roleErrorIn").textContent = "";
  let count = 0;
  role.forEach((e) => {
    if (e.checked) {
      count++;
    }
  });
  if (count === 0) {
    document.getElementById("roleErrorIn").textContent = "Select Any One";
    return 1;
  }
  return 0;
}
role.forEach((e) => {
  e.addEventListener("change", () => {
    signinMail.disabled = false;
    signinPass.disabled = false;
    roleError.textContent = "";
  });
});

function inEmailCheck(email) {
  // Regular expression for basic email validation
  if (document.getElementById("user").checked) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ac\.in|edu)$/;
    if (emailRegex.test(email)) {
      inMailError.textContent = "valid email format";
      inMailError.style.color = "green";
      return 0; // No error
    } else {
      inMailError.textContent = "Invalid email format";
      inMailError.style.color = "red";
      return 1; // Error found
    }
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(email)) {
      inMailError.textContent = "valid email format";
      inMailError.style.color = "green";
      return 0; // No error
    } else {
      inMailError.textContent = "Invalid email format";
      inMailError.style.color = "red";
      return 1; // Error found
    }
  }
}
// password check function

function inPassCheck(value) {
  inPassError.style.color = "red";
  let caps = 0;
  let special = 0;
  let number = 0;

  if (value === "") {
    inPassError.textContent = "";
  } else {
    for (let i = 0; i < value.length; i++) {
      if (value.charCodeAt(i) >= 65 && value.charCodeAt(i) <= 90) {
        caps = 1;
      } else if (
        (value.charCodeAt(i) >= 33 && value.charCodeAt(i) <= 47) ||
        (value.charCodeAt(i) >= 58 && value.charCodeAt(i) <= 64) ||
        (value.charCodeAt(i) >= 91 && value.charCodeAt(i) <= 96) ||
        (value.charCodeAt(i) >= 123 && value.charCodeAt(i) <= 125)
      ) {
        special = 1;
      } else if (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) {
        number = 1;
      } else if (value.charCodeAt(i) === 32) {
        inPassError.textContent = "Space is a invalid character";
        return 1;
      }
    }
    let count = caps === 1 && special === 1 && number === 1;
    if (count && value.length >= 8) {
      inPassError.textContent = "Password is Good";
      inPassError.style.color = "green";
    } else if (count && value.length < 8) {
      inPassError.textContent = "Password should contain 8 characters";
      return 1;
    } else if (count === false) {
      inPassError.textContent = "Password is Poor";
      return 1;
    }
  }

  return 0;
}

// signin from firebase

async function signInFtn(mail, password) {
    try {
      // Update button text to show loading state
      signinBtn.innerHTML = `Logging in <i class="fa fa-spinner fa-spin"></i>`;
  
      if (document.getElementById("Admin").checked) {
        // Encode email for use as a database key
        const encodeEmail = (email) => email.replace(/\./g, ',').replace(/@/g, '_');
        const dref = await ref(db, `admin/accounts/${encodeEmail(mail)}`); // Reference to admin node
  
        // Fetch admin data from the database
        const result = await get(dref);
      
        
        if (result.exists()) {
          // Proceed with admin sign-in
          await signinAuth(auth, mail, password);
        } else {
          // Throw error if admin credentials are not found
          throw new Error("Admin credentials not found");
        }
      } else {
        // Sign in for general users
        await signinAuth(auth, mail, password);
      }
    } catch (error) {
      // Display an error message to the user
      commonError.textContent = error.message || "Invalid Credentials";
      signinBtn.innerHTML = "Login to your account";
      console.error("Sign-in error:", error);
    }
  }
  

// signinAuth

function signinAuth(auth, mail, password) {
  signInWithEmailAndPassword(auth, mail, password)
    .then((userCredential) => {
      if (document.getElementById("Admin").checked) {
        localStorage.setItem("isAdmin", JSON.stringify(true));
      }
      localStorage.setItem("currentPage", JSON.stringify("home"));
    })
    .then(() => {
      inForm.reset();
      inMailError.textContent = "";
      inMailError.style.color = "red";
      inPassError.textContent = "";
      inMailError.style.color = "red";
      signinBtn.innerHTML = "Login to your account";
    })
    .catch(() => {
      commonError.textContent = "Invalid email or password";
      signinBtn.innerHTML = "Login to your account";
    });
}

signinMail.addEventListener("input", () => {
  inEmailCheck(signinMail.value);
});
signinPass.addEventListener("input", () => {
  inPassCheck(signinPass.value);
});

signinBtn.addEventListener("click", signInCheck);

function signInCheck() {
  let errorCount = 0;

  let errorPart = [roleError, inMailError, inPassError];
  let errorName = ["role", "email address", "Password"];
  let checkValue = [
    null,
    signinMail.value,
    signinPass.value,
    "termsCheckboxIn",
  ];
  let respectiveFtn = [roleCheck, inEmailCheck, inPassCheck, termsCheck];
  for (let i = 0; i < checkValue.length; i++) {
    if (checkValue[i] === "") {
      errorPart[i].textContent = `Please fill ${errorName[i]} field`;
      errorCount++;
    } else {
      errorCount += respectiveFtn[i](checkValue[i]);
    }
  }

  if (errorCount === 0) {
    signInFtn(signinMail.value, signinPass.value);
  }
}

// const dref = ref(db,"admin/accounts")
// update(dref,{
//     "developervenkatesh6_gmail,com" : "developervenkatesh6_gmail,com"
// })