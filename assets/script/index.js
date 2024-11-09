import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword , updateProfile} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, ref,child, set } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
          
const firebaseConfig = {
    apiKey: "AIzaSyDGn4Y0X3vjIcryoC1mL_m0CHkmWE1WR40",
    authDomain: "event-management-system-8f9cc.firebaseapp.com",
    databaseURL: "https://event-management-system-8f9cc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "event-management-system-8f9cc",
    storageBucket: "event-management-system-8f9cc.firebasestorage.app",
    messagingSenderId: "568755922602",
    appId: "1:568755922602:web:b40416ff2f13c2f7cfd2d3",
    measurementId: "G-CJV25ZFZV2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// get database

const db = getDatabase();


      //   Dom Reference Variables //

      // pages reference

let signupPage = document.getElementById("signUpPage");
let loginPage = document.getElementById("signInPage");

// signup elements reference//

let userNameSignup = document.getElementById("userNameSignUp");
let userMailSignup = document.getElementById("userMailSignUp");
let userPassSignup = document.getElementById("userPasswordSignUp");
let confirmPassSignup = document.getElementById("confirmPassSignUp");
let userDistSignup = document.getElementById("district");
let userrInterestArrSignup = document.querySelectorAll(".interest");
let userSignupBtn = document.getElementById("signupBtn");

// signup errs variables

let userNameSignUpError = document.getElementById("UserNameError");
let UserMailErrorSignUp = document.getElementById("UserMailErrorSignUp")
let UserPassErrorSignUp = document.getElementById("UserPassErrorSignUp");
let UserConfirmPassErrorSignUp = document.getElementById("UserConfirmPassErrorSignUp")
let UserLocationErrorSignUp = document.getElementById("UserLocationErrorSignUp");
let UserInterestErrorSignUp = document.getElementById("UserInterestErrorSignUp");

// redirect variables

let toLogin = document.getElementById("loginRedirect");
let toSignup = document.getElementById("signUpRedirect");
toLogin.addEventListener("click",()=>{
    signupPage.style.display = "none";
    loginPage.style.display = "block";
});
toSignup.addEventListener("click",()=>{
    signupPage.style.display = "block";
    loginPage.style.display = "none";
})

// userName Error Check

// userName function

function userNameErrorCheck() {
    userNameSignUpError.textContent = "";
    let enteredValue = userNameSignup.value;
    let valueLen = enteredValue.length;

    if (valueLen === 0) {
        userNameSignUpError.textContent = "Enter Your Username";
        return 1;
    } 
    
    else if (!/^[a-zA-Z0-9_]*$/.test(enteredValue)) {
        userNameSignUpError.textContent = "The username only contains alphabets, numbers, and (_) underscore";
        return 1;
    } 
    else if (valueLen < 3) {
        userNameSignUpError.textContent = "Enter minimum 3 characters";
        return 1;
    }
    return 0;
}
// Email function

function emailErrorCheck(email) {
    // Regular expression for basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;
    if (emailRegex.test(email)) {
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

function passErrorCheck(){
   

    let value = userPassSignup.value;
    UserPassErrorSignUp.style.color = "red";
    let caps = 0;
    let special = 0;
    let number = 0;

    if(value === ""){
        UserPassErrorSignUp.textContent = "";
    }
    else{
        for(let i = 0; i < value.length; i++){
            
            if(value.charCodeAt(i) >= 65 && value.charCodeAt(i) <=90 ){
                caps = 1;
            }
            else if((value.charCodeAt(i) >= 33 && value.charCodeAt(i) <=47) || (value.charCodeAt(i) >= 58 && value.charCodeAt(i) <=64) ||(value.charCodeAt(i) >= 91 && value.charCodeAt(i) <=96) || (value.charCodeAt(i) >= 123 && value.charCodeAt(i) <=125) ){
                special = 1;
            }
            else if(value.charCodeAt(i) >=48 && value.charCodeAt(i) <=57){
                number = 1;
            }
            else if(value.charCodeAt(i) === 32){
                UserPassErrorSignUp.textContent = "Space is a invalid character";
                return 1;
            }
        }
        let count = caps === 1 && special ===1 && number ===1;
        if(count && value.length >=8){
            UserPassErrorSignUp.textContent = "Password is Good";
            UserPassErrorSignUp.style.color = "green";
        }
        else if(count && value.length <8){
            UserPassErrorSignUp.textContent = "Password should contain 8 characters"
            return 1;
        }
        else if(count === false){
            UserPassErrorSignUp.textContent = "Password is Poor";
            return 1;
        }
    }
    
    return 0;
}

// Confirm password error check

function confirmPassErrorCheck(){
    
    UserConfirmPassErrorSignUp.textContent = "";
    UserConfirmPassErrorSignUp.style.color = "red";
    let passValue = userPassSignup.value;
    let inputValue = confirmPassSignup.value;

    if(passValue === inputValue){
        UserConfirmPassErrorSignUp.textContent ="Password matched"
        UserConfirmPassErrorSignUp.style.color = "green";
    }
    else if(inputValue.length > passValue.length){
        UserConfirmPassErrorSignUp.textContent = "Password is too length";
        return 1;
    }
    else{
        for(let i = 0; i < inputValue.length; i++){
            if(inputValue[i] !== passValue[i]){
                UserConfirmPassErrorSignUp.textContent = "Password Mismatch"
                return 1;
                
            }
        }
    }
    return 0;
}

userNameSignup.addEventListener("input", userNameErrorCheck);

userMailSignup.addEventListener("focus",()=>{
    if(userNameSignup.value === ""){
        userNameSignUpError.textContent = "Enter your username"
    }
})

userMailSignup.addEventListener("input",()=>{
    emailErrorCheck(userMailSignup.value);
});

// Password Test cases
userPassSignup.addEventListener("focus",()=>{
    if(userMailSignup.value === ""){
        UserMailErrorSignUp.textContent = "Enter your email address"
    }
})
userPassSignup.addEventListener("input",passErrorCheck);


// Confirm Password

confirmPassSignup.addEventListener("focus",()=>{
    if(userPassSignup.value === ""){
        UserPassErrorSignUp.textContent = "First enter your password"
    }
})

confirmPassSignup.addEventListener("input",confirmPassErrorCheck);

// signup functions

userSignupBtn.addEventListener("click",()=>{

    let errorPart = [userNameSignUpError,UserMailErrorSignUp,UserPassErrorSignUp,UserConfirmPassErrorSignUp,UserLocationErrorSignUp];
    for(let i = 0; i <errorPart.length;i++){
        errorPart[i].textContent = "";
    }

    let countError = 0;

    let userNameValue = userNameSignup.value;
    let userMailValue = userMailSignup.value;
    let passwordValue = userPassSignup.value;
    let confirmValue = confirmPassSignup.value;
    
    let locationValue = userDistSignup.value;
    
    let interestArr = [];

    let errorName = ["Username","email address","Password","Confirm Password","or select location"];
    let checkValue = [userNameValue,userMailValue,passwordValue,confirmValue,locationValue,interestArr];
    let respectiveFtn = [userNameErrorCheck,emailErrorCheck,passErrorCheck,confirmPassErrorCheck,zero,interestFtn]
    for(let i = 0; i <checkValue.length; i++){
        if(checkValue[i] === ""){
            errorPart[i].textContent = `Please fill ${errorName[i]} field`;
            countError++;
        }
        else{
            countError+=respectiveFtn[i](checkValue[i]);
        }
    }
    

    if(countError === 0){
        signUpAuth(userNameValue,userMailValue,passwordValue,locationValue,interestArr);
    }

})
function zero(){
    return 0;
}
function interestFtn(interestArr){
    let count = 0;
    userrInterestArrSignup.forEach((element,index)=>{
        if(element.checked){
            count++;
            interestArr.push();
        }
    })
    if(count === 0){
        UserInterestErrorSignUp.textContent = "Choose atleast one"
        return 1;
    }
    else{
        return 0;
    }
}


function signUpAuth(userNameValue,userMailValue,passwordValue,locationValue,interestValue){
    userSignupBtn.innerHTML = 'Signing up <i class="fa fa-spinner fa-spin" "></i>'
    createUserWithEmailAndPassword(auth, userMailValue, passwordValue)
    .then((userCredential) => {
        const user = userCredential.user;

        updateProfile(
            user,{
                displayName : userNameSignup.value
            }
        )
        .then(()=>{
            const userId = userCredential.user.uid;
            const dfRef = ref(db,`users/${userId}/profileDetails`);

            set(dfRef,{
                userName : `${userNameValue}`,
                userMail : `${userMailValue}`,
                userPassword : `${passwordValue}`,
                userLocation : `${locationValue}`,
                userInterest : interestValue

            })
            .then(()=>{
                alert("Signin successful")
            })
        })
        .catch((error)=>{
            alert(`${error}`)
        })
    
    })
    .catch((error)=>{
    alert(`${error}`);
    })
}